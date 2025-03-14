<script setup lang="ts">
import AppLayout from './layouts/AppLayout.vue'
import { wsService } from '@/services/websocket'
import { onBeforeUnmount } from 'vue'

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
