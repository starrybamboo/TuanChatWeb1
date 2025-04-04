<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoleStore } from '@/stores/role';
import { useAvatarStore } from '@/stores/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ChatDotRound } from '@element-plus/icons-vue';
import RoleList from './components/RoleList.vue';
import RoleDetail from './components/RoleDetail.vue';
import RoleForm from './components/RoleForm.vue';
import RoleInfoPanel from './components/RoleInfoPanel.vue';
import type { UserRole } from '@/api/models/UserRole';

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
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null);

// 编辑相关的状态
const isEditing = ref(false);
const editForm = ref<UserRole | null>(null);
const saveLoading = ref(false);
const formIsDirty = ref(false);

// 加载角色头像列表
const loadRoleAvatars = async () => {
  // 获取当前编辑的角色ID，如果没有则使用当前活动角色ID
  const roleId = editForm.value?.roleId || activeRoleId.value;
  
  if (roleId) {
    avatarLoading.value = true;
    try {
      console.log('正在加载角色ID为', roleId, '的头像列表');
      await avatarStore.fetchRoleAvatars(roleId);
      console.log('角色头像加载成功，当前头像列表:', avatarStore.avatars);
      console.log('可用头像列表:', availableAvatars.value);
    } catch (error) {
      console.error('获取角色头像失败', error);
      ElMessage.error('获取头像列表失败');
    } finally {
      avatarLoading.value = false;
    }
  } else {
    console.warn('无法加载头像：未找到有效的角色ID');
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
    // 通过ref获取最新表单数据
    const currentFormData = roleFormRef.value?.getCurrentFormData();
    if (!currentFormData) {
      throw new Error('无法获取最新表单数据');
    }
    
    const result = await roleStore.updateRole(currentFormData.roleId, currentFormData);
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
  // 确保只返回当前选中角色的头像
  const currentRoleId = editForm.value?.roleId || activeRoleId.value;
  if (!currentRoleId) return [];
  
  // 从store中获取头像并过滤出当前角色的头像
  return avatarStore.avatars.filter(avatar => avatar.roleId === currentRoleId);
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
watch(() => route.query.edit, async (isEditMode) => {
  if (isEditMode === 'true' && activeRole.value) {
    // 如果URL中有edit=true参数且有活动角色，进入编辑模式
    if (!isEditing.value) {
      // 确保在进入编辑模式前加载头像数据
      if (activeRole.value.roleId && !allAvatarsLoaded.value) {
        avatarLoading.value = true;
        try {
          await avatarStore.fetchRoleAvatars(activeRole.value.roleId);
        } catch (error) {
          console.error('获取角色头像失败', error);
          ElMessage.error('获取头像列表失败');
        } finally {
          avatarLoading.value = false;
        }
      }
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
  
  // 预加载所有角色的头像
  await preloadAllAvatars();
    
  // 检查URL中是否有角色ID
  const routeRoleId = route.params.roleId;
  if (routeRoleId) {
    const roleId = parseInt(routeRoleId as string);
    if (!isNaN(roleId)) {
      activeRoleId.value = roleId;
      
      // 无论是否编辑模式，都先加载头像数据
      if (activeRole.value && activeRole.value.roleId) {
        avatarLoading.value = true;
        try {
          console.log('正在加载角色头像数据...');
          await avatarStore.fetchRoleAvatars(activeRole.value.roleId);
          console.log('头像数据加载成功:', avatarStore.avatars);
        } catch (error) {
          console.error('获取角色头像失败', error);
          ElMessage.error('获取头像列表失败');
        } finally {
          avatarLoading.value = false;
        }
      }
      
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
  } else {
    handleSelectRole(activeRoleId.value || 0);
  }
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
        <el-button :icon="ChatDotRound" circle @click="toggleRightPanel" />
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
        :form-is-dirty="formIsDirty"
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
            ref="roleFormRef"
            v-else
            :role="editForm"
            :avatars="availableAvatars"
            :save-loading="saveLoading"
            :avatar-loading="avatarLoading"
            @save="handleSaveRole"
            @cancel="handleCancelEdit"
            @refresh-avatars="loadRoleAvatars"
            @form-dirty-change="formIsDirty = $event"
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