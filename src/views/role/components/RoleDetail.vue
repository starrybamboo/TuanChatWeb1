<script setup lang="ts">
import { ChatDotRound, Setting, Edit, Delete } from '@element-plus/icons-vue';
import type { UserRole } from '@/api/models/UserRole';

interface Props {
  role: UserRole;
  avatarUrl?: string;
}

interface Emits {
  (e: 'edit', role: UserRole): void;
  (e: 'delete', role: UserRole): void;
  (e: 'togglePanel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="role-detail">
    <div class="detail-header">
      <div class="detail-title">
        <el-avatar 
          :size="24" 
          :src="avatarUrl"
          shape="square"
        >
          {{ role.roleName ? role.roleName.charAt(0) : 'R' }}
        </el-avatar>
        <span>{{ role.roleName || '未命名角色' }}</span>
      </div>
      <div class="detail-actions">
        <el-button :icon="ChatDotRound" circle @click="emit('togglePanel')" />
        <el-button :icon="Setting" circle @click="emit('edit', role)" />
      </div>
    </div>
    
    <div class="detail-content">
      <el-card class="role-card">
        <div class="role-card-header">
          <div class="role-avatar">
            <el-avatar 
              :size="64" 
              :src="avatarUrl"
              shape="square"
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
          <el-button type="primary" text :icon="Edit" @click="emit('edit', role)">编辑</el-button>
          <el-button type="danger" text :icon="Delete" @click="emit('delete', role)">删除</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.role-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  height: 48px;
  background-color: #36393f;
  border-bottom: 1px solid #202225;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 48px);
}

.role-card {
  background-color: #2f3136;
  border-radius: 8px;
  border: 1px solid #202225;
}

.role-card-header {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #202225;
}

.role-card-header .role-avatar {
  margin-right: 16px;
}

.role-card-header .role-info {
  flex: 1;
}

.role-card-header .role-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.role-card-header .role-create-time {
  font-size: 12px;
  color: #8e9297;
}

.role-card-body {
  padding: 16px;
}

.role-description {
  font-size: 14px;
  color: #dcddde;
  line-height: 1.6;
}

.role-card-footer {
  padding: 12px 16px;
  border-top: 1px solid #202225;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-button) {
  --el-button-bg-color: #4f545c;
  --el-button-border-color: #4f545c;
  --el-button-hover-bg-color: #686d73;
  --el-button-hover-border-color: #686d73;
  --el-button-active-bg-color: #686d73;
  --el-button-active-border-color: #686d73;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #5865f2;
  --el-button-border-color: #5865f2;
  --el-button-hover-bg-color: #4752c4;
  --el-button-hover-border-color: #4752c4;
  --el-button-active-bg-color: #3c45a5;
  --el-button-active-border-color: #3c45a5;
}
</style>