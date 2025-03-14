<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAvatarStore } from '@/stores/avatar';
import { ElMessage } from 'element-plus';
import type { RoleAvatar } from '@/api/models/RoleAvatar';

interface Props {
  show: boolean;
  roleId?: number;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'select', avatarId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const avatarStore = useAvatarStore();

const loading = ref(false);
const avatars = ref<RoleAvatar[]>([]);

// 加载角色头像
const loadAvatars = async () => {
  if (!props.roleId) return;
  
  loading.value = true;
  try {
    await avatarStore.fetchRoleAvatars(props.roleId);
    avatars.value = avatarStore.getRoleAvatars(props.roleId) || [];
  } catch (error) {
    ElMessage.error('加载头像失败');
  } finally {
    loading.value = false;
  }
};

// 选择头像
const handleSelectAvatar = (avatarId: number) => {
  emit('select', avatarId);
  emit('update:show', false);
};

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false);
};

// 监听显示状态变化
watch(() => props.show, async (newVal) => {
  if (newVal && props.roleId) {
    await loadAvatars();
  }
});
</script>

<template>
  <el-dialog
    v-model="props.show"
    title="选择头像"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="avatar-grid" v-loading="loading">
      <template v-if="avatars.length > 0">
        <div
          v-for="avatar in avatars"
          :key="avatar.avatarId"
          class="avatar-item"
          @click="handleSelectAvatar(avatar.avatarId!)"
        >
          <el-avatar
            :size="80"
            :src="avatarStore.getAvatarUrl(avatar.avatarId!)"
            fit="cover"
          />
          <div class="avatar-title">{{ avatar.avatarTitle || '未命名' }}</div>
        </div>
      </template>
      <el-empty v-else description="暂无可用头像" />
    </div>
  </el-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

:deep(.el-dialog) {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  z-index: 9999;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 !important;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 24px;
  padding: 8px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  animation: fadeIn 0.3s ease-out;
}

.avatar-item:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

:deep(.el-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.avatar-item:hover :deep(.el-avatar) {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.avatar-title {
  margin-top: 12px;
  font-family: 'Noto Serif SC', serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

:deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Noto Serif SC', serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>