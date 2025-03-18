import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tuanchat } from '@/api/instance'
import { wsService } from '@/services/websocket'
import { useAvatarStore } from '@/stores/avatar'
import type { ChatMessageRequest, ChatMessageResponse, Message } from '@/api'

/**
 * 聊天管理Store
 * 负责管理聊天消息、WebSocket通信、消息历史记录等功能
 * 维护房间消息列表和游标位置
 */
export const useChatStore = defineStore('chat', () => {
  /** 聊天消息列表，按房间ID分组存储 */
  const messages = ref<Map<number, ChatMessageResponse[]>>(new Map())
  /** 当前房间ID */
  const currentRoomId = ref<number>(0)
  /** 聊天控制器API实例 */
  const chatControllerApi = tuanchat.chatController
  /** 头像Store实例 */
  const avatarStore = useAvatarStore()
  /** 房间消息游标映射 */
  const roomCursors = ref<Map<number, number>>(new Map())

  /**
   * 初始化聊天室
   * @param groupId 群组ID
   */
  function initializeChat(groupId: number) {
    currentRoomId.value = groupId
  }

  /** 获取消息头像URL
   * @param avatarId 头像ID
   * @returns 头像URL
   */
  function getMessageAvatarUrl(avatarId: number | undefined) {
    return avatarStore.getAvatarUrl(avatarId)
  }

  /** 加载历史消息
   * @param roomId 房间ID
   * @param cursor 消息游标
   * @returns 分页消息数据
   */
  async function loadMessages(roomId: number, cursor?: number) {
    try {
      // 如果没有提供cursor，使用存储的cursor
      const currentCursor = cursor || roomCursors.value.get(roomId)
      
      const response = await chatControllerApi.getMsgPage({
        roomId: roomId,
        cursor: currentCursor,
        pageSize: 20,
      })
      
      if (response.data?.list) {
        const roomMessages = messages.value.get(roomId) || [];
      messages.value.set(roomId, [...response.data.list, ...roomMessages])
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

  /** 发送消息
   * @param message 消息请求数据
   */
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

  /** 处理新消息
   * 将新消息添加到对应房间的消息列表中
   * @param message 新消息数据
   */
  function handleNewMessage(message: ChatMessageResponse) {
    const roomId = currentRoomId.value;
    if (roomId) {
      const roomMessages = messages.value.get(roomId) || [];
      messages.value.set(roomId, [...roomMessages, message])
    }
  }

  /** 处理消息撤回
   * 从消息列表中移除被撤回的消息
   * @param messageId 被撤回的消息ID
   */
  function handleMessageRecall(messageId: number) {
    const roomId = currentRoomId.value;
    if (roomId) {
      const roomMessages = messages.value.get(roomId) || [];
      const updatedMessages = roomMessages.filter(msg => msg.message.messageID !== messageId);
      messages.value.set(roomId, updatedMessages);
    }
  }

  /** 更新消息
   * @param message 更新的消息数据
   */
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

  /** 处理消息更新
   * 更新消息列表中的对应消息
   * @param message 更新后的消息数据
   */
  function handleMessageUpdate(message: Message) {
    const roomId = currentRoomId.value;
    if (roomId) {
      const roomMessages = messages.value.get(roomId) || [];
      const updatedMessages = roomMessages.map(msg =>
        msg.message.messageID === message.messageID
          ? { ...msg, message: message }
          : msg
      );
      messages.value.set(roomId, updatedMessages);
    }
  }

  /** 初始化WebSocket监听器
   * 注册新消息、消息撤回和消息更新的处理函数
   */
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
    getMessageAvatarUrl,
    initializeChat
  }
})
