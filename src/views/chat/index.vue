<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { wsService } from '@/services/websocket'

// 服务器列表数据
const servers = ref([
  { id: 1, name: 'TuanChat', icon: '🏠', hasNotification: false },
  { id: 2, name: '游戏频道', icon: '🎮', hasNotification: true },
  { id: 3, name: '学习小组', icon: '📚', hasNotification: false },
  { id: 4, name: '音乐分享', icon: '🎵', hasNotification: false },
  { id: 5, name: '电影讨论', icon: '🎬', hasNotification: true },
]);

// 频道分类和频道列表
const channelCategories = ref([
  {
    id: 1,
    name: '文字频道',
    isExpanded: true,
    channels: [
      { id: 1, name: '公告', unread: false, selected: true, type: 'text' },
      { id: 2, name: '一般讨论', unread: true, selected: false, type: 'text' },
      { id: 3, name: '问题求助', unread: false, selected: false, type: 'text' },
    ]
  },
  {
    id: 2,
    name: '语音频道',
    isExpanded: true,
    channels: [
      { id: 4, name: '语音聊天室', unread: false, selected: false, type: 'voice' },
      { id: 5, name: '音乐分享', unread: false, selected: false, type: 'voice' },
    ]
  }
]);

// 当前选中的频道ID
const activeChannelId = ref(1);

// 群组成员列表
const members = ref([
  { id: 1, username: '管理员', tag: '0001', status: 'online', role: 'admin', avatar: '👑' },
  { id: 2, username: '小明', tag: '1234', status: 'online', role: 'member', avatar: '😊' },
  { id: 3, username: '小红', tag: '5678', status: 'idle', role: 'member', avatar: '🙂' },
  { id: 4, username: '小刚', tag: '9012', status: 'dnd', role: 'member', avatar: '😎' },
  { id: 5, username: '小李', tag: '3456', status: 'offline', role: 'member', avatar: '🤔' },
]);

// 消息列表
const messages = ref([
  { id: 1, userId: 2, username: '小明', avatar: '😊', content: '大家好，这是一个测试消息', timestamp: '今天 12:30', reactions: [{emoji: '👍', count: 2}] },
  { id: 2, userId: 3, username: '小红', avatar: '🙂', content: '你好，这是回复消息', timestamp: '今天 12:32', reactions: [] },
  { id: 3, userId: 1, username: '管理员', avatar: '👑', content: '欢迎来到群聊！', timestamp: '今天 12:35', reactions: [{emoji: '❤️', count: 3}] },
]);

// 新消息内容
const newMessage = ref('');

// 是否显示成员列表
const showMemberList = ref(true);

// 切换频道分类展开/折叠状态
const toggleCategory = (categoryId: number) => {
  const category = channelCategories.value.find(c => c.id === categoryId);
  if (category) {
    category.isExpanded = !category.isExpanded;
  }
};

// 切换频道
const switchChannel = (channelId: number) => {
  // 重置之前选中的频道
  channelCategories.value.forEach(category => {
    category.channels.forEach(channel => {
      if (channel.id === activeChannelId.value) {
        channel.selected = false;
      }
      if (channel.id === channelId) {
        channel.selected = true;
        channel.unread = false; // 标记为已读
      }
    });
  });
  activeChannelId.value = channelId;
};

// 发送消息
async function sendMessage() {
  if (!newMessage.value.trim() || !chatStore.currentRoomId) return
  
  await chatStore.sendMessage({
    roomId: chatStore.currentRoomId,
    content: newMessage.value,
    messageType: 1, // 文本消息
    roleId: 0, // 需要从当前选择的角色中获取
    avatarId: 0, // 需要从当前选择的角色中获取
    body: {}
  })
  
  newMessage.value = ''
}

// 切换成员列表显示/隐藏
const toggleMemberList = () => {
  showMemberList.value = !showMemberList.value;
};

// 初始化时自动滚动到消息底部
onMounted(() => {
  setTimeout(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 100);
});

const chatStore = useChatStore()
const loading = ref(false)
const hasMore = ref(true)

// 初始化聊天
async function initializeChat(roomId: number) {
  chatStore.currentRoomId = roomId
  loading.value = true
  
  try {
    const result = await chatStore.loadMessages(roomId)
    hasMore.value = !result?.isLast
  } finally {
    loading.value = false
  }
}

