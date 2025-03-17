<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/role'
import { useAvatarStore } from '@/stores/avatar'

const chatStore = useChatStore()
const roleStore = useRoleStore()
const avatarStore = useAvatarStore()
const newMessage = ref('')

// 在组件挂载时获取角色列表
onMounted(async () => {
  await roleStore.fetchRoles()
  if (roleStore.roles.length > 0) {
    roleStore.currentRole = roleStore.roles[0]
  }
})

// 发送消息
async function sendMessage() {
  if (!newMessage.value.trim() || !chatStore.currentRoomId || !roleStore.currentRole) return

  await chatStore.sendMessage({
    roomId: chatStore.currentRoomId,
    content: newMessage.value,
    messageType: 1, // 文本消息
    roleId: roleStore.currentRole.roleId,
    avatarId: roleStore.currentRole.avatarId || 0n,
    body: {}
  })

  newMessage.value = ''
}
</script>

<template>
  <div class="message-input-container">
    <div class="role-info">
      <div class="role-avatar" @click="$emit('show-avatar-selector')">
        <img v-if="roleStore.currentRole?.avatarId" :src="avatarStore.getAvatarUrl(roleStore.currentRole.avatarId)"
          alt="角色头像" />
        <div v-else class="avatar-placeholder">选择头像</div>
      </div>
    </div>
    <div style="flex: 1; min-width: 0; width: 100%;">
      <div class="role-name" @click="$emit('show-role-selector')">
        {{ roleStore.currentRole?.roleName || '选择角色' }}
      </div>
    <div class="input-wrapper">
      <button class="attach-btn">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z">
          </path>
        </svg>
      </button>
      <input type="text" class="message-input" placeholder="发送消息" v-model="newMessage" @keyup.enter="sendMessage" />
      <div class="input-actions">
        <button class="emoji-btn">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM8 13H16C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13ZM8 11C7.44772 11 7 10.5523 7 10C7 9.44772 7.44772 9 8 9C8.55228 9 9 9.44772 9 10C9 10.5523 8.55228 11 8 11ZM16 11C15.4477 11 15 10.5523 15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11Z">
            </path>
          </svg>
        </button>
        <button class="gift-btn">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M16.886 7.999H20C21.104 7.999 22 8.896 22 9.999V11.999H2V9.999C2 8.896 2.897 7.999 4 7.999H7.114C6.663 7.764 6.236 7.477 5.879 7.121C4.709 5.951 4.709 4.048 5.879 2.879C7.012 1.746 8.986 1.746 10.121 2.877C11.758 4.514 11.979 7.595 11.998 7.941C11.9991 7.9525 11.9966 7.96279 11.9941 7.97304C11.992 7.98151 11.99 7.98995 11.99 7.999H12.01C12.01 7.98986 12.0079 7.98134 12.0058 7.97287C12.0034 7.96282 12.0009 7.95286 12.002 7.942C12.022 7.596 12.242 4.515 13.879 2.878C15.014 1.745 16.986 1.746 18.121 2.877C19.29 4.049 19.29 5.952 18.121 7.121C17.764 7.477 17.337 7.764 16.886 7.999ZM7.293 5.707C6.903 5.316 6.903 4.682 7.293 4.292C7.481 4.103 7.732 4 8 4C8.268 4 8.519 4.103 8.707 4.292C9.297 4.882 9.641 5.94 9.825 6.822C8.945 6.639 7.879 6.293 7.293 5.707ZM14.174 6.824C14.359 5.941 14.702 4.883 15.293 4.293C15.481 4.103 15.732 4 16 4C16.268 4 16.519 4.103 16.706 4.291C17.096 4.682 17.097 5.316 16.707 5.707C16.116 6.298 15.057 6.642 14.174 6.824ZM3 13.999V19.999C3 21.102 3.897 21.999 5 21.999H11V13.999H3ZM13 13.999V21.999H19C20.104 21.999 21 21.102 21 19.999V13.999H13Z">
            </path>
          </svg>
        </button>
        <button class="gif-btn">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M2 2C0.895431 2 0 2.89543 0 4V20C0 21.1046 0.895431 22 2 22H22C23.1046 22 24 21.1046 24 20V4C24 2.89543 23.1046 2 22 2H2ZM9.76445 11.448V15.48C8.90045 16.044 7.88045 16.356 6.74045 16.356C4.11245 16.356 2.66045 14.628 2.66045 12.072C2.66045 9.504 4.23245 7.764 6.78845 7.764C7.80845 7.764 8.66045 8.004 9.32045 8.376L9.04445 10.164C8.42045 9.768 7.68845 9.456 6.83645 9.456C5.40845 9.456 4.71245 10.512 4.71245 12.06C4.71245 13.62 5.43245 14.712 6.86045 14.712C7.31645 14.712 7.64045 14.616 7.97645 14.448V13.084H6.42845V11.448H9.76445ZM11.5481 7.92H13.6001V16.2H11.5481V7.92ZM20.4724 7.92V9.636H17.5564V11.328H19.8604V13.044H17.5564V16.2H15.5164V7.92H20.4724Z">
            </path>
          </svg>
        </button>
      </div>
    </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.message-input-container {
  position: relative;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Noto Serif SC', serif;
  display: flex;
  align-items: center;
  gap: 20px;
}

.role-info {
  display: flex;
  align-items: center;
  padding: 0;
  flex-shrink: 0;
}

.role-avatar {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  margin-right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.role-avatar:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.02);
}

.role-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-name {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.role-name:hover {
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
}

.attach-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 16px;
  padding: 10px 0;
  font-family: 'Noto Serif SC', serif;
  min-width: 0;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.message-input:focus {
  outline: none;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emoji-btn,
.gift-btn,
.gif-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s ease;
}

.emoji-btn:hover,
.gift-btn:hover,
.gif-btn:hover,
.attach-btn:hover {
  color: #ffffff;
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-input-container {
  animation: fadeIn 0.3s ease-out;
}
</style>