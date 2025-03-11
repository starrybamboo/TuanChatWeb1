<script setup lang="ts">
import {ref, watch} from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { RoleAvatar } from '@/api/models/RoleAvatar';
import type { RoleAvatarCreateRequest, RoleAvatarRequest, UploadUrlReq } from '@/api';
import { tuanchat } from '@/api/instance';
import { useAvatarStore } from '@/stores/avatar';

interface Props {
  roleId: number;
  avatars: RoleAvatar[];
  selectedAvatarId?: number;
  loading?: boolean;
}

interface Emits {
  (e: 'update:selectedAvatarId', avatarId: number): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 头像标题编辑
const editingTitle = ref('');

const avatarStore = useAvatarStore();

// 监听选中的头像ID变化
watch(
  () => props.selectedAvatarId,
  (newAvatarId) => {
    if (newAvatarId) {
      editingTitle.value = avatarStore.getAvatarTitle(newAvatarId) || '';
    } else {
      editingTitle.value = '';
    }
  },
  { immediate: true } // 这里添加第三个参数作为配置对象
);

// 更新头像标题
const handleUpdateTitle = async () => {
  if (!props.selectedAvatarId || !props.roleId) return;
  
  try {
    const updateRequest: RoleAvatarRequest = {
      roleId: props.roleId,
      avatarId: props.selectedAvatarId,
      avatarTitle: editingTitle.value,
      avatarUrl: getAvatarUrl(props.selectedAvatarId),
      spriteUrl: getSpriteUrl(props.selectedAvatarId)
    };
    
    const updateResponse = await tuanchat.avatarController.updateRoleAvatar(updateRequest);
    if (!updateResponse.success) {
      throw new Error('更新头像标题失败');
    }
    
    ElMessage.success('头像标题更新成功');
    emit('refresh');
  } catch (error) {
    console.error('更新头像标题失败:', error);
    ElMessage.error(error instanceof Error ? error.message : '更新头像标题失败');
  }
};

// 处理头像文件选择
const handleAvatarChange = async (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;
  
  // 验证文件类型和大小
  if (!validateFile(file)) return;
  
  try {
    // 上传精灵图和头像
    const { avatarUrl, spriteUrl } = await uploadImages(file);
    
    // 创建头像记录
    if (props.roleId) {
      const avatarId = await createAvatarRecord();
      if (avatarId) {
        await updateAvatarInfo(avatarId, file.name || '未命名', avatarUrl || '', spriteUrl || '');
        emit('refresh');
      }
    }
  } catch (error) {
    console.error('上传头像失败:', error);
    ElMessage.error(error instanceof Error ? error.message : '上传头像失败');
  }
};

// 验证文件
const validateFile = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请选择图片文件');
    return false;
  }
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB');
    return false;
  }
  
  return true;
};

// 上传图片
const uploadImages = async (file: File) => {
  // 上传精灵图
  const spriteUploadReq: UploadUrlReq = {
    fileName: `sprite_${file.name}`,
    scene: 2
  };
  
  const spriteResponse = await tuanchat.ossController.getUploadUrl(spriteUploadReq);
  if (!spriteResponse.data?.uploadUrl) {
    throw new Error('获取精灵图上传地址失败');
  }
  
  await uploadFile(spriteResponse.data.uploadUrl, file);
  
  // 上传头像
  const avatarUploadReq: UploadUrlReq = {
    fileName: `avatar_${file.name}`,
    scene: 1
  };
  
  const avatarResponse = await tuanchat.ossController.getUploadUrl(avatarUploadReq);
  if (!avatarResponse.data?.uploadUrl) {
    throw new Error('获取头像上传地址失败');
  }
  
  await uploadFile(avatarResponse.data.uploadUrl, file);
  
  return {
    avatarUrl: avatarResponse.data.downloadUrl,
    spriteUrl: spriteResponse.data.downloadUrl
  };
};

// 上传文件到指定URL
const uploadFile = async (url: string, file: File) => {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });
  
  if (!response.ok) {
    throw new Error('文件上传失败');
  }
};

// 创建头像记录
const createAvatarRecord = async () => {
  const createRequest: RoleAvatarCreateRequest = {
    roleId: props.roleId
  };
  
  const createResponse = await tuanchat.avatarController.setRoleAvatar(createRequest);
  if (!createResponse.success || !createResponse.data) {
    throw new Error('创建头像记录失败');
  }
  
  return createResponse.data;
};

// 更新头像信息
const updateAvatarInfo = async (avatarId: number, title: string, avatarUrl: string, spriteUrl: string) => {
  const updateRequest: RoleAvatarRequest = {
    roleId: props.roleId,
    avatarId: avatarId,
    avatarTitle: title,
    avatarUrl: avatarUrl,
    spriteUrl: spriteUrl
  };
  
  const updateResponse = await tuanchat.avatarController.updateRoleAvatar(updateRequest);
  if (!updateResponse.success) {
    throw new Error('更新头像信息失败');
  }
  
  ElMessage.success('头像上传成功');
};

// 获取头像URL
const getAvatarUrl = (avatarId: number) => {
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
};

// 获取精灵图URL
const getSpriteUrl = (avatarId: number) => {
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.spriteUrl || '';
};
</script>

<template>
  <div class="avatar-selector">
    <div class="current-avatar-container">
      <el-avatar 
        :size="100" 
        :src="getAvatarUrl(props.selectedAvatarId || 0)"
        class="current-avatar"
        shape="square"
      >
        R
      </el-avatar>
      
      <div class="avatar-title-edit">
        <el-input
          v-model="editingTitle"
          size="small"
          placeholder="请输入头像标题"
          :disabled="!props.selectedAvatarId"
        />
        <el-button 
          type="primary" 
          size="small" 
          :disabled="!props.selectedAvatarId || !editingTitle"
          @click="handleUpdateTitle"
        >
          更新标题
        </el-button>
      </div>
    </div>
    
    <div style="display: flex; gap: 20px;">
      <div class="avatar-list" v-loading="props.loading">
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
            v-for="avatar in props.avatars" 
            :key="avatar.avatarId" 
            class="avatar-item"
            :class="{ 'selected': props.selectedAvatarId === avatar.avatarId }"
            @click="emit('update:selectedAvatarId', avatar.avatarId || 0)"
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
      <div class="sprite-display" v-if="getSpriteUrl(props.selectedAvatarId || 0)">
        <h4>精灵图预览</h4>
        <img :src="getSpriteUrl(props.selectedAvatarId || 0)" class="sprite-image" alt="精灵图预览" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.avatar-title-edit {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  width: 100%;
  max-width: 300px;
}

.avatar-title-edit .el-input {
  flex: 1;
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
</style>