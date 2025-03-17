<script setup lang="ts">
import AppLayout from './layouts/AppLayout.vue'
import { wsService } from '@/services/websocket'
import { onBeforeUnmount, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// 在组件挂载时连接WebSocket
onMounted(() => {
  wsService.connect()
  chatStore.initializeWebSocket()
})

// 在页面关闭前断开WebSocket连接
window.addEventListener('beforeunload', () => {
  wsService.disconnect()
})

onBeforeUnmount(() => {
  wsService.disconnect()
})
</script>

<template>
  <AppLayout />
</template>
