<script setup lang="ts">
import { ref } from 'vue';
import { Check, Close, Plus } from '@element-plus/icons-vue';
import type { UserRole } from '@/api/models/UserRole';
import type { RoleAvatar } from '@/api/models/RoleAvatar';

interface Props {
  role: UserRole | null;
  avatars: RoleAvatar[];
  loading?: boolean;
  saveLoading?: boolean;
  avatarLoading?: boolean;
}

interface Emits {
  (e: 'save', role: UserRole): void;
  (e: 'cancel'): void;
  (e: 'uploadAvatar', file: File): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 编辑表单数据
const editForm = ref<UserRole>({ 
  userId: 0,
  roleId: 0,
  roleName: '',
  description: '',
  ...(props.role || {})
});

// 处理头像文件选择
const handleAvatarChange = (file: File) => {
  if (!file) return;
  emit('uploadAvatar', file);
};

// 获取头像URL
const getAvatarUrl = (avatarId: number | undefined) => {
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
};

// 获取头像标题
const getAvatarTitle = (avatarId: number | undefined) => {
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.avatarTitle || '默认头像';
};

// 获取精灵图URL
const getSpriteUrl = (avatarId: number | undefined) => {
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.spriteUrl || '';
};

// 保存表单
const handleSave = () => {
  emit('save', editForm.value);
};
</script>

<template>
  <div class="role-form" v-loading="saveLoading">
    <div class="form-header">
      <h3 class="edit-title">编辑角色</h3>
    </div>
    
    <div class="form-content">
      <el-form label-position="top" :model="editForm">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        
        <el-form-item label="角色描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入角色描述"
          />
        </el-form-item>
        
        <el-form-item label="角色头像">
          <div class="avatar-selector">
            <div class="current-avatar-container">
              <el-avatar 
                :size="100" 
                :src="getAvatarUrl(editForm.avatarId)"
                class="current-avatar"
                shape="circle"
              >
                {{ editForm.roleName ? editForm.roleName.charAt(0) : 'R' }}
              </el-avatar>
              
              <div class="avatar-title">{{ getAvatarTitle(editForm.avatarId) }}</div>
            </div>
            
            <div style="display: flex; gap: 20px;">
              <div class="avatar-list" v-loading="avatarLoading">
                <p class="avatar-hint">选择一个头像：</p>
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    @change="handleAvatarChange"
                  >
                    <el-button type="primary" :icon="Plus">上传新头像</el-button>
                  </el-upload>
                </div>
                <div class="avatar-grid">
                  <div 
                    v-for="avatar in avatars" 
                    :key="avatar.avatarId" 
                    class="avatar-item"
                    :class="{ 'selected': editForm.avatarId === avatar.avatarId }"
                    @click="editForm.avatarId = avatar.avatarId"
                  >
                    <el-avatar 
                      :size="50" 
                      :src="avatar.avatarUrl || ''"
                      shape="square"
                    ></el-avatar>
                    <div class="avatar-item-title">{{ avatar.avatarTitle || '未命名' }}</div>
                  </div>
                </div>
              </div>

              <!-- 显示精灵图 -->
              <div class="sprite-display" v-if="getSpriteUrl(editForm.avatarId)">
                <h4>精灵图预览</h4>
                <img :src="getSpriteUrl(editForm.avatarId)" class="sprite-image" alt="精灵图预览" />
              </div>
            </div>
          </div>
        </el-form-item>
        
        <div class="form-actions">
          <el-button type="primary" :icon="Check" :loading="saveLoading" @click="handleSave">保存</el-button>
          <el-button :icon="Close" @click="emit('cancel')">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.role-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
  height: 100%;
  overflow: hidden;
}

.form-header {
  height: 48px;
  background-color: #36393f;
  border-bottom: 1px solid #202225;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.form-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 48px);
}

.edit-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.avatar-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.current-avatar {
  border: 3px solid #5865f2;
}

.avatar-title {
  font-size: 14px;
  color: #dcddde;
  text-align: center;
  margin-top: 8px;
}

.avatar-list {
  margin-top: 8px;
  flex: 1;
}

.avatar-hint {
  font-size: 14px;
  color: #8e9297;
  margin-bottom: 12px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.avatar-upload {
  margin: 16px 0;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-upload {
  width: 100%;
}

.avatar-uploader .el-button {
  width: 100%;
  margin-bottom: 16px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.avatar-item:hover {
  background-color: #4f545c;
}

.avatar-item.selected {
  background-color: #5865f2;
}

.avatar-item-title {
  font-size: 12px;
  color: #dcddde;
  text-align: center;
  margin-top: 6px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sprite-display {
  width: 300px;
  margin-top: 0;
  padding: 16px;
  background-color: #202225;
  border-radius: 8px;
  border: 1px solid #36393f;
  align-self: flex-start;
}

.sprite-display h4 {
  font-size: 14px;
  color: #dcddde;
  margin-bottom: 12px;
}

.sprite-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  color: #dcddde;
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

:deep(.el-textarea__inner) {
  background-color: #202225;
  color: #dcddde;
  border: none;
}

:deep(.el-textarea__inner::placeholder) {
  color: #8e9297;
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

:deep(.el-skeleton) {
  --el-skeleton-color: #40444b;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  background-color: #40444b;
  border-color: #202225;
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  background-color: #4f545c;
  border-color: #5d636b;
}

:deep(.el-upload-dragger .el-icon) {
  font-size: 48px;
  color: #8e9297;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  color: #dcddde;
}

:deep(.el-upload__tip) {
  color: #8e9297;
}
</style>