<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import type { UserRole } from '@/api/models/UserRole';
import { useAvatarStore } from '@/stores/avatar';

interface Props {
  roles: UserRole[];
  activeRoleId: number | null;
  loading?: boolean;
  isEditing?: boolean;
}

interface Emits {
  (e: 'select', roleId: number): void;
  (e: 'create'): void;
  (e: 'saveBeforeSwitch', roleId: number): void;
  (e: 'cancelAndSwitch', roleId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const avatarStore = useAvatarStore();

const searchQuery = ref('');

// 处理角色选择
const handleRoleSelect = async (roleId: number) => {
  if (props.isEditing) {
    try {
      await ElMessageBox.confirm(
        '是否保存当前编辑的内容？',
        '切换角色',
        {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
        }
      );
      // 用户点击保存
      emit('saveBeforeSwitch', roleId);
    } catch (error) {
      if (error === 'cancel') {
        // 用户点击不保存
        emit('cancelAndSwitch', roleId);
      }
    }
  } else {
    // 非编辑状态直接切换
    emit('select', roleId);
  }
};

// 过滤角色列表
const filteredRoles = computed(() => {
  if (!searchQuery.value) return props.roles;
  return props.roles.filter(role => 
    (role.roleName && role.roleName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

// 获取头像URL
const getAvatarUrl = (avatarId: number | undefined) => {
  if (!avatarId) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  return avatarStore.getAvatarUrl(avatarId) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
};
</script>

<template>
  <div class="role-sidebar">
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索角色"
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>
    
    <div class="role-list">
      <el-empty v-if="filteredRoles.length === 0 && !loading" description="暂无角色数据" />
      
      <div 
        v-for="role in filteredRoles" 
        :key="role.roleId" 
        class="role-item"
        :class="{ 'active': role.roleId === activeRoleId }"
        @click="role.roleId && handleRoleSelect(role.roleId)"
      >
        <div class="role-avatar">
          <el-avatar 
            :size="40" 
            :src="getAvatarUrl(role.avatarId)"
            shape="square"
          >
            {{ role.roleName ? role.roleName.charAt(0) : 'R' }}
          </el-avatar>
        </div>
        <div class="role-info">
          <div class="role-name">{{ role.roleName || '未命名角色' }}</div>
          <div class="role-preview">{{ role.description || '暂无描述' }}</div>
        </div>
        <div class="role-meta">
          <div class="role-time">{{ role.createTime ? new Date(role.createTime).toLocaleDateString() : '未知' }}</div>
        </div>
      </div>
      
      <!-- 添加角色按钮 -->
      <div class="role-item add-role-item" @click="emit('create')">
        <div class="role-avatar">
          <el-avatar :size="40" :icon="Plus" shape="circle" />
        </div>
        <div class="role-info">
          <div class="role-name">创建新角色</div>
          <div class="role-preview">点击创建一个新的角色</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-sidebar {
  width: 240px;
  background-color: #2f3136;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-container {
  padding: 8px;
}

.search-input {
  border-radius: 4px;
  background-color: #202225;
  border: none;
}

.role-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: all 0.2s ease;
}

.role-item:hover {
  background-color: #32353b;
}

.role-item.active {
  background-color: #393c43;
}

.add-role-item {
  border: 2px dashed #4f545c;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.add-role-item:hover {
  border-color: #5865f2;
  opacity: 1;
}

.role-avatar {
  margin-right: 12px;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.role-preview {
  font-size: 12px;
  color: #8e9297;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
}

.role-time {
  font-size: 11px;
  color: #8e9297;
}

:deep(.el-input__wrapper) {
  background-color: #202225;
  box-shadow: none;
  border: none;
}

:deep(.el-input__inner) {
  color: #dcddde;
}

:deep(.el-input__inner::placeholder) {
  color: #8e9297;
}
</style>