<script setup lang="ts">
import {ref, watch, nextTick} from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { RoleAvatar } from '@/api/models/RoleAvatar';
import type { RoleAvatarCreateRequest, RoleAvatarRequest, UploadUrlReq } from '@/api';
import { tuanchat } from '@/api/instance';
import { useAvatarStore } from '@/stores/avatar';
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

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

// 裁剪相关的状态
const showCropDialog = ref(false);
const currentFile = ref<File | null>(null);
const cropBoxData = ref<any>(null);
const cropper = ref<any>(null);
const cropperReady = ref(false);

// 裁剪器配置
const cropperOption = ref({
  img: '',
  outputSize: 1,
  outputType: 'jpeg',
  info: true,
  canScale: true,
  autoCrop: true,
  autoCropWidth: 300,
  autoCropHeight: 300,
  fixed: true,
  fixedNumber: [1, 1],
  full: false,
  fixedBox: false,
  canMove: true,
  canMoveBox: true,
  original: false,
  centerBox: true,
  high: true,
  infoTrue: true,
  maxImgSize: 2000,
  enlarge: 1,
  mode: 'contain'
});

// 记录裁剪框位置
const saveCropBoxData = () => {
  if (cropper.value && cropperReady.value) {
    cropBoxData.value = cropper.value.getCropBoxData();
  }
};

// 恢复裁剪框位置
const restoreCropBoxData = () => {
  if (cropper.value && cropBoxData.value && cropperReady.value) {
    cropper.value.setCropBoxData(cropBoxData.value);
  }
};

// 处理裁剪器就绪
const handleCropperReady = () => {
  cropperReady.value = true;
  nextTick(() => {
    restoreCropBoxData();
  });
};
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

// 监听avatars数组变化，确保在数据刷新后能更新标题
watch(
  () => props.avatars,
  (newAvatars) => {
    console.log('AvatarUploader: avatars changed', newAvatars);
    console.log('AvatarUploader: avatars length', newAvatars.length);
    console.log('AvatarUploader: roleId', props.roleId);
    
    // 检查头像数组是否为空或未定义
    if (newAvatars.length === 0) {
      console.warn('AvatarUploader: 没有可用的头像数据');
    }
    
    if (props.selectedAvatarId) {
      // 当avatars数据更新时，重新获取当前选中头像的标题
      editingTitle.value = avatarStore.getAvatarTitle(props.selectedAvatarId) || '';
    }
  },
  { deep: true, immediate: true } // 添加immediate:true确保组件挂载时立即执行
);

