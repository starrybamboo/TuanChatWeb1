<script setup lang="ts">

const navItems = [
  { name: '推荐', path: '/feed' },
  { name: '社区', path: '/community' },
  { name: '游玩', path: '/play' },
  { name: '角色', path: '/role' },
  { name: '模组', path: '/module' },
  { name: '创作', path: '/create' }
]
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
          <el-button type="primary" size="small">登录</el-button>
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

.app-main {
  margin-top: 64px;
  flex: 1;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f6f7f8;
  color: #000000;
}
</style>