<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoleStore } from '@/stores/role';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';
import type { UserRole } from '@/api/models/UserRole';

const roleStore = useRoleStore();
const userStore = useUserStore();
const roles = ref<UserRole[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true;
  try {
    // 如果用户已登录且有用户信息，则从用户信息中获取角色列表
    if (userStore.userInfo && userStore.userInfo.roles) {
      roles.value = userStore.userInfo.roles;
    } else {
      // 否则通过角色API获取角色列表
      await roleStore.fetchRoles();
      roles.value = roleStore.roles;
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 创建新角色
const createRole = async () => {
  try {
    const newRole = await roleStore.createRole();
    if (newRole) {
      ElMessage.success('创建角色成功');
      await fetchRoles();
    }
  } catch (error) {
    ElMessage.error('创建角色失败');
    console.error(error);
  }
};

// 编辑角色
const editRole = (role: UserRole) => {
  // 这里可以跳转到角色编辑页面或打开编辑对话框
  console.log('编辑角色', role);
};

// 删除角色
const deleteRole = async (role: UserRole) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.roleName || '未命名角色'}" 吗？`,
      '删除角色',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (role.roleId) {
      const success = await roleStore.deleteRole(role.roleId);
      if (success) {
        ElMessage.success('删除角色成功');
        await fetchRoles();
      } else {
        ElMessage.error(roleStore.error || '删除角色失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除角色失败');
      console.error(error);
    }
  }
};

// 过滤角色列表
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value;
  return roles.value.filter(role => 
    (role.roleName && role.roleName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

onMounted(() => {
  fetchRoles();
});
</script>

<template>
  <div class="role-container">
    <div class="role-header">
      <h1>角色管理</h1>
      <div class="role-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-button type="primary" :icon="Plus" @click="createRole">创建角色</el-button>
      </div>
    </div>
    
    <div class="role-content">
      <el-empty v-if="filteredRoles.length === 0 && !loading" description="暂无角色数据" />
      
      <el-row :gutter="20" v-else>
        <el-col 
          v-for="role in filteredRoles" 
          :key="role.roleId" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6" 
          :xl="4"
          class="role-card-col"
        >
          <el-card class="role-card" :body-style="{ padding: '0' }">
            <div class="role-card-header">
              <div class="role-avatar">
                <el-avatar 
                  :size="64" 
                  :src="role.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                >
                  {{ role.roleName ? role.roleName.charAt(0) : 'R' }}
                </el-avatar>
              </div>
              <div class="role-info">
                <h3 class="role-name">{{ role.roleName || '未命名角色' }}</h3>
                <p class="role-create-time">创建时间: {{ role.createTime ? new Date(role.createTime).toLocaleDateString() : '未知' }}</p>
              </div>
            </div>
            
            <div class="role-card-body">
              <p class="role-description">{{ role.description || '暂无描述' }}</p>
            </div>
            
            <div class="role-card-footer">
              <el-button type="primary" text :icon="Edit" @click="editRole(role)">编辑</el-button>
              <el-button type="danger" text :icon="Delete" @click="deleteRole(role)">删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <el-backtop :right="20" :bottom="20" />
  </div>
</template>

<style scoped>
.role-container {
  padding: 20px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.role-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.role-content {
  margin-top: 20px;
}

.role-card-col {
  margin-bottom: 20px;
}

.role-card {
  height: 100%;
  transition: all 0.3s;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.role-card-header {
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.role-avatar {
  margin-right: 15px;
}

.role-info {
  flex: 1;
}

.role-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-create-time {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.role-card-body {
  padding: 15px;
  min-height: 80px;
}

.role-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-card-footer {
  padding: 10px 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
}
</style>