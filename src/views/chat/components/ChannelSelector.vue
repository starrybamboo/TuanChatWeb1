<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'
import { tuanchat } from '@/api/instance'

const groupStore = useGroupStore()

// 服务器列表数据
const servers = ref<any[]>([]);

// 当前选中的服务器ID
const activeServerId = ref<number | null>(null);

// 初始化服务器列表
const initServers = async () => {
  try {
    const response = await tuanchat.roomGroupController.getUserGroups()
    if (response.data) {
      // 分离一级群组和二级群组
      const firstLevelGroups = response.data.filter(group => group.parentGroupId === group.roomId)
      const secondLevelGroups = response.data.filter(group => group.parentGroupId !== group.roomId)
      
      // 更新服务器列表，将二级群组作为一级群组的子元素
      servers.value = firstLevelGroups.map(group => ({
        id: group.roomId,
        name: group.name,
        icon: group.avatar || '🏠',
        hasNotification: false,
        isExpanded: true, // 默认展开状态
        children: secondLevelGroups
          .filter(subGroup => subGroup.parentGroupId === group.roomId)
          .map(subGroup => ({
            id: subGroup.roomId,
            name: subGroup.name,
            icon: subGroup.avatar || '📚',
            hasNotification: false
          }))
      }))
    }
  } catch (error) {
    console.error('获取群组列表失败:', error)
  }
}

// 频道分类和频道列表
interface Channel {
  id: number;
  name: string;
  unread: boolean;
  selected: boolean;
  type: string;
}

interface ChannelCategory {
  id: number;
  name: string;
  isExpanded: boolean;
  channels: Channel[];
}

const channelCategories = ref<ChannelCategory[]>([]);

// 更新频道列表
const updateChannels = (serverId: number) => {
  const server = servers.value.find(s => s.id === serverId);
  if (server && server.children) {
    channelCategories.value = [
      {
        id: 1,
        name: '文字频道',
        isExpanded: true,
        channels: server.children.map(child => ({
          id: child.id,
          name: child.name,
          unread: false,
          selected: false,
          type: 'text'
        }))
      }
    ];
    // 默认选中第一个频道
    if (channelCategories.value[0].channels.length > 0) {
      switchChannel(channelCategories.value[0].channels[0].id);
    }
  }
};

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

// 初始化时设置默认群组并获取群组列表
onMounted(async () => {
  await initServers()
  // 设置默认选中的频道为当前群组
  if (activeChannelId.value) {
    groupStore.setCurrentGroupId(activeChannelId.value);
  }
});
</script>

<template>
  <div class="channel-selector">
    <!-- 服务器列表容器 -->
    <div class="server-container">
      <!-- 一级群组列表 -->
      <div class="server-list primary-servers">
        <template v-for="server in servers" :key="server.id">
          <div 
            class="server-item"
            :class="{ 
              'has-notification': server.hasNotification,
              'active': activeServerId === server.id
            }"
            @click="() => {
              activeServerId = server.id;
              updateChannels(server.id);
            }"
          >
            <div class="server-icon">
              <img v-if="server.icon && server.icon.startsWith('http')" :src="server.icon" @error="server.icon = '🏠'" />
              <span v-else>{{ server.icon }}</span>
            </div>
            <div class="server-name">{{ server.name }}</div>
            <div class="notification-dot" v-if="server.hasNotification"></div>
            <span class="toggle-icon" @click.stop="server.isExpanded = !server.isExpanded">{{ server.isExpanded ? '▼' : '▶' }}</span>
          </div>
          <!-- 二级群组列表 -->
          <transition name="slide">
            <div v-if="server.isExpanded" class="child-servers">
              <div 
                v-for="child in server.children" 
                :key="child.id"
                class="server-item child-server"
                :class="{ 'has-notification': child.hasNotification }"
                @click="() => {
                  activeServerId = child.id;
                  updateChannels(child.id);
                }"
              >
                <div class="server-icon">
                  <img v-if="child.icon && child.icon.startsWith('http')" :src="child.icon" @error="child.icon = '📚'" />
                  <span v-else>{{ child.icon }}</span>
                </div>
                <div class="server-name">{{ child.name }}</div>
                <div class="notification-dot" v-if="child.hasNotification"></div>
              </div>
            </div>
          </transition>
        </template>
      </div>

      <!-- 频道列表（替换原二级群组列表位置） -->
      <div class="server-list secondary-servers channel-list">
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
  </div>
</template>

<style scoped>
.channel-selector {
  width: 480px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
}

.server-container {
  display: flex;
  flex-direction: row;
  background-color: #202225;
  padding: 12px;
  gap: 12px;
}

.server-list {
  padding: 12px;
}

.primary-servers {
  width: 240px;
  border-right: 1px solid #42464d;
}

.secondary-servers {
  flex: 1;
  background-color: #2f3136;
  overflow-y: auto;
}

.server-item {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
}

.server-icon {
  width: 40px;
  height: 40px;
  background-color: #36393f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: border-radius 0.2s;
  overflow: hidden;
  flex-shrink: 0;
}

.server-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.server-name {
  color: #96989d;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.server-item:hover {
  background-color: rgba(79, 84, 92, 0.6);
}

.server-item:hover .server-icon {
  border-radius: 16px;
  background-color: #5865f2;
}

.server-item:hover .server-name {
  color: #ffffff;
}

.server-item.active {
  background-color: #40444b;
}

.server-item.active .server-icon {
  border-radius: 16px;
  background-color: #5865f2;
}

.server-item.active .server-name {
  color: #ffffff;
}

.child-servers {
  overflow: hidden;
}

.child-server {
  margin-left: 24px;
  transform: scale(0.95);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toggle-icon {
  cursor: pointer;
  font-size: 12px;
  color: #96989d;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.toggle-icon:hover {
  color: #ffffff;
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
  padding: 12px;
  background-color: #2f3136;
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