// 加载更多消息
async function loadMoreMessages() {
  if (!hasMore.value || loading.value || !chatStore.currentRoomId) return
  
  loading.value = true
  try {
    const firstMessage = chatStore.messages[0]
    if (firstMessage) {
      const result = await chatStore.loadMessages(
        chatStore.currentRoomId,
        firstMessage.message.messageID
      )
      hasMore.value = !result?.isLast
    }
  } finally {
    loading.value = false
  }
}

// 监听滚动加载更多消息
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (target.scrollTop === 0) {
    loadMoreMessages()
  }
}

onMounted(() => {
  // 连接WebSocket
  wsService.connect()
  chatStore.initializeWebSocket()
  
  // 初始化默认房间的消息
  initializeChat(1) // 假设默认房间ID为1
  
  const messagesContainer = document.querySelector('.messages-container')
  if (messagesContainer) {
    messagesContainer.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const messagesContainer = document.querySelector('.messages-container')
  if (messagesContainer) {
    messagesContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="discord-container">
    <!-- 左侧服务器导航栏 -->
    <div class="server-sidebar">
      <div class="server-item home">
        <div class="server-icon">TC</div>
      </div>
      <div class="server-divider"></div>
      
      <div v-for="server in servers" :key="server.id" class="server-item">
        <div class="server-icon" :class="{ 'has-notification': server.hasNotification }">
          {{ server.icon }}
        </div>
      </div>
      
      <div class="server-item add">
        <div class="server-icon">+</div>
      </div>
      
      <div class="server-item explore">
        <div class="server-icon">🔍</div>
      </div>
    </div>
    
    <!-- 左侧频道导航栏 -->
    <div class="channel-sidebar">
      <div class="server-header">
        <div class="server-name">TuanChat 服务器</div>
        <button class="server-settings-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 12.001C7 10.8964 6.10457 10.001 5 10.001C3.89543 10.001 3 10.8964 3 12.001C3 13.1055 3.89543 14.001 5 14.001C6.10457 14.001 7 13.1055 7 12.001ZM14 12.001C14 10.8964 13.1046 10.001 12 10.001C10.8954 10.001 10 10.8964 10 12.001C10 13.1055 10.8954 14.001 12 14.001C13.1046 14.001 14 13.1055 14 12.001ZM19 10.001C20.1046 10.001 21 10.8964 21 12.001C21 13.1055 20.1046 14.001 19 14.001C17.8954 14.001 17 13.1055 17 12.001C17 10.8964 17.8954 10.001 19 10.001Z"></path>
          </svg>
        </button>
      </div>
      
      <div class="channels-container">
        <!-- 频道分类 -->
        <div v-for="category in channelCategories" :key="category.id" class="channel-category">
          <div class="category-header" @click="toggleCategory(category.id)">
            <div class="category-arrow" :class="{ 'expanded': category.isExpanded }">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"></path>
              </svg>
            </div>
            <div class="category-name">{{ category.name }}</div>
          </div>
          
          <!-- 频道列表 -->
          <div class="channel-list" v-show="category.isExpanded">
            <div 
              v-for="channel in category.channels" 
              :key="channel.id" 
              class="channel-item"
              :class="{ 'selected': channel.selected }"
              @click="switchChannel(channel.id)"
            >
              <div class="channel-icon">
                <svg v-if="channel.type === 'text'" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path>
                </svg>
              </div>
              <div class="channel-name">{{ channel.name }}</div>
              <div v-if="channel.unread" class="unread-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部用户信息栏 -->
      <div class="user-panel">
        <div class="user-avatar">
          <div class="avatar-circle">TC</div>
          <div class="user-status online"></div>
        </div>
        <div class="user-info">
          <div class="username">TuanChat用户</div>
          <div class="user-tag">#1234</div>
        </div>
        <div class="user-actions">
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3 3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path>
              <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path>
            </svg>
          </button>
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
            </svg>
          </button>
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="content-header">
        <div class="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>
          </svg>
          <span>一般讨论</span>
        </div>
        <div class="header-divider"></div>
        <div class="header-description">这是一个用于一般性讨论的频道</div>
        <div class="header-actions">
          <button class="header-btn" @click="toggleMemberList">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z"></path>
              <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z"></path>
              <path fill="currentColor" d="M21.0884 7.40445C21.6411 8.24929 21.874 9.29031 21.6879 10.3047C21.5019 11.3191 20.9076 12.2048 20.0633 12.7576C19.2189 13.3103 18.1783 13.5428 17.1643 13.3567C16.1503 13.1706 15.265 12.5759 14.7127 11.7312C15.4688 10.7416 15.9074 9.57059 15.9074 8.35709C15.9074 7.14359 15.4688 5.97259 14.7127 4.98298C15.265 4.13815 16.1503 3.54349 17.1643 3.35741C18.1783 3.17133 19.2189 3.40396 20.0633 3.95668C20.9076 4.5094 21.5019 5.39515 21.6879 6.40951C21.874 7.42387 21.6411 8.4649 21.0884 9.30973"></path>
            </svg>
          </button>
          <button class="header-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 15H15C15 16.66 13.65 18 12 18C10.35 18 9 16.66 9 15H4.99V5H19V15Z"></path>
            </svg>
          </button>
          <button class="header-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.691 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.691 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.103 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 消息区域 -->
      <div class="messages-container" @scroll="handleScroll">
        <div v-if="loading" class="loading-messages">
          加载中...
        </div>
        
        <div v-for="msg in chatStore.messages" :key="msg.message.messageID" class="message">
          <div class="message-avatar">
            <!-- 这里需要根据avatarId获取对应的头像URL -->
            😊
          </div>
          <div class="message-content">
            <div class="message-header">
              <div class="message-username">
                <!-- 这里需要根据roleId获取角色名称 -->
                用户
              </div>
              <div class="message-timestamp">
                {{ new Date(msg.message.createTime).toLocaleString() }}
              </div>
            </div>
            <div class="message-text">{{ msg.message.content }}</div>
            <div v-if="msg.messageMark?.length" class="message-reactions">
              <div v-for="mark in msg.messageMark" 
                   :key="mark.messageMarkId" 
                   class="reaction">
                <span class="reaction-emoji">👍</span>
                <span class="reaction-count">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 消息输入框 -->
      <div class="message-input-container">
        <div class="input-wrapper">
          <button class="attach-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z"></path>
            </svg>
          </button>
          <input 
            type="text" 
            class="message-input" 
            placeholder="发送消息" 
            v-model="newMessage"
            @keyup.enter="sendMessage"
          />
          <div class="input-actions">
            <button class="emoji-btn">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM8 13H16C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13ZM8 11C7.44772 11 7 10.5523 7 10C7 9.44772 7.44772 9 8 9C8.55228 9 9 9.44772 9 10C9 10.5523 8.55228 11 8 11ZM16 11C15.4477 11 15 10.5523 15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11Z"></path>
              </svg>
            </button>
            <button class="gift-btn">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16.886 7.999H20C21.104 7.999 22 8.896 22 9.999V11.999H2V9.999C2 8.896 2.897 7.999 4 7.999H7.114C6.663 7.764 6.236 7.477 5.879 7.121C4.709 5.951 4.709 4.048 5.879 2.879C7.012 1.746 8.986 1.746 10.121 2.877C11.758 4.514 11.979 7.595 11.998 7.941C11.9991 7.9525 11.9966 7.96279 11.9941 7.97304C11.992 7.98151 11.99 7.98995 11.99 7.999H12.01C12.01 7.98986 12.0079 7.98134 12.0058 7.97287C12.0034 7.96282 12.0009 7.95286 12.002 7.942C12.022 7.596 12.242 4.515 13.879 2.878C15.014 1.745 16.986 1.746 18.121 2.877C19.29 4.049 19.29 5.952 18.121 7.121C17.764 7.477 17.337 7.764 16.886 7.999ZM7.293 5.707C6.903 5.316 6.903 4.682 7.293 4.292C7.481 4.103 7.732 4 8 4C8.268 4 8.519 4.103 8.707 4.292C9.297 4.882 9.641 5.94 9.825 6.822C8.945 6.639 7.879 6.293 7.293 5.707ZM14.174 6.824C14.359 5.941 14.702 4.883 15.293 4.293C15.481 4.103 15.732 4 16 4C16.268 4 16.519 4.103 16.706 4.291C17.096 4.682 17.097 5.316 16.707 5.707C16.116 6.298 15.057 6.642 14.174 6.824ZM3 13.999V19.999C3 21.102 3.897 21.999 5 21.999H11V13.999H3ZM13 13.999V21.999H19C20.104 21.999 21 21.102 21 19.999V13.999H13Z"></path>
              </svg>
            </button>
            <button class="gif-btn">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2 2C0.895431 2 0 2.89543 0 4V20C0 21.1046 0.895431 22 2 22H22C23.1046 22 24 21.1046 24 20V4C24 2.89543 23.1046 2 22 2H2ZM9.76445 11.448V15.48C8.90045 16.044 7.88045 16.356 6.74045 16.356C4.11245 16.356 2.66045 14.628 2.66045 12.072C2.66045 9.504 4.23245 7.764 6.78845 7.764C7.80845 7.764 8.66045 8.004 9.32045 8.376L9.04445 10.164C8.42045 9.768 7.68845 9.456 6.83645 9.456C5.40845 9.456 4.71245 10.512 4.71245 12.06C4.71245 13.62 5.43245 14.712 6.86045 14.712C7.31645 14.712 7.64045 14.616 7.97645 14.448V13.084H6.42845V11.448H9.76445ZM11.5481 7.92H13.6001V16.2H11.5481V7.92ZM20.4724 7.92V9.636H17.5564V11.328H19.8604V13.044H17.5564V16.2H15.5164V7.92H20.4724Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧成员列表 -->
    <div class="members-sidebar" v-if="showMemberList">
      <div class="members-header">成员列表 - {{ members.length }}</div>
      <div class="members-groups">
        <div class="member-group">
          <div class="member-group-name">在线 - {{ members.filter(m => m.status === 'online').length }}</div>
          <div class="member-list">
            <div 
              v-for="member in members.filter(m => m.status === 'online')" 
              :key="member.id" 
              class="member-item"
            >
              <div class="member-avatar">{{ member.avatar }}</div>
              <div class="member-info">
                <div class="member-name" :class="{ 'admin': member.role === 'admin' }">{{ member.username }}</div>
              </div>
              <div class="member-status" :class="member.status"></div>
            </div>
          </div>
        </div>
        
        <div class="member-group">
          <div class="member-group-name">离开 - {{ members.filter(m => m.status === 'idle' || m.status === 'dnd').length }}</div>
          <div class="member-list">
            <div 
              v-for="member in members.filter(m => m.status === 'idle' || m.status === 'dnd')" 
              :key="member.id" 
              class="member-item"
            >
              <div class="member-avatar">{{ member.avatar }}</div>
              <div class="member-info">
                <div class="member-name" :class="{ 'admin': member.role === 'admin' }">{{ member.username }}</div>
              </div>
              <div class="member-status" :class="member.status"></div>
            </div>
          </div>
        </div>
        
        <div class="member-group">
          <div class="member-group-name">离线 - {{ members.filter(m => m.status === 'offline').length }}</div>
          <div class="member-list">
            <div 
              v-for="member in members.filter(m => m.status === 'offline')" 
              :key="member.id" 
              class="member-item"
            >
              <div class="member-avatar">{{ member.avatar }}</div>
              <div class="member-info">
                <div class="member-name" :class="{ 'admin': member.role === 'admin' }">{{ member.username }}</div>
              </div>
              <div class="member-status offline"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.discord-container {
  display: flex;
  height: calc(100vh - 64px);
  background-color: #36393f;
  color: #dcddde;
  font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 服务器侧边栏样式 */
.server-sidebar {
  width: 72px;
  background-color: #202225;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.server-item {
  margin-bottom: 8px;
  position: relative;
  cursor: pointer;
}

.server-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #36393f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcddde;
  font-size: 18px;
  transition: border-radius 0.15s ease-out, background-color 0.15s ease-out;
}

.server-icon:hover {
  border-radius: 16px;
  background-color: #5865f2;
  color: white;
}

.server-item.home .server-icon {
  background-color: #5865f2;
  color: white;
}

.server-divider {
  height: 2px;
  width: 32px;
  background-color: #36393f;
  margin: 8px 0;
}

.has-notification:after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #f04747;
  border-radius: 50%;
  bottom: 0;
  right: 0;
}

/* 频道侧边栏样式 */
.channel-sidebar {
  width: 240px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.server-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-weight: bold;
  box-shadow: 0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05);
}

.server-name {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.server-settings-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
}

.server-settings-btn:hover {
  color: #dcddde;
}

.channels-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.channel-category {
  margin-bottom: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  color: #8e9297;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.category-arrow {
  margin-right: 4px;
  transition: transform 0.2s;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
}

.channel-list {
  margin-left: 8px;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  color: #8e9297;
  cursor: pointer;
  margin-bottom: 2px;
}

.channel-item:hover {
  background-color: rgba(79, 84, 92, 0.16);
  color: #dcddde;
}

.channel-item.selected {
  background-color: rgba(79, 84, 92, 0.32);
  color: white;
}

.channel-icon {
  margin-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #f04747;
  border-radius: 50%;
}

/* 用户面板样式 */
.user-panel {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #292b2f;
}

.user-avatar {
  position: relative;
  margin-right: 8px;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.user-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #292b2f;
}

.user-status.online {
  background-color: #3ba55d;
}

.user-status.idle {
  background-color: #faa61a;
}

.user-status.dnd {
  background-color: #f04747;
}

.user-status.offline {
  background-color: #747f8d;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-tag {
  font-size: 12px;
  color: #b9bbbe;
}

.user-actions {
  display: flex;
}

.action-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 4px;
  margin-left: 4px;
}

.action-btn:hover {
  color: #dcddde;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  height: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.header-title svg {
  margin-right: 8px;
}

.header-divider {
  height: 24px;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.06);
  margin: 0 16px;
}

