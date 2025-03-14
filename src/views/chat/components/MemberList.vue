<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useRoleStore } from '@/stores/role'
import { useAvatarStore } from '@/stores/avatar'

// 获取store
const groupStore = useGroupStore()
const roleStore = useRoleStore()
const avatarStore = useAvatarStore()

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
  const roles = Array.from(groupStore.roleMap.values());
  for (const role of roles) {
    if (role.roleId) {
      // 获取角色的可用头像列表
      await avatarStore.fetchRoleAvatars(role.roleId);
      // 如果角色有设置头像，则获取头像URL
      if (role.avatarId) {
        await getRoleAvatarUrl(role.avatarId);
      }
    }
  }
};

// 切换列表显示/隐藏
const toggleMemberList = () => {
  showMemberList.value = !showMemberList.value;
};

// 向父组件暴露方法
defineExpose({
  toggleMemberList
});

// 初始化时获取角色列表和成员列表
onMounted(async () => {
  await roleStore.fetchRoles();
  // 如果有当前群组ID，则获取成员列表
  if (groupStore.currentGroupId) {
    await groupStore.fetchMembers(groupStore.currentGroupId);
    await initRoleAvatarUrls();
  }
});
</script>

<template>
  <!-- 右侧列表 -->
  <div class="members-sidebar" v-if="showMemberList">
    <!-- 成员列表 -->
    <div class="list-section">
      <div class="members-header">成员列表 - {{ groupStore.members.length }}</div>
      <div class="members-groups">
        <div class="member-list">
          <div 
            v-for="member in groupStore.members" 
            :key="member.uid" 
            class="member-item"
          >
            <div class="member-avatar">
              <img 
                v-if="member.uid && groupStore.userInfoMap.get(member.uid)?.avatar" 
                :src="groupStore.userInfoMap.get(member.uid)?.avatar" 
                :alt="groupStore.userInfoMap.get(member.uid)?.username"
                class="avatar-image"
              />
              <span v-else>👤</span>
            </div>
            <div class="member-info">
              <div class="member-name">{{ member.uid && groupStore.userInfoMap.get(member.uid)?.username || `UID: ${member.uid}` }}</div>
              <div class="member-tag">角色ID: {{ member.roleId }} | {{ useGroupStore().getMemberTypeText(member.memberType || -1) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="list-section">
      <div class="members-header">角色列表 - {{ Array.from(groupStore.roleMap.values()).length }}</div>
      <div class="members-groups">
        <div class="member-list">
          <div 
            v-for="role in Array.from(groupStore.roleMap.values())" 
            :key="role.roleId" 
            class="member-item"
          >
            <div class="member-avatar">
              <img 
                v-if="role.avatarId && roleAvatarUrls.get(role.avatarId)" 
                :src="roleAvatarUrls.get(role.avatarId) || ''" 
                :alt="role.roleName"
                class="avatar-image"
              />
              <span v-else>👤</span>
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
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
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

// 获取成员类型文字说明
const getMemberTypeText = (type: number): string => {
  switch (type) {
    case 1:
      return '主持人';
    case 2:
      return '玩家';
    case 3:
      return '观战';
    default:
      return `类型: ${type}`;
  }
};