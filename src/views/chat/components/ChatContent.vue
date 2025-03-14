<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/role'
import MessageInput from './MessageInput.vue'

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
        <button class="header-btn" @click="$emit('toggle-member-list')">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z"></path>
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
        <el-avatar :size="40" :src="chatStore.getMessageAvatarUrl(msg.message.avatarId)" class="message-avatar"/>
        <div class="message-content">
          <div class="message-header">
            <div class="message-username">
              {{ useRoleStore().getRoleNameById(msg.message.roleId) }}
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
    <MessageInput />
  </div>
</template>

<style scoped>
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
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
  color: #72767d;
  font-size: 12px;
}

.message-text {
  color: #dcddde;
  font-size: 16px;
  line-height: 1.375;
}

.message-reactions {
  display: flex;
  margin-top: 4px;
}

.reaction {
  background-color: rgba(79, 84, 92, 0.16);
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.reaction:hover {
  background-color: rgba(79, 84, 92, 0.32);
}

.reaction-emoji {
  margin-right: 4px;
}

.reaction-count {
  color: #b9bbbe;
  font-size: 14px;
}

.loading-messages {
  text-align: center;
  padding: 20px;
  color: #8e9297;
}
</style>