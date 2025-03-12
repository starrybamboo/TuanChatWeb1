<script setup lang="ts">
import { ref } from 'vue'

// 模拟数据
const posts = ref([
  {
    id: 1,
    community: 'r/TuanChat社区',
    author: 'u/TuanUser123',
    timeAgo: '5小时前',
    title: '大家对团剧共创平台有什么期待？',
    content: '作为一个新兴的创作平台，大家希望在这里看到什么样的功能和内容呢？欢迎分享你的想法！',
    upvotes: 128,
    comments: 32,
    isJoined: false
  },
  {
    id: 2,
    community: 'r/角色设计',
    author: 'u/CharacterDesigner',
    timeAgo: '8小时前',
    title: '分享我的最新角色设计作品',
    content: '这是我最近为一个团剧项目设计的主角，灵感来源于中国传统文化元素，希望大家喜欢！',
    upvotes: 256,
    comments: 48,
    isJoined: true
  },
  {
    id: 3,
    community: 'r/剧本创作',
    author: 'u/Scriptwriter',
    timeAgo: '1天前',
    title: '如何写好一个引人入胜的开场？',
    content: '我正在创作一个新的团剧剧本，但对开场部分感到困惑。有什么好的技巧可以快速吸引观众的注意力？',
    upvotes: 75,
    comments: 23,
    isJoined: false
  }
])

// 热门社区
const communities = ref([
  { name: 'r/角色设计', members: '2.5万成员', isJoined: true },
  { name: 'r/剧本创作', members: '1.8万成员', isJoined: false },
  { name: 'r/即兴表演', members: '1.2万成员', isJoined: false },
  { name: 'r/舞台技巧', members: '9千成员', isJoined: false },
  { name: 'r/团剧评论', members: '5千成员', isJoined: true }
])

// 排序选项
const sortOptions = ref(['热门', '最新', '最多评论', '最多点赞'])
const selectedSort = ref('热门')

// 切换加入状态
const toggleJoin = (post: {isJoined: boolean}) => {
  post.isJoined = !post.isJoined
}

// 切换社区加入状态
const toggleCommunityJoin = (community: {isJoined: boolean}) => {
  community.isJoined = !community.isJoined
}
</script>

<template>
  <div class="community-container">
    <div class="community-layout">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">主页</h3>
          <ul class="sidebar-menu">
            <li class="sidebar-menu-item active"><i class="icon">🏠</i> 首页</li>
            <li class="sidebar-menu-item"><i class="icon">🔥</i> 热门</li>
            <li class="sidebar-menu-item"><i class="icon">🧭</i> 探索</li>
            <li class="sidebar-menu-item"><i class="icon">📱</i> 全部</li>
          </ul>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">我的社区</h3>
          <ul class="sidebar-menu">
            <li v-for="community in communities.filter(c => c.isJoined)" :key="community.name" class="sidebar-menu-item">
              <i class="icon">👥</i> {{ community.name }}
            </li>
          </ul>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">热门社区</h3>
          <div class="community-list">
            <div v-for="community in communities" :key="community.name" class="community-item">
              <div class="community-info">
                <div class="community-name">{{ community.name }}</div>
                <div class="community-members">{{ community.members }}</div>
              </div>
              <button 
                class="join-button" 
                :class="{ 'joined': community.isJoined }"
                @click="toggleCommunityJoin(community)"
              >
                {{ community.isJoined ? '已加入' : '加入' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 顶部导航 -->
        <div class="content-header">
          <div class="sort-options">
            <button 
              v-for="option in sortOptions" 
              :key="option" 
              class="sort-button"
              :class="{ 'active': selectedSort === option }"
              @click="selectedSort = option"
            >
              {{ option }}
            </button>
          </div>
          <div class="view-options">
            <button class="view-button active">卡片</button>
            <button class="view-button">列表</button>
          </div>
        </div>
        
        <!-- 帖子列表 -->
        <div class="posts-container">
          <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-sidebar">
              <button class="vote-button upvote">▲</button>
              <div class="vote-count">{{ post.upvotes }}</div>
              <button class="vote-button downvote">▼</button>
            </div>
            
            <div class="post-content">
              <div class="post-header">
                <span class="post-community">{{ post.community }}</span>
                <span class="post-metadata">由 {{ post.author }} 发布于 {{ post.timeAgo }}</span>
              </div>
              
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-text">{{ post.content }}</p>
              
              <div class="post-actions">
                <button class="post-action-button">
                  <i class="icon">💬</i> {{ post.comments }} 评论
                </button>
                <button class="post-action-button">
                  <i class="icon">🔄</i> 分享
                </button>
                <button class="post-action-button">
                  <i class="icon">🔖</i> 收藏
                </button>
                <button 
                  class="join-button" 
                  :class="{ 'joined': post.isJoined }"
                  @click="toggleJoin(post)"
                >
                  {{ post.isJoined ? '已加入' : '加入' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.community-container {
  padding: 0;
  background-color: #1a1a1b;
  color: #d7dadc;
  min-height: calc(100vh - 64px);
}

.community-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 左侧边栏样式 */
.sidebar {
  width: 260px;
  margin-right: 24px;
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: 24px;
  background-color: #272729;
  border-radius: 4px;
  padding: 12px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: #818384;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu-item {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 2px;
}

.sidebar-menu-item:hover {
  background-color: #343536;
}

.sidebar-menu-item.active {
  background-color: #343536;
  font-weight: 500;
}

.icon {
  margin-right: 8px;
  font-size: 16px;
}

.community-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.community-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.community-info {
  flex: 1;
}

.community-name {
  font-size: 14px;
  font-weight: 500;
}

.community-members {
  font-size: 12px;
  color: #818384;
}

.join-button {
  background-color: #ff4500;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 4px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.join-button:hover {
  background-color: #e03d00;
}

.join-button.joined {
  background-color: #272729;
  border: 1px solid #d7dadc;
  color: #d7dadc;
}

.join-button.joined:hover {
  border-color: #ff4500;
  color: #ff4500;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background-color: #272729;
  border-radius: 4px;
  padding: 12px 16px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-button, .view-button {
  background: none;
  border: none;
  color: #818384;
  padding: 6px 12px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
}

.sort-button:hover, .view-button:hover {
  background-color: #343536;
  color: #d7dadc;
}

.sort-button.active, .view-button.active {
  background-color: #343536;
  color: #d7dadc;
  font-weight: 500;
}

.view-options {
  display: flex;
  gap: 8px;
}

/* 帖子卡片样式 */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  display: flex;
  background-color: #272729;
  border-radius: 4px;
  overflow: hidden;
}

.post-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background-color: #1a1a1b;
  width: 40px;
}

.vote-button {
  background: none;
  border: none;
  color: #818384;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.vote-button:hover {
  color: #d7dadc;
}

.vote-button.upvote:hover {
  color: #ff4500;
}

.vote-button.downvote:hover {
  color: #7193ff;
}

.vote-count {
  font-size: 12px;
  font-weight: 700;
  margin: 4px 0;
}

.post-content {
  flex: 1;
  padding: 16px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #818384;
}

.post-community {
  font-weight: 500;
  color: #d7dadc;
  margin-right: 8px;
}

.post-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #d7dadc;
}

.post-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  color: #d7dadc;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-action-button {
  background: none;
  border: none;
  color: #818384;
  padding: 6px 8px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.post-action-button:hover {
  background-color: #343536;
  color: #d7dadc;
}

.post-action-button .icon {
  margin-right: 4px;
}
</style>