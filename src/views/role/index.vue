<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoleStore } from '@/stores/role';
import { useAvatarStore } from '@/stores/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Star, User, Picture, Setting } from '@element-plus/icons-vue';
import RoleList from './components/RoleList.vue';
import RoleDetail from './components/RoleDetail.vue';
import RoleForm from './components/RoleForm.vue';
import RoleInfoPanel from './components/RoleInfoPanel.vue';
import type { UserRole } from '@/api/models/UserRole';
import type { UploadUrlReq } from '@/api/models/UploadUrlReq';
import { tuanchat } from '@/api/instance';

const roleStore = useRoleStore();
const avatarStore = useAvatarStore();
const route = useRoute();
const router = useRouter();
const roles = ref<UserRole[]>([]);
const loading = ref(false);
const activeRoleId = ref<number | null>(null);
const showRightPanel = ref(true);
const avatarLoading = ref(false);
const allAvatarsLoaded = ref(false);

// 编辑相关的状态
const isEditing = ref(false);
const editForm = ref<UserRole | null>(null);
const saveLoading = ref(false);
const uploadLoading = ref(false);
const selectedFile = ref<File | null>(null);
const ossService = tuanchat.ossController;

// 处理头像文件选择
const handleAvatarUpload = async (file: File) => {
  if (!file) return;
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请选择图片文件');
    return;
  }
  
  // 验证文件大小（限制为5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  selectedFile.value = file;
  uploadLoading.value = true;
  
  try {
    // 获取预上传地址
    const uploadUrlReq: UploadUrlReq = {
      fileName: file.name,
      scene: 1 // 假设1代表头像场景
    };
    
    const response = await ossService.getUploadUrl(uploadUrlReq);
    if (response.data?.uploadUrl) {
      // 上传文件到MinIO
      const uploadResponse = await fetch(response.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      if (uploadResponse.ok) {
        ElMessage.success('头像上传成功');
        // 刷新头像列表
        if (editForm.value?.roleId) {
          await avatarStore.fetchRoleAvatars(editForm.value.roleId);
        }
      } else {
        throw new Error('上传失败');
      }
    }
  } catch (error) {
    console.error('上传头像失败:', error);
    ElMessage.error('上传头像失败');
  } finally {
    uploadLoading.value = false;
    selectedFile.value = null;
  }
};

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true;
  try {
    await roleStore.fetchRoles();
    roles.value = roleStore.roles;
    
    if (roles.value.length > 0 && !activeRoleId.value) {
      activeRoleId.value = roles.value[0].roleId;
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 创建新角色
const handleCreateRole = async () => {
  try {
    const newRole = await roleStore.createRole();
    if (newRole) {
      ElMessage.success('创建角色成功');
      await fetchRoles();
      activeRoleId.value = newRole.roleId;
    }
  } catch (error) {
    ElMessage.error('创建角色失败');
    console.error(error);
  }
};

// 编辑角色
const handleEditRole = async (role: UserRole) => {
  editForm.value = { ...role };
  isEditing.value = true;
  
  // 更新路由，添加编辑状态参数
  if (role.roleId) {
    router.push(`/role/${role.roleId}?edit=true`);
    
    avatarLoading.value = true;
    try {
      await avatarStore.fetchRoleAvatars(role.roleId);
    } catch (error) {
      console.error('获取角色头像失败', error);
      ElMessage.error('获取头像列表失败');
    } finally {
      avatarLoading.value = false;
    }
  }
};

// 取消编辑
const handleCancelEdit = () => {
  isEditing.value = false;
  editForm.value = null;
  
  // 移除编辑状态参数，返回到角色详情页
  if (activeRoleId.value) {
    router.push(`/role/${activeRoleId.value}`);
  } else {
    router.push('/role');
  }
};

// 保存角色编辑
const handleSaveRole = async (updatedRole: UserRole) => {
  if (!updatedRole.roleId) return;
  
  saveLoading.value = true;
  try {
    const result = await roleStore.updateRole(updatedRole.roleId, updatedRole);
    if (result) {
      ElMessage.success('角色更新成功');
      isEditing.value = false;
      editForm.value = null;
      await fetchRoles();
      if (activeRoleId.value === result.roleId) {
        // 更新路由，移除编辑状态
        router.push(`/role/${result.roleId}`);
        await handleSelectRole(result.roleId);
      }
    } else {
      ElMessage.error(roleStore.error || '更新角色失败');
    }
  } catch (error) {
    ElMessage.error('更新角色失败');
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

// 删除角色
const handleDeleteRole = async (role: UserRole) => {
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
        if (activeRoleId.value === role.roleId) {
          activeRoleId.value = roles.value.length > 0 ? roles.value[0].roleId : null;
        }
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

// 选择角色
const handleSelectRole = async (roleId: number) => {
  activeRoleId.value = roleId;
  
  // 更新路由，但不触发路由变化
  if (route.params.roleId !== roleId.toString()) {
    router.push(`/role/${roleId}`);
  }
  
  if (roleId && !allAvatarsLoaded.value) {
    avatarLoading.value = true;
    try {
      await avatarStore.fetchRoleAvatars(roleId);
    } catch (error) {
      console.error('获取角色头像失败', error);
    } finally {
      avatarLoading.value = false;
    }
  }
};

// 处理保存后切换角色
const handleSaveBeforeSwitch = async (roleId: number) => {
  if (editForm.value) {
    await handleSaveRole(editForm.value);
    handleSelectRole(roleId);
  }
};

// 处理不保存直接切换角色
const handleCancelAndSwitch = (roleId: number) => {
  isEditing.value = false;
  editForm.value = null;
  handleSelectRole(roleId);
};

// 切换右侧面板显示/隐藏
const toggleRightPanel = () => {
  showRightPanel.value = !showRightPanel.value;
};

// 获取当前选中的角色
const activeRole = computed(() => {
  return roles.value.find(role => role.roleId === activeRoleId.value) || null;
});

// 获取当前角色的头像URL
const activeRoleAvatarUrl = computed(() => {
  if (!activeRole.value?.avatarId) return '';
  return avatarStore.getAvatarUrl(activeRole.value.avatarId) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
});

// 获取所有可用的头像
const availableAvatars = computed(() => {
  // 返回所有头像，不再过滤角色ID
  return avatarStore.avatars;
});

// 监听路由参数变化
watch(() => route.params.roleId, async (newRoleId) => {
  if (newRoleId && roles.value.length > 0) {
    const roleId = parseInt(newRoleId as string);
    if (!isNaN(roleId)) {
      activeRoleId.value = roleId;
      if (!allAvatarsLoaded.value) {
        await avatarStore.fetchRoleAvatars(roleId);
      }
    }
  }
});

// 监听路由查询参数变化，处理编辑状态
watch(() => route.query.edit, (isEditMode) => {
  if (isEditMode === 'true' && activeRole.value) {
    // 如果URL中有edit=true参数且有活动角色，进入编辑模式
    if (!isEditing.value) {
      editForm.value = { ...activeRole.value };
      isEditing.value = true;
    }
  } else if (isEditing.value) {
    // 如果URL中没有edit参数但当前是编辑模式，退出编辑模式
    isEditing.value = false;
    editForm.value = null;
  }
});

// 预加载所有角色的头像
const preloadAllAvatars = async () => {
  if (roles.value.length === 0 || allAvatarsLoaded.value) return;
  
  avatarLoading.value = true;
  try {
    // 为所有角色加载头像
    for (const role of roles.value) {
      if (role.roleId) {
        await avatarStore.fetchRoleAvatars(role.roleId);
      }
    }
    allAvatarsLoaded.value = true;
  } catch (error) {
    console.error('预加载头像失败', error);
  } finally {
    avatarLoading.value = false;
  }
};

onMounted(async () => {
  await fetchRoles();
  
  // 检查URL中是否有角色ID
  const routeRoleId = route.params.roleId;
  if (routeRoleId) {
    const roleId = parseInt(routeRoleId as string);
    if (!isNaN(roleId)) {
      activeRoleId.value = roleId;
      
      // 检查是否有编辑参数
      if (route.query.edit === 'true') {
        // 等待角色数据加载完成
        await nextTick();
        if (activeRole.value) {
          editForm.value = { ...activeRole.value };
          isEditing.value = true;
        }
      }
    }
  }
  // 不再自动选择第一个角色，保持URL为/role
  // 只有当URL中有roleId参数时才选择角色
  
  // 预加载所有角色的头像
  await preloadAllAvatars();
});
</script>

<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="search-container">
          <!-- 搜索功能已移至RoleList组件 -->
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Star" circle />
        <el-button :icon="User" circle />
        <el-button :icon="Picture" circle />
        <el-button :icon="Setting" circle />
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="chat-content">
      <!-- 左侧角色列表 -->
      <RoleList
        :roles="roles"
        :active-role-id="activeRoleId"
        :loading="loading"
        :is-editing="isEditing"
        @select="handleSelectRole"
        @create="handleCreateRole"
        @save-before-switch="handleSaveBeforeSwitch"
        @cancel-and-switch="handleCancelAndSwitch"
      />
      
      <!-- 中间内容区域 -->
      <div class="middle-content">
        <template v-if="activeRole">
          <RoleDetail
            v-if="!isEditing"
            :role="activeRole"
            :avatar-url="activeRoleAvatarUrl"
            @edit="handleEditRole"
            @delete="handleDeleteRole"
            @toggle-panel="toggleRightPanel"
          />
          <RoleForm
            v-else
            :role="editForm"
            :avatars="availableAvatars"
            :save-loading="saveLoading"
            :avatar-loading="avatarLoading"
            @save="handleSaveRole"
            @cancel="handleCancelEdit"
            @upload-avatar="handleAvatarUpload"
          />
        </template>
      </div>
      
      <!-- 右侧面板 -->
      <RoleInfoPanel 
        v-if="showRightPanel && activeRole" 
        :role="isEditing ? editForm : activeRole" 
        :avatar-loading="avatarLoading" 
      />
    </div>
    
    <el-backtop :right="20" :bottom="20" />
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background-color: #36393f;
  color: #dcddde;
}

/* 顶部导航栏样式 */
.chat-header {
  height: 48px;
  background-color: #2f3136;
  border-bottom: 1px solid #202225;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 主内容区域样式 */
.chat-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 中间内容区域样式 */
.middle-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 全局按钮样式 */
:deep(.el-button) {
  --el-button-bg-color: #4f545c;
  --el-button-border-color: #4f545c;
  --el-button-hover-bg-color: #5d636b;
  --el-button-hover-border-color: #5d636b;
  --el-button-active-bg-color: #72767d;
  --el-button-active-border-color: #72767d;
  color: #fff;
}

/* 全局消息框样式 */
:deep(.el-message-box) {
  background-color: #36393f;
  border-color: #202225;
}

:deep(.el-message-box__title) {
  color: #fff;
}

:deep(.el-message-box__content) {
  color: #dcddde;
}

:deep(.el-message-box__btns .el-button) {
  background-color: #4f545c;
  border-color: #4f545c;
  color: #fff;
}

:deep(.el-message-box__btns .el-button--primary) {
  background-color: #5865f2;
  border-color: #5865f2;
}

:deep(.el-message-box__btns .el-button--primary:hover) {
  background-color: #4752c4;
  border-color: #4752c4;
}

:deep(.el-message-box__btns .el-button--primary:active) {
  background-color: #3c45a5;
  border-color: #3c45a5;
}
</style>