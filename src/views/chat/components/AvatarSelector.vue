<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAvatarStore } from '@/stores/avatar';
import { ElMessage } from 'element-plus';
import type { RoleAvatar } from '@/api';

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
    const roleAvatars = avatarStore.getRoleAvatars(props.roleId) || [];
    avatars.value = roleAvatars.map(avatar => ({
      ...avatar,
      avatarId: avatar.avatarId || 0
    }));
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
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="avatar-selector-dialog"
  >
    <div class="avatar-grid" v-loading="loading">
      <template v-if="avatars.length > 0">
        <div
          v-for="avatar in avatars"
          :key="String(avatar.avatarId)"
          class="avatar-item"
          @click="handleSelectAvatar(Number(avatar.avatarId))"
        >
          <div class="avatar-wrapper">
            <el-avatar
              :size="100"
              :src="avatarStore.getAvatarUrl(Number(avatar.avatarId))"
              fit="cover"
              shape="square"
            />
            <div class="avatar-hover-effect"></div>
          </div>
          <div class="avatar-title">{{ avatar.avatarTitle || '未命名' }}</div>
        </div>
      </template>
      <el-empty v-else description="暂无可用头像" class="custom-empty" />
    </div>
  </el-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.avatar-selector-dialog {
  :deep(.el-dialog) {
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0 !important;
    overflow: hidden;
  }

  :deep(.el-dialog__title) {
    color: #ffffff;
    font-family: 'Noto Serif SC', serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  }

  :deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px 32px;
    margin: 0;
    background: rgba(255, 255, 255, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  :deep(.el-dialog__body) {
    padding: 32px;
  }

  :deep(.el-dialog__headerbtn) {
    top: 24px;
    right: 24px;
    .el-dialog__close {
      color: rgba(255, 255, 255, 0.8);
      font-size: 20px;
      transition: all 0.3s ease;
      &:hover {
        color: #ffffff;
        transform: rotate(90deg);
      }
    }
  }
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 32px;
  padding: 8px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);

    .avatar-hover-effect {
      opacity: 1;
    }
  }
  .avatar-title {
      color: #000000;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;

  :deep(.el-avatar) {
    border: 3px solid rgba(255, 255, 255, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
  }
}

.avatar-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  border-radius: 16px;
}

.avatar-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  transition: all 0.3s ease;
  padding: 0 8px;
}

.custom-empty {
  :deep(.el-empty__description) {
    color: rgba(255, 255, 255, 0.7);
    font-family: 'Noto Serif SC', serif;
    font-size: 16px;
    margin-top: 16px;
  }

  :deep(.el-empty__image) {
    opacity: 0.7;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>