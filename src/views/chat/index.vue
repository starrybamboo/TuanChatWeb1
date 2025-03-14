<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { wsService } from '@/services/websocket'
import { useChatStore } from '@/stores/chat'
import ChannelSelector from './components/ChannelSelector.vue'
import ChatContent from './components/ChatContent.vue'
import MemberList from './components/MemberList.vue'

const chatStore = useChatStore()
const memberListRef = ref()

onMounted(() => {
  // 连接WebSocket
  wsService.connect()
  chatStore.initializeWebSocket()
})
</script>

<template>
  <div class="discord-container">
    <ChannelSelector />
    <ChatContent @toggle-member-list="memberListRef?.toggleMemberList()" />
    <MemberList ref="memberListRef" />
  </div>
</template>

<style scoped>
.discord-container {
  height: 100vh;
  display: flex;
  background-color: #36393f;
  color: #dcddde;
}
</style>
