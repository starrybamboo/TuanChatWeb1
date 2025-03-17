<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoleStore } from '@/stores/role'
import { useGroupStore } from '@/stores/group'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'select-role', roleId: number): void
}>()

const roleStore = useRoleStore()
const groupStore = useGroupStore()

// 获取当前群组可用的角色列表
const availableRoles = computed(() => {
  if (!groupStore.currentGroupId) return []
  const groupRoles = Array.from(groupStore.roleMap.values())
  return roleStore.roles.filter(role =>
    groupRoles.some(groupRole => groupRole.roleId === role.roleId)
  )
})

// 关闭选择器
const closeSelector = () => {
  emit('update:show', false)
}

// 选择角色
const selectRole = (roleId: number) => {
  roleStore.fetchRoleById(roleId)
  emit('select-role', roleId)
  closeSelector()
}
</script>

<template>
  <div v-if="show" class="role-selector-overlay" @click="closeSelector">
    <div class="role-selector" @click.stop>
      <div class="role-selector-header">
        <h3>选择角色</h3>
        <button class="close-btn" @click="closeSelector">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path>
          </svg>
        </button>
      </div>
      <div class="role-list">
        <div v-for="role in availableRoles" :key="role.roleId" class="role-item" @click="selectRole(role.roleId)">
          <div class="role-name">{{ role.roleName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.role-selector {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.role-selector-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.role-list {
  display: grid;
  gap: 10px;
}

.role-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.role-name {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}
</style>