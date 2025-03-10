<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoleStore } from '@/stores/role';
import { useUserStore } from '@/stores/user';
import { useAvatarStore } from '@/stores/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Setting, Star, Picture, ChatDotRound, User, Check, Close } from '@element-plus/icons-vue';
import type { UserRole } from '@/api/models/UserRole';
import type { RoleAvatar } from '@/api/models/RoleAvatar';

const roleStore = useRoleStore();
const userStore = useUserStore();
const avatarStore = useAvatarStore();
const roles = ref<UserRole[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const activeRoleId = ref<number | null>(null);
const showRightPanel = ref(true);
const avatarLoading = ref(false);

// 编辑相关的状态
const isEditing = ref(false);
const editForm = ref<UserRole | null>(null);
const saveLoading = ref(false);

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true;
  try {
    // 直接通过角色API获取角色列表
    await roleStore.fetchRoles();
    roles.value = roleStore.roles;
    
    // 如果有角色，默认选中第一个
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
const createRole = async () => {
  try {
    const newRole = await roleStore.createRole();
    if (newRole) {
      ElMessage.success('创建角色成功');
      await fetchRoles();
      // 选中新创建的角色
      activeRoleId.value = newRole.roleId;
    }
  } catch (error) {
    ElMessage.error('创建角色失败');
    console.error(error);
  }
};

// 编辑角色
const editRole = (role: UserRole) => {
  // 创建一个副本以便编辑
  editForm.value = { ...role };
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  editForm.value = null;
};

// 保存角色编辑
const saveRole = async () => {
  if (!editForm.value || !editForm.value.roleId) return;
  
  saveLoading.value = true;
  try {
    const updatedRole = await roleStore.updateRole(editForm.value.roleId, editForm.value);
    if (updatedRole) {
      ElMessage.success('角色更新成功');
      isEditing.value = false;
      editForm.value = null;
      // 刷新角色列表
      await fetchRoles();
      // 如果当前选中的角色是被更新的角色，重新选中它以更新视图
      if (activeRoleId.value === updatedRole.roleId) {
        await selectRole(updatedRole.roleId);
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
const deleteRole = async (role: UserRole) => {
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
        // 如果删除的是当前选中的角色，重置选中状态
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
const selectRole = async (roleId: number) => {
  activeRoleId.value = roleId;
  
  // 获取角色的头像信息
  if (roleId) {
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

// 切换右侧面板显示/隐藏
const toggleRightPanel = () => {
  showRightPanel.value = !showRightPanel.value;
};

// 过滤角色列表
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value;
  return roles.value.filter(role => 
    (role.roleName && role.roleName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

// 获取当前选中的角色
const activeRole = computed(() => {
  return roles.value.find(role => role.roleId === activeRoleId.value) || null;
});

// 根据avatarId获取头像URL
const getAvatarUrl = (avatarId: number | undefined) => {
  if (!avatarId) return '';
  return avatarStore.getAvatarUrl(avatarId) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
};

// 根据avatarId获取头像标题
const getAvatarTitle = (avatarId: number | undefined) => {
  if (!avatarId) return '默认头像';
  return avatarStore.getAvatarTitle(avatarId) || '未命名头像';
};

// 根据avatarId获取精灵图URL
const getSpriteUrl = (avatarId: number | undefined) => {
  if (!avatarId) return '';
  return avatarStore.getSpriteUrl(avatarId) || '';
};

// 获取所有可用的头像
const availableAvatars = computed(() => {
  return avatarStore.getAllAvatars;
});

onMounted(async () => {
  await fetchRoles();
  
  // 如果有选中的角色，获取其头像信息
  if (activeRoleId.value) {
    await selectRole(activeRoleId.value);
  }
});
</script>

<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索角色"
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
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
      <div class="role-sidebar">
        <div class="role-list">
          <el-empty v-if="filteredRoles.length === 0 && !loading" description="暂无角色数据" />
          
          <div 
            v-for="role in filteredRoles" 
            :key="role.roleId" 
            class="role-item"
            :class="{ 'active': role.roleId === activeRoleId }"
            @click="selectRole(role.roleId)"
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
          <div class="role-item add-role-item" @click="createRole">
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
      
      <!-- 右侧角色详情 -->
      <div class="role-detail" v-if="activeRole">
        <div class="detail-header">
          <div class="detail-title">
            <el-avatar 
              :size="24" 
              :src="getAvatarUrl(activeRole.avatarId)"
              shape="square"
            >
              {{ activeRole.roleName ? activeRole.roleName.charAt(0) : 'R' }}
            </el-avatar>
            <span>{{ activeRole.roleName || '未命名角色' }}</span>
          </div>
          <div class="detail-actions">
            <el-button :icon="ChatDotRound" circle @click="toggleRightPanel" />
            <el-button :icon="Setting" circle />
          </div>
        </div>
        
        <div class="detail-content">
          <el-card class="role-card">
            <!-- 非编辑状态下的角色卡片 -->
            <template v-if="!isEditing">
              <div class="role-card-header">
                <div class="role-avatar">
                  <el-avatar 
                    :size="64" 
                    :src="getAvatarUrl(activeRole.avatarId)"
                    shape="square"
                  >
                    {{ activeRole.roleName ? activeRole.roleName.charAt(0) : 'R' }}
                  </el-avatar>
                </div>
                <div class="role-info">
                  <h3 class="role-name">{{ activeRole.roleName || '未命名角色' }}</h3>
                  <p class="role-create-time">创建时间: {{ activeRole.createTime ? new Date(activeRole.createTime).toLocaleDateString() : '未知' }}</p>
                </div>
              </div>
              
              <div class="role-card-body">
                <p class="role-description">{{ activeRole.description || '暂无描述' }}</p>
              </div>
              
              <div class="role-card-footer">
                <el-button type="primary" text :icon="Edit" @click="editRole(activeRole)">编辑</el-button>
                <el-button type="danger" text :icon="Delete" @click="deleteRole(activeRole)">删除</el-button>
              </div>
            </template>
            
            <!-- 编辑状态下的表单 -->
            <template v-else>
              <div class="edit-form" v-loading="saveLoading">
                <h3 class="edit-title">编辑角色</h3>
                
                <el-form label-position="top" :model="editForm" v-if="editForm">
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
                        <div class="avatar-grid">
                          <div 
                            v-for="avatar in availableAvatars" 
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
                    <el-button type="primary" :icon="Check" :loading="saveLoading" @click="saveRole">保存</el-button>
                    <el-button :icon="Close" @click="cancelEdit">取消</el-button>
                  </div>
                </el-form>
              </div>
            </template>
          </el-card>
        </div>
      </div>
      
      <!-- 右侧面板 -->
      <div class="right-panel" v-if="showRightPanel">
        <div class="panel-header">角色信息</div>
        <div class="panel-content">
          <div class="panel-section">
            <h4>角色ID</h4>
            <p>{{ activeRole?.roleId || '无' }}</p>
          </div>
          <div class="panel-section">
            <h4>创建时间</h4>
            <p>{{ activeRole?.createTime ? new Date(activeRole.createTime).toLocaleString() : '未知' }}</p>
          </div>
          <div class="panel-section">
            <h4>更新时间</h4>
            <p>{{ activeRole?.updateTime ? new Date(activeRole.updateTime).toLocaleString() : '未知' }}</p>
          </div>
          <div class="panel-section">
            <h4>头像ID</h4>
            <p>{{ activeRole?.avatarId || '无' }}</p>
          </div>
          <div class="panel-section">
            <h4>头像标题</h4>
            <p>{{ activeRole?.avatarId ? getAvatarTitle(activeRole.avatarId) : '无' }}</p>
          </div>
          <div class="panel-section">
            <h4>精灵图URL</h4>
            <p>{{ activeRole?.avatarId ? getSpriteUrl(activeRole.avatarId) : '无' }}</p>
          </div>
          <div class="panel-section" v-if="avatarLoading">
            <el-skeleton :rows="1" animated />
          </div>
        </div>
      </div>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  width: 240px;
}

.search-input {
  border-radius: 4px;
  background-color: #202225;
  border: none;
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

/* 左侧角色列表样式 */
.role-sidebar {
  width: 240px;
  background-color: #2f3136;
  border-right: 1px solid #202225;
  overflow-y: auto;
}

.role-list {
  padding: 8px;
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

/* 右侧角色详情样式 */
.role-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
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
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #fff;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 角色卡片样式 */
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

/* 编辑表单样式 */
.edit-form {
  padding: 16px;
}

.edit-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
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

/* 精灵图显示样式 */
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

:deep(.el-form-item__label) {
  color: #dcddde;
}

:deep(.el-textarea__inner) {
  background-color: #202225;
  color: #dcddde;
  border: none;
}

:deep(.el-textarea__inner::placeholder) {
  color: #8e9297;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #202225;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #2f3136;
}
</style>