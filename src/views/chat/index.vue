<script setup lang="ts">
import { ref } from 'vue'
import { useRoleStore } from '@/stores/role'
import ChannelSelector from './components/ChannelSelector.vue'
import ChatContent from './components/ChatContent.vue'
import MemberList from './components/MemberList.vue'
import AvatarSelector from './components/AvatarSelector.vue'
import RoleSelector from '@/components/RoleSelector.vue'

const roleStore = useRoleStore()
const memberListRef = ref()
const chatContentRef = ref()
const showAvatarSelector = ref(false)
const showRoleSelector = ref(false)

// 选择头像
const handleSelectAvatar = async (avatarId: number) => {
  if (!roleStore.currentRole) return
  roleStore.currentRole.avatarId = avatarId
  showAvatarSelector.value = false
}

// 选择角色
const handleSelectRole = (roleId: number) => {
  roleStore.currentRole = roleStore.roles.find(role => role.roleId === roleId) ?? null
  showRoleSelector.value = false
}


</script>

<template>
  <div class="discord-container">
    <ChannelSelector :chat-content-ref="chatContentRef" />
    <ChatContent 
      ref="chatContentRef"
      @toggle-member-list="memberListRef?.toggleMemberList()"
      @show-avatar-selector="showAvatarSelector = true"
      @show-role-selector="showRoleSelector = true"
    />
    <MemberList ref="memberListRef" />
    <AvatarSelector
      v-model:show="showAvatarSelector"
      :role-id="roleStore.currentRole?.roleId"
      @select="handleSelectAvatar"
    />
    <RoleSelector
      v-model:show="showRoleSelector"
      @select-role="handleSelectRole"
    />
  </div>
</template>

<style scoped>
.discord-container {
  height: 100vh;
  display: flex;
  background-color: #36393f;
  color: #dcddde;
  position: relative;
}
</style>
