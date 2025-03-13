import { ref } from 'vue'

export class WebSocketService {
  private ws: WebSocket | null = null
  private readonly url: string
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private reconnectTimeout: number = 1000
  
  constructor(url: string) {
    this.url = url
  }

  public connect() {
    try {
      this.ws = new WebSocket(this.url)
      this.setupEventHandlers()
    } catch (err) {
      console.error('WebSocket connection error:', err)
      this.handleReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onclose = () => {
      console.log('WebSocket closed')
      this.handleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message
    switch (type) {
      case 4: // MESSAGE
        this.handleChatMessage(data)
        break
      case 5: // ONLINE_OFFLINE_NOTIFY
        this.handleOnlineStatus(data)
        break
      case 8: // MARK
        this.handleMessageMark(data)
        break
      case 9: // RECALL
        this.handleMessageRecall(data)
        break
      default:
        console.log('Unhandled message type:', type)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, this.reconnectTimeout * this.reconnectAttempts)
  }

  public sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }

  private handleChatMessage(data: any) {
    // 触发消息更新事件
    this.emit('newMessage', data)
  }

  private handleOnlineStatus(data: any) {
    // 触发在线状态更新事件
    this.emit('onlineStatus', data)
  }

  private handleMessageMark(data: any) {
    // 触发消息标记更新事件
    this.emit('messageMark', data)
  }

  private handleMessageRecall(data: any) {
    // 触发消息撤回事件
    this.emit('messageRecall', data)
  }

  // 简单的事件发射器
  private listeners: Record<string, Function[]> = {}

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }
}

// 创建单例
export const wsService = new WebSocketService('ws://localhost:8090/ws')
