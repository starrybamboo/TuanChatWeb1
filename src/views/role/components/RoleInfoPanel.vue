<script setup lang="ts">
import { useAvatarStore } from '@/stores/avatar';
import type { UserRole } from '@/api/models/UserRole';
import { ElSkeleton } from 'element-plus';

defineProps({
  role: {
    type: Object as () => UserRole | null,
    required: true
  },
  avatarLoading: {
    type: Boolean,
    default: false
  }
});

const avatarStore = useAvatarStore();
</script>

<template>
  <div class="right-panel">
    <div class="panel-header">角色信息</div>
    <div class="panel-content">
      <div class="panel-section">
        <h4>角色ID</h4>
        <p>{{ role?.roleId || '无' }}</p>
      </div>
      <div class="panel-section">
        <h4>创建时间</h4>
        <p>{{ role?.createTime ? new Date(role.createTime).toLocaleString() : '未知' }}</p>
      </div>
      <div class="panel-section">
        <h4>更新时间</h4>
        <p>{{ role?.updateTime ? new Date(role.updateTime).toLocaleString() : '未知' }}</p>
      </div>
      <div class="panel-section">
        <h4>头像ID</h4>
        <p>{{ role?.avatarId || '无' }}</p>
      </div>
      <div class="panel-section">
        <h4>头像标题</h4>
        <p>{{ role?.avatarId ? avatarStore.getAvatarTitle(role.avatarId) : '无' }}</p>
      </div>
      <div class="panel-section">
        <h4>精灵图URL</h4>
        <p>{{ role?.avatarId ? avatarStore.getSpriteUrl(role.avatarId) : '无' }}</p>
      </div>
      <div class="panel-section" v-if="avatarLoading">
        <el-skeleton :rows="1" animated />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 右侧面板样式 */
.right-panel {
  width: 240px;
  background-color: #2f3136;
  border-left: 1px solid #202225;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #fff;
  border-bottom: 1px solid #202225;
  background-color: #2f3136;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section h4 {
  font-size: 12px;
  color: #8e9297;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.panel-section p {
  font-size: 14px;
  color: #dcddde;
  word-break: break-all;
}

:deep(.el-skeleton) {
  --el-skeleton-color: #40444b;
}
</style>