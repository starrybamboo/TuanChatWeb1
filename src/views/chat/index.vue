<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { wsService } from '@/services/websocket'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/role'
import ChannelSelector from './components/ChannelSelector.vue'
import ChatContent from './components/ChatContent.vue'
import MemberList from './components/MemberList.vue'
import AvatarSelector from './components/AvatarSelector.vue'

const chatStore = useChatStore()
const roleStore = useRoleStore()
const memberListRef = ref()
const chatContentRef = ref()
const showAvatarSelector = ref(false)

// 选择头像
const handleSelectAvatar = async (avatarId: number) => {
  if (!roleStore.currentRole) return
  roleStore.currentRole.avatarId = avatarId
  showAvatarSelector.value = false
}

onMounted(() => {
  // 连接WebSocket
  wsService.connect()
  chatStore.initializeWebSocket()
})
</script>

<template>
  <div class="discord-container">
    <ChannelSelector :chat-content-ref="chatContentRef" />
    <ChatContent 
      ref="chatContentRef"
      @toggle-member-list="memberListRef?.toggleMemberList()"
      @show-avatar-selector="showAvatarSelector = true"
    />
    <MemberList ref="memberListRef" />
    <AvatarSelector
      v-model:show="showAvatarSelector"
      :role-id="roleStore.currentRole?.roleId"
      @select="handleSelectAvatar"
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
