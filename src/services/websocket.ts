import { useUserStore } from '@/stores/user'
import { ref, watch } from 'vue'
import { pinia } from '@/stores'

export class WebSocketService {
  private ws: WebSocket | null = null
  private readonly url: string
  private token: string | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10
  private heartbeatInterval: number = 5000 // 心跳时间 （ms）
  private heartbeatTimer: number | null = null
  private isConnected = ref(false)
  private isConnecting = ref(false)
  private userStore = useUserStore(pinia)
  
  constructor(url: string) {
    this.url = url
    // 初始化时从userStore获取token
    this.token = this.userStore.token
    
    // 监听token变化
    watch(() => this.userStore.token, (newToken) => {
      this.token = newToken
      // 如果已连接，则断开重连以使用新token
      if (this.isConnected.value) {
        this.disconnect()
        this.connect()
      }
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        timestamp: new Date().toISOString()
      })
      return
    }

    // 使用指数退避算法计算延迟时间，基础延迟为1秒，最大延迟为30秒
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    console.log('Attempting to reconnect...', {
      attempt: this.reconnectAttempts + 1,
      delay: `${delay}ms`,
      timestamp: new Date().toISOString(),
      lastUrl: this.ws?.url
    })

    setTimeout(() => {
      this.reconnectAttempts++
      // 在重连之前验证token
      if (!this.token) {
        console.error('Reconnection failed: No valid token available', {
          timestamp: new Date().toISOString()
        })
        return
      }
      this.connect()
    }, delay)
  }

  public connect() {
    if (this.isConnected.value || this.isConnecting.value) {
      console.log('WebSocket connection already exists or is connecting', {
        isConnected: this.isConnected.value,
        isConnecting: this.isConnecting.value,
        timestamp: new Date().toISOString()
      })
      return
    }

    this.isConnecting.value = true
    try {
      if (!this.token) {
        throw new Error('No valid token available for connection')
      }
      const wsUrl = `${this.url}?token=${this.token}`
      console.log('Attempting to connect WebSocket...', {
        url: wsUrl,
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts
      })
      this.ws = new WebSocket(wsUrl)
      this.setupEventHandlers()
    } catch (err) {
      console.error('WebSocket connection error:', {
        error: err,
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts
      })
      this.isConnecting.value = false
      this.handleReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully', {
        url: this.ws?.url,
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts
      })
      this.isConnected.value = true
      this.isConnecting.value = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts
      })
      this.isConnected.value = false
      this.isConnecting.value = false
      this.stopHeartbeat()
      this.handleReconnect()
    }

    this.ws.onerror = (error: Event) => {
      const target = error.target as WebSocket;
      const errorInfo = {
        readyState: target.readyState,
        url: target.url,
        reconnectAttempts: this.reconnectAttempts,
        timestamp: new Date().toISOString(),
        error: error
      };
      console.error('WebSocket error:', errorInfo);
      
      // 根据readyState提供更具体的错误信息
      switch (target.readyState) {
        case WebSocket.CONNECTING:
          console.error('Connection failed while attempting to establish WebSocket connection', errorInfo);
          break;
        case WebSocket.CLOSING:
          console.error('WebSocket connection is in the process of closing', errorInfo);
          break;
        case WebSocket.CLOSED:
          console.error('WebSocket connection was closed unexpectedly', errorInfo);
          break;
      }
      
      this.isConnected.value = false;
      this.isConnecting.value = false;
      // 在错误发生时主动断开连接并尝试重连
      this.disconnect();
      this.handleReconnect();
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 2) {
          console.log('Received heartbeat response')
          return
        }
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

  private startHeartbeat() {
    console.log('Starting heartbeat timer...', {
      interval: this.heartbeatInterval,
      timestamp: new Date().toISOString()
    })
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const heartbeatMessage = { type: 2 }
        console.log('Sending heartbeat:', {
          message: heartbeatMessage,
          timestamp: new Date().toISOString(),
          connectionState: this.ws.readyState
        })
        this.ws.send(JSON.stringify(heartbeatMessage))
      } else {
        console.warn('Cannot send heartbeat - WebSocket is not open', {
          timestamp: new Date().toISOString(),
          connectionState: this.ws?.readyState
        })
      }
    }, this.heartbeatInterval)
    console.log(`Heartbeat timer started with interval: ${this.heartbeatInterval}ms`)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      console.log('Stopping heartbeat timer...')
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  public sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket sending message:', {
        type: message.type,
        timestamp: new Date().toISOString(),
        data: message
      })
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  public disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected.value = false
    this.isConnecting.value = false
  }

  private handleChatMessage(data: any) {
    this.emit('newMessage', data)
  }

  private handleOnlineStatus(data: any) {
    this.emit('onlineStatus', data)
  }

  private handleMessageMark(data: any) {
    this.emit('messageMark', data)
  }

  private handleMessageRecall(data: any) {
    this.emit('messageRecall', data)
  }

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

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    }
  }
}

// 创建全局单例实例
const wsBaseUrl = import.meta.env.DEV ? 'ws://localhost:8090/ws' : import.meta.env.VITE_WS_URL || 'ws://localhost:8090/ws';
export const wsService = new WebSocketService(wsBaseUrl);
