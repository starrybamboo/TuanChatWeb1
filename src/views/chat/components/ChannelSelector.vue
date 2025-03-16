<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'
import { tuanchat } from '@/api/instance'
import ChatContent from './ChatContent.vue'

const groupStore = useGroupStore()

// 定义服务器和频道的接口
interface Server {
  id: number;
  name: string;
  icon: string;
  hasNotification: boolean;
  children?: Server[];
}

// 服务器列表数据
const servers = ref<Server[]>([]);

// 当前选中的服务器ID
const activeServerId = ref<number | null>(null);

// 初始化服务器列表
const initServers = async () => {
  try {
    const response = await tuanchat.roomGroupController.getUserGroups()
    if (response.data) {
      // 分离一级群组和二级群组
      const firstLevelGroups = response.data.filter(group => group.parentGroupId == group.roomId)
      const secondLevelGroups = response.data

      // 更新服务器列表，将二级群组作为一级群组的子元素
      servers.value = firstLevelGroups.map(group => ({
        id: group.roomId,
        name: group.name,
        icon: group.avatar || '🏠',
        hasNotification: false,
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

// 当前选中的二级群组ID
const activeSubGroupId = ref<number | null>(null);

// 更新二级群组列表
const updateSubGroups = (serverId: number) => {
  const server = servers.value.find(s => s.id === serverId);
  if (server && server.children && server.children.length > 0) {
    // 默认选中第一个二级群组
    const firstSubGroup = server.children[0];
    activeSubGroupId.value = firstSubGroup.id;
    switchSubGroup(firstSubGroup.id);
  }
};

// 当前选中的频道ID
const activeChannelId = ref(1);

// 切换二级群组
const props = defineProps<{
  chatContentRef: InstanceType<typeof ChatContent>
}>();

const switchSubGroup = (subGroupId: number) => {
  // 更新选中状态
  activeSubGroupId.value = subGroupId;
  // 更新当前群组ID
  groupStore.setCurrentGroupId(subGroupId);
  // 调用ChatContent组件的初始化方法
  if (props.chatContentRef?.initializeChat) {
    props.chatContentRef.initializeChat(subGroupId);
  }
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
    <div class="server-list primary-servers">
      <template v-for="server in servers" :key="server.id">
        <div class="server-item" :class="{
        'has-notification': server.hasNotification,
        'active': activeServerId === server.id
      }" @click="() => {
        activeServerId = server.id;
        updateSubGroups(server.id);
      }">
          <div class="server-icon">
            <img v-if="server.icon && server.icon.startsWith('http')" :src="server.icon" @error="server.icon = '🏠'" />
            <span v-else>{{ server.icon }}</span>
          </div>
          <div class="server-name">{{ server.name }}</div>
          <div class="notification-dot" v-if="server.hasNotification"></div>
        </div>
      </template>
    </div>

    <!-- 二级群组列表 -->
    <div class="server-list secondary-servers">
      <template v-if="activeServerId && servers.find(s => s.id === activeServerId)?.children">
        <div v-for="subGroup in servers.find(s => s.id === activeServerId)?.children" :key="subGroup.id"
          class="server-item" :class="{
        'has-notification': subGroup.hasNotification,
        'active': activeSubGroupId === subGroup.id
      }" @click="switchSubGroup(subGroup.id)">
          <div class="server-icon">
            <img v-if="subGroup.icon && subGroup.icon.startsWith('http')" :src="subGroup.icon"
              @error="subGroup.icon = '📚'" />
            <span v-else>{{ subGroup.icon }}</span>
          </div>
          <div class="server-name">{{ subGroup.name }}</div>
          <div class="notification-dot" v-if="subGroup.hasNotification"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.channel-selector {
  width: 480px;
  background-color: #2f3136;
  display: flex;
  flex-direction: row;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.server-list {
  padding: 12px;
}

.primary-servers {
  width: 72px;
  background-color: #202225;
  border-right: 1px solid #42464d;
  position: relative;

  .server-item {
    flex-direction: column;
    text-align: center;

    .server-name {
      font-size: 12px;
      margin-top: 4px;
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.primary-servers::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(79, 84, 92, 0.3), transparent);
}

.secondary-servers {
  flex: 1;
  background-color: #2f3136;
  overflow-y: auto;
  position: relative;
}

.server-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.server-icon {
  width: 48px;
  height: 48px;
  background-color: #36393f;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.server-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.server-name {
  color: #96989d;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  transition: color 0.3s ease;
}

.server-item:hover {
  background-color: rgba(79, 84, 92, 0.3);
  transform: translateX(4px);
}

.server-item:hover .server-icon {
  border-radius: 12px;
  background-color: #5865f2;
  transform: scale(1.05);
}

.server-item:hover .server-icon img {
  transform: scale(1.1);
}

.server-item:hover .server-name {
  color: #ffffff;
}

.server-item.active {
  background-color: rgba(88, 101, 242, 0.15);
}

.server-item.active .server-icon {
  border-radius: 12px;
  background-color: #5865f2;
  transform: scale(1.05);
}

.server-item.active .server-name {
  color: #ffffff;
  font-weight: 600;
}

.notification-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #ed4245;
  border-radius: 50%;
  border: 2px solid #2f3136;
  transform: translate(25%, -25%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(237, 66, 69, 0.4);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(237, 66, 69, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(237, 66, 69, 0);
  }
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
