<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useAvatarStore } from '@/stores/avatar'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserRole } from '@/api/models/UserRole'
import { useRoute } from 'vue-router'

// 获取store
const groupStore = useGroupStore()
const avatarStore = useAvatarStore()
const route = useRoute()
// 是否显示列表
const showMemberList = ref(true);

// 用于存储角色头像URL的Map
const roleAvatarUrls = reactive(new Map<number, string>());

// 异步获取并缓存角色头像URL
const getRoleAvatarUrl = async (avatarId: number) => {
  if (!avatarId) return '';
  if (roleAvatarUrls.has(avatarId)) {
    return roleAvatarUrls.get(avatarId);
  }
  const url = await avatarStore.getAvatarUrl(avatarId);
  roleAvatarUrls.set(avatarId, url);
  return url;
};

// 初始化角色头像URL
const initRoleAvatarUrls = async () => {
  try {
    console.log("开始初始化角色头像URL");
    console.log("当前群组ID:", groupStore.currentGroupId);
    console.log("当前roleMap的所有key:", Array.from(groupStore.roleMap.keys()));
    console.log("当前roleMap的完整状态:", Array.from(groupStore.roleMap.entries()));

    const roles = groupStore.roleMap.get(groupStore.currentGroupId || 0);
    console.log("获取到的角色列表:", roles);

    if (!roles || roles.length === 0) {
      console.warn("当前群组没有找到角色数据");
      return;
    }
    
    for (const role of roles) {
      if (role.roleId) {
        console.log("正在处理角色:", { roleName: role.roleName, roleId: role.roleId, avatarId: role.avatarId});

        // 获取角色的可用头像列表
        await avatarStore.fetchRoleAvatars(Number(role.roleId));
        console.log(`角色 ${role.roleName} 的可用头像列表已加载`);

        // 如果角色有设置头像，则获取头像URL
        if (role.avatarId) {
          const avatarUrl = await getRoleAvatarUrl(Number(role.avatarId));
          console.log(`角色 ${role.roleName} 的头像URL:`, avatarUrl, `当前roleAvatarUrls状态:`, Array.from(roleAvatarUrls.entries()));
        } else {
          console.log(`角色 ${role.roleName} 未设置头像`);
        }
      }
    }
  } catch (error) {
    console.error("初始化角色头像失败:", error);
  }
};

// 切换列表显示/隐藏
const toggleMemberList = () => {
  showMemberList.value = !showMemberList.value;
};

// 添加新成员
const addMember = async () => {
  try {
    const uid = await ElMessageBox.prompt('请输入要添加的成员UID', '添加成员', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[0-9]+$/,
      inputErrorMessage: 'UID必须是数字'
    });

    if (uid.value && groupStore.currentGroupId) {
      await groupStore.addMember({
        roomId: groupStore.currentGroupId,
        uid: Number(uid.value),
        roleId: 0, // 默认角色ID
        memberType: 3 // 默认为观战
      });
      ElMessage.success('成员添加成功');
      // 刷新成员列表
      await groupStore.fetchMembers(groupStore.currentGroupId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('添加成员失败');
    }
  }
};

// 删除成员
const deleteMember = async (uid: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    if (groupStore.currentGroupId) {
      await groupStore.deleteMember({
        roomId: groupStore.currentGroupId,
        uid: uid
      });
      ElMessage.success('成员删除成功');
      // 刷新成员列表
      await groupStore.fetchMembers(groupStore.currentGroupId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除成员失败');
    }
  }
};

// 向父组件暴露方法
defineExpose({
  toggleMemberList
});

// 初始化群组数据
const initGroupData = async (groupId: number) => {
  groupStore.setCurrentGroupId(groupId)
  await groupStore.fetchGroupRoles(groupId)
  await groupStore.fetchMembers(groupId)
  await initRoleAvatarUrls()
}

// 监听路由参数变化
watch(() => route.params.groupId, async (newGroupId) => {
  if (newGroupId) {
    const id = parseInt(newGroupId as string)
    await initGroupData(id)
  }
})

// 初始化时获取角色列表和成员列表
onMounted(async () => {
  const groupId = route.params.groupId
  if (groupId) {
    const id = parseInt(groupId as string)
    await initGroupData(id)
  }
})
</script>

<template>
  <!-- 右侧列表 -->
  <div class="members-sidebar" v-if="showMemberList">
    <!-- 成员列表 -->
    <div class="list-section">
      <div class="members-header">
        成员列表 - {{ groupStore.members.get(groupStore.currentGroupId || 0)?.length || 0 }}
        <el-button type="primary" size="small" @click="addMember" class="add-member-btn">添加成员</el-button>
      </div>
      <div class="members-groups">
        <div class="member-list">
          <div 
            v-for="member in groupStore.members.get(groupStore.currentGroupId || 0) || []" 
            :key="member.userId" 
            class="member-item"
          >
            <div class="member-avatar">
              <img 
                v-if="member.userId && groupStore.userInfoMap.get(member.userId)?.avatar" 
                :src="groupStore.userInfoMap.get(member.userId)?.avatar" 
                :alt="groupStore.userInfoMap.get(member.userId)?.username"
                class="avatar-image"
              />
            </div>
            <div class="member-info">
              <div class="member-name">{{ member.userId && groupStore.userInfoMap.get(member.userId)?.username || `UID: ${member.userId}` }}</div>
              <div class="member-tag"> {{ useGroupStore().getMemberTypeText(member.memberType || -1) }}</div>
            </div>
            <el-button type="danger" size="small" @click="deleteMember(Number(member.userId))" class="delete-btn">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="list-section">
      <div class="members-header">角色列表 - {{ (groupStore.roleMap.get(Number(route.params.groupId) || 0) || []).length }}</div>
      <div class="members-groups">
        <div class="member-list">
          <div 
            v-for="role in groupStore.roleMap.get(Number(route.params.groupId) || 0) || []" 
            :key="String(role.roleId)" 
            class="member-item"
          >
            <div class="member-avatar">
              <img 
                v-if="role.avatarId && roleAvatarUrls.get(role.avatarId)" 
                :src="roleAvatarUrls.get(Number(role.avatarId)) || ''" 
                :alt="role.roleName"
                class="avatar-image"
              />
            </div>
            <div class="member-info">
              <div class="member-name">{{ role.roleName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.members-sidebar {
  width: 240px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-section {
  display: flex;
  flex-direction: column;
}

.members-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.add-member-btn {
  font-size: 12px;
  padding: 4px 8px;
}

.delete-btn {
  font-size: 12px;
  padding: 4px 8px;
  margin-left: 8px;
  display: none;
}

.member-item:hover .delete-btn {
  display: block;
}

.member-group {
  margin-bottom: 16px;
}

.member-group-name {
  padding: 0 16px;
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.member-list {
  padding: 0 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.member-item:hover {
  background-color: rgba(79, 84, 92, 0.16);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.member-name {
  color: #8e9297;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-name.admin {
  color: #ed4245;
}

.member-tag {
  color: #72767d;
  font-size: 12px;
  margin-top: 2px;
}
</style>