import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tuanchat } from '@/api/instance'
import { wsService } from '@/services/websocket'
import { useAvatarStore } from '@/stores/avatar'
import type { ChatMessageRequest, ChatMessageResponse, Message } from '@/api/models'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessageResponse[]>([])
  const currentRoomId = ref<number | null>(null)
  const chatControllerApi = tuanchat.chatController
  const avatarStore = useAvatarStore()
  const roomCursors = ref<Map<number, number>>(new Map())

  // 获取消息头像URL
  function getMessageAvatarUrl(avatarId: number | undefined) {
    return avatarStore.getAvatarUrl(avatarId)
  }

  // 加载历史消息
  async function loadMessages(roomId: number, cursor?: number) {
    try {
      // 如果没有提供cursor，使用存储的cursor
      const currentCursor = cursor || roomCursors.value.get(roomId)
      
      const response = await chatControllerApi.getMsgPage({
        roomId,
        cursor: currentCursor,
        pageSize: 20
      })
      
      if (response.data?.list) {
        messages.value = [...response.data.list, ...messages.value]
        // 更新房间的cursor
        if (response.data.cursor) {
          roomCursors.value.set(roomId, response.data.cursor)
        }
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

  // 更新消息
  async function updateMessage(message: Message) {
    try {
      const response = await chatControllerApi.updateMessage(message)
      if (response.success && response.data) {
        handleMessageUpdate(response.data)
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  // 处理消息更新
  function handleMessageUpdate(message: Message) {
    const index = messages.value.findIndex(msg => msg.message.messageID === message.messageID)
    if (index !== -1) {
      messages.value[index].message = message
    }
  }

  // 初始化WebSocket监听器
  function initializeWebSocket() {
    wsService.on('newMessage', handleNewMessage)
    wsService.on('messageRecall', handleMessageRecall)
    wsService.on('messageUpdate', handleMessageUpdate)
  }

  return {
    messages,
    currentRoomId,
    loadMessages,
    sendMessage,
    updateMessage,
    initializeWebSocket,
    getMessageAvatarUrl
  }
})
