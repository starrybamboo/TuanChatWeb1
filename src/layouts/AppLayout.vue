<script setup lang="ts">
import LoginDialog from '../components/LoginDialog.vue'
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'
import { tuanchat } from '@/api/instance'

const userStore = useUserStore()
const loginDialog = ref()
const navItems = [
  { name: '推荐', path: '/feed' },
  { name: '社区', path: '/community' },
  { name: '游玩', path: '/chat' },
  { name: '角色', path: '/role' },
  { name: '模组', path: '/module' },
  { name: '创作', path: '/create' }
]

// 监听token变化，当token存在但userInfo不存在时，自动获取用户信息
watch(() => userStore.token, async (newToken) => {
  if (newToken && !userStore.userInfo) {
    try {
      // 从token中提取用户ID（假设token中包含用户ID）
      // 这里需要根据实际情况调整获取用户ID的方式
      const userId = Number(newToken) // 或者其他方式获取用户ID
      const userInfo = await tuanchat.userController.getUserInfo(userId)
      userStore.setUserInfo(userInfo.data!)
    } catch (error) {
      console.error('自动获取用户信息失败：', error)
      // 如果获取用户信息失败，清除token
      userStore.clearUserInfo()
    }
  }
}, { immediate: true })

// 组件挂载时，如果有token但没有userInfo，尝试获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      const userId = Number(userStore.token) // 或者其他方式获取用户ID
      const userInfo = await tuanchat.userController.getUserInfo(userId)
      userStore.setUserInfo(userInfo.data!)
    } catch (error) {
      console.error('初始化获取用户信息失败：', error)
      userStore.clearUserInfo()
    }
  }
})
</script>

<template>
  <div class="app-container">
    
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <img src="/favicon.ico" alt="Logo" class="logo-img" />
        </div>
        <nav class="main-nav">
          <ul class="nav-list">
            <li v-for="item in navItems" :key="item.path" class="nav-item">
              <router-link :to="item.path" class="nav-link">{{ item.name }}</router-link>
            </li>
          </ul>
        </nav>
      </div>
      <div class="header-right">
        <div class="user-section">
          <template v-if="userStore.token && userStore.userInfo">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="user-avatar"></el-avatar>
              <span class="username">{{ userStore.userInfo.username }}</span>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人中心</el-dropdown-item>
                    <el-dropdown-item>设置</el-dropdown-item>
                    <el-dropdown-item @click="userStore.clearUserInfo()">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="loginDialog.show()">登录</el-button>
          </template>
          <login-dialog ref="loginDialog" />
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
}

.app-header {
  height: 64px;
  background-color: #fff;
  border-bottom: 1px solid #e3e5e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 32px;
  width: 32px;
}

.main-nav {
  margin-left: 20px;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 20px;
}

.nav-item {
  font-size: 14px;
}

.nav-link {
  color: #18191c;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #00aeec;
  background-color: #f6f7f8;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.app-main {
  margin-top: 64px;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
}
</style>