<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/role'
import { useGroupStore } from '@/stores/group'
import MessageInput from './MessageInput.vue'
import AvatarSelector from './AvatarSelector.vue'

defineEmits(['show-avatar-selector', 'toggle-member-list'])

const chatStore = useChatStore()
const roleStore = useRoleStore()
const groupStore = useGroupStore();
const loading = ref(false)
const hasMore = ref(true)

// 编辑相关的状态
const editingMessage = ref<any>(null)
const showAvatarSelector = ref(false)
const selectedMessageId = ref<number | null>(null)

// 初始化聊天
async function initializeChat(roomId: number) {
  chatStore.currentRoomId = roomId
  loading.value = true
  
  try {
    // 加载消息
    const result = await chatStore.loadMessages(roomId)
    hasMore.value = !result?.isLast
    
    // 预加载所有消息中的角色信息
    if (result?.list) {
      const roleIds = new Set(result.list.map(msg => msg.message.roleId))

      await Promise.all(Array.from(roleIds).map(async roleId => {
        const role = await roleStore.fetchRoleById(roleId)
        if (role) {
          const existingRole = roleStore.roles.find(r => r.roleId === roleId)
          if (!existingRole) {
            roleStore.roles.push(role)
          }
        }
      }))

      // 等待DOM更新后滚动到底部
      await nextTick(() => {
        const messagesContainer = document.querySelector('.messages-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      })
    }
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
      const messagesContainer = document.querySelector('.messages-container')
      const oldHeight = messagesContainer?.scrollHeight || 0
      const oldScrollTop = messagesContainer?.scrollTop || 0

      const result = await chatStore.loadMessages(chatStore.currentRoomId)
      hasMore.value = !result?.isLast

      // 等待DOM更新后调整滚动位置
      await nextTick(() => {
        if (messagesContainer) {
          const newHeight = messagesContainer.scrollHeight
          const heightDiff = newHeight - oldHeight
          messagesContainer.scrollTop = oldScrollTop + heightDiff
        }
      })
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

// 开始编辑消息
function startEditMessage(msg: any) {
  editingMessage.value = { ...msg.message }
}

// 保存编辑的消息
async function saveEditMessage() {
  if (!editingMessage.value) return
  
  try {
    await chatStore.updateMessage(editingMessage.value)
    editingMessage.value = null
  } catch (error) {
    console.error('Failed to save message:', error)
  }
}

// 取消编辑消息
function cancelEditMessage() {
  editingMessage.value = null
}

// 处理头像选择
function handleSelectAvatar(avatarId: number) {
  if (!selectedMessageId.value) return
  
  const message = chatStore.messages.find(msg => msg.message.messageID === selectedMessageId.value)
  if (message) {
    const updatedMessage = { ...message.message, avatarId }
    chatStore.updateMessage(updatedMessage)
  }
  
  showAvatarSelector.value = false
  selectedMessageId.value = null
}

// 显示头像选择器
function showAvatarSelectorDialog(messageId: number, roleId: number) {
  selectedMessageId.value = messageId
  
  showAvatarSelector.value = true
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
        <span>{{ groupStore.currentGroup?.roomName || '故事回顾' }}</span>
      </div>
      <div class="header-actions">
        <button class="header-btn" @click="$emit('toggle-member-list')">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006Z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="messages-container" @scroll="handleScroll">
      <div v-if="loading" class="loading-messages">
        加载中...
      </div>
      
      <div v-for="(msg, index) in chatStore.messages" :key="String(msg.message.messageID)" 
           :class="[`message`, {
             'merged': index > 0 && 
                      chatStore.messages[index - 1].message.roleId === msg.message.roleId&&
                      new Date(msg.message.createTime).getTime() - new Date(chatStore.messages[index - 1].message.createTime).getTime() < 300000
           }]">
        <div class="character-portrait" @click="showAvatarSelectorDialog(msg.message.messageID, msg.message.roleId)">
          <el-avatar :size="80" :src="chatStore.getMessageAvatarUrl(msg.message.avatarId)" class="portrait-image"/>
        </div>
        <div class="message-box">
          <div class="message-name">
            {{ roleStore.getRoleNameById(msg.message.roleId) }}
          </div>
          <div class="message-content">
            <div class="message-text" @click="startEditMessage(msg)" v-if="editingMessage?.messageID !== msg.message.messageID">
              {{ msg.message.content }}
            </div>
            <div v-else class="message-edit">
              <el-input
                v-model="editingMessage.content"
                type="textarea"
                :rows="3"
                @keydown.enter.prevent="saveEditMessage"
                @keyup.esc="cancelEditMessage"
              />
              <div class="edit-actions">
                <el-button size="small" @click="saveEditMessage">保存</el-button>
                <el-button size="small" @click="cancelEditMessage">取消</el-button>
              </div>
            </div>
            <div class="message-timestamp">{{ new Date(msg.message.createTime).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <MessageInput @show-avatar-selector="$emit('show-avatar-selector')" />
    
    <AvatarSelector
      v-model:show="showAvatarSelector"
      :role-id="selectedMessageId ? chatStore.messages.find(msg => msg.message.messageID === selectedMessageId)?.message.roleId : undefined"
      @select="handleSelectAvatar"
    />
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
  font-family: 'Noto Serif SC', serif;
}

.content-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.header-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.header-btn:hover {
  opacity: 1;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.message {
  display: flex;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
  padding: 0.125rem 1rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.message:hover {
  background: rgba(4, 4, 5, 0.07);
}

.message:not(.merged) {
  margin-top: 1.0625rem;
}

.message:not(.merged) .character-portrait,
.message:not(.merged) .message-name {
  display: block;
}

.message.merged {
  margin-top: 0;
  padding-left: calc(80px + 1rem + 1rem);
}

.message.merged .character-portrait,
.message.merged .message-name {
  display: none;
}

.message.merged .message-text {
  padding: 2px 0;
}

.character-portrait {
  width: 80px;
  min-width: 80px;
  height: 80px;
  margin-right: 16px;
  margin-top: 2px;
}

.portrait-image {
  width: 80px !important;
  height: 80px !important;
  border: none;
  border-radius: 4px !important;
  transition: all 0.2s ease;
}

.portrait-image:hover {
  box-shadow: 0 0 0 2px #fff;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-box {
  flex: 1;
  position: relative;
  transition: all 0.2s ease;
}

.message-name {
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
  cursor: pointer;
  display: inline-block;
}

.message-name:hover {
  text-decoration: underline;
}

.message-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.message-edit {
  width: 100%;
  margin: 8px 0;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.message-text {
  cursor: pointer;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
}

.message-text:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
  margin: -4px -8px;
}
</style>