.header-description {
  flex: 1;
  color: #b9bbbe;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 8px;
  margin-left: 4px;
}

.header-btn:hover {
  color: #dcddde;
}

/* 消息区域样式 */
.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message-avatar {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 36px;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.message-username {
  font-weight: 500;
  color: white;
  margin-right: 8px;
}

.message-timestamp {
  font-size: 12px;
  color: #72767d;
}

.message-text {
  color: #dcddde;
  line-height: 1.4;
}

.message-reactions {
  display: flex;
  margin-top: 8px;
}

.reaction {
  display: flex;
  align-items: center;
  background-color: rgba(79, 84, 92, 0.16);
  border-radius: 4px;
  padding: 4px 6px;
  margin-right: 4px;
  cursor: pointer;
}

.reaction:hover {
  background-color: rgba(79, 84, 92, 0.32);
}

.reaction-emoji {
  margin-right: 4px;
}

.reaction-count {
  font-size: 12px;
  color: #b9bbbe;
}

/* 消息输入框样式 */
.message-input-container {
  padding: 0 16px 24px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #40444b;
  border-radius: 8px;
  padding: 0 16px;
}

.attach-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 10px 0;
  margin-right: 16px;
}

.message-input {
  flex: 1;
  height: 44px;
  background: none;
  border: none;
  color: #dcddde;
  font-size: 16px;
  outline: none;
}

.message-input::placeholder {
  color: #72767d;
}

.input-actions {
  display: flex;
}

.emoji-btn, .gift-btn, .gif-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 10px;
}

.emoji-btn:hover, .gift-btn:hover, .gif-btn:hover {
  color: #dcddde;
}

/* 成员列表样式 */
.members-sidebar {
  width: 240px;
  background-color: #2f3136;
  overflow-y: auto;
}

.members-header {
  padding: 24px 16px 0;
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.member-group {
  margin-bottom: 16px;
}

.member-group-name {
  padding: 0 16px;
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.member-list {
  padding: 0 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.member-item:hover {
  background-color: rgba(79, 84, 92, 0.16);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.member-info {
  flex: 1;
}

.member-name {
  color: #8e9297;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-name.admin {
  color: #ed4245;
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
}

.member-status.online {
  background-color: #3ba55d;
}

.member-status.idle {
  background-color: #faa61a;
}

.member-status.dnd {
  background-color: #f04747;
}

.member-status.offline {
  background-color: #747f8d;
}

.loading-messages {
  text-align: center;
  padding: 20px;
  color: #8e9297;
}
</style>
</template>
