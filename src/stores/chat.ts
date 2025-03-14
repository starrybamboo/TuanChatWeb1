import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tuanchat } from '@/api/instance'
import { wsService } from '@/services/websocket'
import { useAvatarStore } from '@/stores/avatar'
import type { ChatMessageRequest, ChatMessageResponse, Message } from '@/api/models'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessageResponse[]>([])
  const currentRoomId = ref<number | null>(null)
  const chatControllerApi = tuanchat.chatController
  const avatarStore = useAvatarStore()

  // 获取消息头像URL
  function getMessageAvatarUrl(avatarId: number | undefined) {
    return avatarStore.getAvatarUrl(avatarId)
  }

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
      // 构建WebSocket消息格式
      const wsMessage = {
        type: 3,
        data: message
      }
      // 通过WebSocket发送消息
      wsService.sendMessage(wsMessage)
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
    initializeWebSocket,
    getMessageAvatarUrl
  }
})
