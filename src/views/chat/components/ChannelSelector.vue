<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'

const groupStore = useGroupStore()

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
  // 更新当前群组ID
  groupStore.setCurrentGroupId(channelId);
};

// 初始化时设置默认群组
onMounted(() => {
  // 设置默认选中的频道为当前群组
  if (activeChannelId.value) {
    groupStore.setCurrentGroupId(activeChannelId.value);
  }
});
</script>

<template>
  <div class="channel-selector">
    <!-- 服务器列表 -->
    <div class="server-list">
      <div 
        v-for="server in servers" 
        :key="server.id"
        class="server-item"
        :class="{ 'has-notification': server.hasNotification }"
      >
        <div class="server-icon">{{ server.icon }}</div>
        <div class="notification-dot" v-if="server.hasNotification"></div>
      </div>
    </div>

    <!-- 频道列表 -->
    <div class="channel-list">
      <div 
        v-for="category in channelCategories" 
        :key="category.id"
        class="category"
      >
        <div class="category-header" @click="toggleCategory(category.id)">
          <span>{{ category.name }}</span>
          <span class="toggle-icon">{{ category.isExpanded ? '▼' : '▶' }}</span>
        </div>
        
        <div class="channels" v-show="category.isExpanded">
          <div
            v-for="channel in category.channels"
            :key="channel.id"
            class="channel-item"
            :class="{ 
              'selected': channel.selected,
              'unread': channel.unread 
            }"
            @click="switchChannel(channel.id)"
          >
            {{ channel.type === 'voice' ? '🔊' : '#' }}{{ channel.name }}
            <div class="unread-indicator" v-if="channel.unread"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.channel-selector {
  width: 240px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
}

.server-list {
  width: 72px;
  background-color: #202225;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.server-item {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.server-icon {
  width: 48px;
  height: 48px;
  background-color: #36393f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: border-radius 0.2s;
}

.server-item:hover .server-icon {
  border-radius: 16px;
  background-color: #5865f2;
}

.notification-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  background-color: #ed4245;
  border-radius: 50%;
}

.channel-list {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.category-header {
  color: #96989d;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.category-header:hover {
  color: #dcddde;
}

.channels {
  margin-top: 4px;
}

.channel-item {
  position: relative;
  padding: 8px;
  margin: 2px 0;
  border-radius: 4px;
  color: #96989d;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: all 0.2s;
}

.channel-item:hover {
  background-color: rgba(79, 84, 92, 0.6);
  color: #dcddde;
}

.channel-item.selected {
  background-color: #40444b;
  color: #ffffff;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #dcddde;
  border-radius: 50%;
  margin-left: auto;
}

.user-panel {
  background-color: #292b2f;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #3ba55c;
  border-radius: 50%;
  border: 2px solid #292b2f;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.status {
  font-size: 12px;
  color: #b9bbbe;
}
</style>