// 删除头像
const handleDeleteAvatar = async (avatar: RoleAvatar) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除头像 "${avatar.avatarTitle || '未命名头像'}" 吗？`,
      '删除头像',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await tuanchat.avatarController.deleteRoleAvatar(avatar.avatarId!);

    emit('refresh');
    if (props.selectedAvatarId === avatar.avatarId) {
      emit('update:selectedAvatarId', 0);
    }
    ElMessage.success('删除头像成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除头像失败');
    }
  }
};

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
  
  // 重置裁剪器状态
  cropperReady.value = false;
  
  // 显示裁剪对话框
  currentFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperOption.value.img = e.target?.result as string;
    showCropDialog.value = true;
  };
  reader.readAsDataURL(file);
};

const isProcessing = ref(false);

// 处理裁剪完成
const handleCropFinish = async () => {
  if (!currentFile.value || !cropper.value || isProcessing.value) return;
  
  isProcessing.value = true;
  try {
    // 保存裁剪框位置
    saveCropBoxData();
    
    // 获取裁剪后的图片blob数据
    const cropBlob = await new Promise<Blob>((resolve) => {
      cropper.value.getCropBlob((blob: Blob) => resolve(blob));
    });
    
    // 转换为File对象
    const croppedFile = new File([cropBlob], `avatar_${currentFile.value.name}`, {
      type: cropBlob.type
    });
    
    // 上传精灵图和头像（使用原始图片作为精灵图）
    const { avatarUrl, spriteUrl } = await uploadImages(croppedFile, currentFile.value);
    
    // 创建头像记录
    if (props.roleId) {
      const avatarId = await createAvatarRecord();
      if (avatarId) {
        await updateAvatarInfo(avatarId, currentFile.value.name || '未命名', avatarUrl || '', spriteUrl || '');
        emit('refresh');
      }
    }
    
    // 关闭裁剪对话框
    showCropDialog.value = false;
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
const uploadImages = async (avatarFile: File, spriteFile: File) => {
  // 上传精灵图（使用原始图片）
  const spriteUploadReq: UploadUrlReq = {
    fileName: `sprite_${spriteFile.name}`,
    scene: 2
  };
  
  const spriteResponse = await tuanchat.ossController.getUploadUrl(spriteUploadReq);
  if (!spriteResponse.data?.uploadUrl) {
    throw new Error('获取精灵图上传地址失败');
  }
  
  await uploadFile(spriteResponse.data.uploadUrl, spriteFile);
  
  // 上传头像（使用裁剪后的图片）
  const avatarUploadReq: UploadUrlReq = {
    fileName: `avatar_${avatarFile.name}`,
    scene: 1
  };
  
  const avatarResponse = await tuanchat.ossController.getUploadUrl(avatarUploadReq);
  if (!avatarResponse.data?.uploadUrl) {
    throw new Error('获取头像上传地址失败');
  }
  
  await uploadFile(avatarResponse.data.uploadUrl, avatarFile);
  
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
  // 首先尝试从avatarStore获取，这样即使props.avatars没有正确加载，也能显示头像
  const storeUrl = avatarStore.getAvatarUrl(avatarId);
  if (storeUrl) return storeUrl;
  
  // 如果store中没有，再从props.avatars中查找
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
};

// 获取精灵图URL
const getSpriteUrl = (avatarId: number) => {
  // 首先尝试从avatarStore获取
  const storeUrl = avatarStore.getSpriteUrl(avatarId);
  if (storeUrl) return storeUrl;
  
  // 如果store中没有，再从props.avatars中查找
  const avatar = props.avatars.find(a => a.avatarId === avatarId);
  return avatar?.spriteUrl || ''
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
        <div class="avatar-grid" v-if="props.avatars && props.avatars.length > 0">
          <div 
            v-for="avatar in props.avatars" 
            :key="avatar.avatarId" 
            class="avatar-item"
            :class="{ 'selected': props.selectedAvatarId === avatar.avatarId }"
            @click="emit('update:selectedAvatarId', avatar.avatarId || 0)"
          >
            <el-avatar 
              :size="50" 
              :src="getAvatarUrl(avatar.avatarId || 0)"
              shape="square"
            >
              {{ avatar.avatarTitle ? avatar.avatarTitle.charAt(0) : 'A' }}
            </el-avatar>
            <div class="avatar-item-title">{{ avatar.avatarTitle || '未命名' }}</div>
            <el-icon class="delete-icon" @click.stop="handleDeleteAvatar(avatar)">
              <Delete />
            </el-icon>
          </div>
        </div>
        <div v-else class="empty-avatar-grid">
          <p>暂无头像，请上传新头像</p>
          <p class="debug-info">传入的头像数组: {{ props.avatars }}</p>
          <p class="debug-info">角色ID: {{ props.roleId }}</p>
        </div>
      </div>

      <!-- 显示精灵图 -->
      <div class="sprite-display" v-if="getSpriteUrl(props.selectedAvatarId || 0)">
        <h4>精灵图预览</h4>
        <img :src="getSpriteUrl(props.selectedAvatarId || 0)" class="sprite-image" alt="精灵图预览" />
      </div>
    </div>
  </div>
  <!-- 裁剪对话框 -->
  <el-dialog
    v-model="showCropDialog"
    title="裁剪头像"
    width="600px"
    destroy-on-close
  >
    <div style="height: 400px;">
      <vue-cropper
        ref="cropper"
        :img="cropperOption.img"
        :outputSize="cropperOption.outputSize"
        :outputType="cropperOption.outputType"
        :info="cropperOption.info"
        :canScale="cropperOption.canScale"
        :autoCrop="cropperOption.autoCrop"
        :autoCropWidth="cropperOption.autoCropWidth"
        :autoCropHeight="cropperOption.autoCropHeight"
        :fixed="cropperOption.fixed"
        :fixedNumber="cropperOption.fixedNumber"
        :full="cropperOption.full"
        :fixedBox="cropperOption.fixedBox"
        :canMove="cropperOption.canMove"
        :canMoveBox="cropperOption.canMoveBox"
        :original="cropperOption.original"
        :centerBox="cropperOption.centerBox"
        :high="cropperOption.high"
        :infoTrue="cropperOption.infoTrue"
        :maxImgSize="cropperOption.maxImgSize"
        :enlarge="cropperOption.enlarge"
        @ready="handleCropperReady"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showCropDialog = false">取消</el-button>
        <el-button type="primary" :disabled="isProcessing" @click="handleCropFinish">
          {{ isProcessing ? '处理中...' : '确定' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
  
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
