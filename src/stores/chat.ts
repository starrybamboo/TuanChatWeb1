import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tuanchat } from '@/api/instance'
import { wsService } from '@/services/websocket'
import type { ChatMessageRequest, ChatMessageResponse, Message } from '@/api/models'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessageResponse[]>([])
  const currentRoomId = ref<number | null>(null)
  const chatControllerApi = tuanchat.chatController;

  // 加载历史消息
  async function loadMessages(roomId: number, cursor?: number) {
    try {
      const response = await chatControllerApi.getMsgPage({
        roomId,
        cursor,
        pageSize: 20
      })
      
      if (response.data?.list) {
        messages.value = [...response.data.list, ...messages.value]
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // 发送消息
  async function sendMessage(message: ChatMessageRequest) {
    try {
      await chatControllerApi.sendMessage(message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 处理新消息
  function handleNewMessage(message: ChatMessageResponse) {
    messages.value.push(message)
  }

  // 处理消息撤回
  function handleMessageRecall(messageId: number) {
    const index = messages.value.findIndex(msg => msg.message.messageID === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  // 初始化WebSocket监听器
  function initializeWebSocket() {
    wsService.on('newMessage', handleNewMessage)
    wsService.on('messageRecall', handleMessageRecall)
  }

  return {
    messages,
    currentRoomId,
    loadMessages,
    sendMessage,
    initializeWebSocket
  }
})
