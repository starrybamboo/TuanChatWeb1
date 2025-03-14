import { useUserStore } from '@/stores/user'
import { ref, watch } from 'vue'
import { pinia } from '@/stores'

export class WebSocketService {
  private ws: WebSocket | null = null
  private readonly url: string
  private token: string | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10
  private heartbeatInterval: number = 30000 // 心跳时间 （ms）
  private heartbeatTimer: number | null = null
  private isConnected = ref(false)
  private isConnecting = ref(false)
  private userStore = useUserStore(pinia)
  private listeners: Record<string, Function[]> = {}

  constructor(url: string) {
    this.url = url
    this.token = this.userStore.token
    this.watchTokenChanges()
  }

  private watchTokenChanges() {
    watch(() => this.userStore.token, (newToken) => {
      this.token = newToken
      if (this.isConnected.value) {
        this.reconnect()
      }
    })
  }

  private log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    const logData = {
      ...data,
      timestamp: new Date().toISOString()
    }
    switch (level) {
      case 'info':
        console.log(message, logData)
        break
      case 'error':
        console.error(message, logData)
        break
      case 'warn':
        console.warn(message, logData)
        break
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('error', 'Max reconnection attempts reached', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      })
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.log('info', 'Attempting to reconnect...', {
      attempt: this.reconnectAttempts + 1,
      delay: `${delay}ms`,
      lastUrl: this.ws?.url
    })

    setTimeout(() => {
      this.reconnectAttempts++
      if (!this.token) {
        this.log('error', 'Reconnection failed: No valid token available')
        return
      }
      this.connect()
    }, delay)
  }

  public connect() {
    if (this.isConnected.value || this.isConnecting.value) {
      this.log('info', 'WebSocket connection already exists or is connecting', {
        isConnected: this.isConnected.value,
        isConnecting: this.isConnecting.value
      })
      return
    }

    this.isConnecting.value = true
    try {
      if (!this.token) {
        throw new Error('No valid token available for connection')
      }
      const wsUrl = `${this.url}?token=${this.token}`
      this.log('info', 'Attempting to connect WebSocket...', {
        url: wsUrl,
        reconnectAttempts: this.reconnectAttempts
      })
      this.ws = new WebSocket(wsUrl)
      this.setupEventHandlers()
    } catch (err) {
      this.handleConnectionError(err)
    }
  }

  private handleConnectionError(error: any) {
    this.log('error', 'WebSocket connection error:', { error })
    this.isConnecting.value = false
    this.handleReconnect()
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = this.handleOpen.bind(this)
    this.ws.onclose = this.handleClose.bind(this)
    this.ws.onerror = this.handleError.bind(this)
    this.ws.onmessage = this.handleIncomingMessage.bind(this)
  }

  private handleOpen() {
    this.log('info', 'WebSocket connected successfully', {
      url: this.ws?.url,
      reconnectAttempts: this.reconnectAttempts
    })
    this.isConnected.value = true
    this.isConnecting.value = false
    this.reconnectAttempts = 0
    this.startHeartbeat()
  }

  private handleClose(event: CloseEvent) {
    this.log('info', 'WebSocket connection closed', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    })
    this.resetConnection()
    this.handleReconnect()
  }

  private handleError(error: Event) {
    const target = error.target as WebSocket
    this.log('error', this.getErrorMessage(target.readyState), {
      readyState: target.readyState,
      url: target.url,
      error
    })
    this.resetConnection()
    this.handleReconnect()
  }

  private getErrorMessage(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'Connection failed while attempting to establish WebSocket connection'
      case WebSocket.CLOSING:
        return 'WebSocket connection is in the process of closing'
      case WebSocket.CLOSED:
        return 'WebSocket connection was closed unexpectedly'
      default:
        return 'Unknown WebSocket error'
    }
  }

  private handleIncomingMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data)
      if (message.type === 2) return
      this.handleMessage(message)
    } catch (err) {
      this.log('error', 'Failed to parse WebSocket message:', err)
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message
    const handlers: Record<number, string> = {
      4: 'newMessage',
      5: 'onlineStatus',
      8: 'messageMark',
      9: 'messageRecall'
    }
    
    const eventName = handlers[type]
    if (eventName) {
      this.emit(eventName, data)
    } else {
      this.log('info', 'Unhandled message type:', { type })
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 2 }))
      } else {
        this.log('warn', 'Cannot send heartbeat - WebSocket is not open', {
          connectionState: this.ws?.readyState
        })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private resetConnection() {
    this.isConnected.value = false
    this.isConnecting.value = false
    this.stopHeartbeat()
  }

  private reconnect() {
    this.disconnect()
    this.connect()
  }

  public sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('info', 'WebSocket sending message:', {
        type: message.type,
        data: message
      })
      this.ws.send(JSON.stringify(message))
    } else {
      this.log('error', 'WebSocket is not connected')
    }
  }

  public disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.resetConnection()
  }

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  private emit(event: string, data: any) {
    this.listeners[event]?.forEach(callback => callback(data))
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    }
  }
}

const wsBaseUrl = import.meta.env.DEV ? 'ws://localhost:8090/' : import.meta.env.VITE_WS_URL || 'ws://localhost:8090/'
export const wsService = new WebSocketService(wsBaseUrl)
