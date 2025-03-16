import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tuanchat } from '@/api/instance'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'

export interface GroupMember {
  uid?: number
  roleId?: number
  memberType?: number
}

export interface RoomGroup {
  roomId?: number
  roomName?: string
  roomDesc?: string
  roomBackground?: string
  createTime?: string
  updateTime?: string
}

export const useGroupStore = defineStore('group', () => {
  // 状态
  const currentGroupId = ref<number | null>(null)
  const members = ref<Map<number, GroupMember[]>>(new Map())
  const roleMap = ref<Map<number, any>>(new Map())
  const userInfoMap = ref<Map<number, UserInfoResponse>>(new Map())
  const currentGroup = ref<RoomGroup | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取群组成员列表
  const fetchMembers = async (groupId: number) => {
    if (!groupId) return
    
    loading.value = true
    error.value = null
    try {
      const [memberResponse, roleResponse] = await Promise.all([
        tuanchat.roomGroupController.getMemberList(groupId),
        tuanchat.roomGroupController.groupRole(groupId)
      ])
      
      if (memberResponse.success && roleResponse.success && memberResponse.data && roleResponse.data) {
        // 更新角色映射
        roleMap.value = new Map(roleResponse.data.map(role => [role.roleId, role]))
        
        // 更新成员列表
        const membersList = memberResponse.data.map(member => ({
          uid: member.uid,
          roleId: member.roleId,
          memberType: member.memberType
        }))
        members.value.set(groupId, membersList)
        
        // 批量获取用户信息
        const userPromises = membersList
          .filter(member => member.uid)
          .map(member => 
            tuanchat.userController.getUserInfo(member.uid!)
              .then(response => {
                if (response.success && response.data) {
                  userInfoMap.value.set(member.uid!, response.data)
                }
              })
              .catch(error => {
                console.error(`获取用户 ${member.uid} 信息失败:`, error)
              })
          )
        
        await Promise.all(userPromises)
      } else {
        error.value = memberResponse.errMsg || roleResponse.errMsg || '获取群组数据失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取群组成员列表失败'
      console.error('获取群组成员列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取群组信息
  const fetchGroupInfo = async (groupId: number) => {
    if (!groupId) return
    
    loading.value = true
    error.value = null
    try {
      const response = await tuanchat.roomGroupController.groupDetail(groupId)
      if (response.success && response.data) {
        currentGroup.value = response.data
      } else {
        error.value = response.errMsg || '获取群组信息失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取群组信息失败'
      console.error('获取群组信息失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 设置当前群组ID
  const setCurrentGroupId = (groupId: number) => {
    currentGroupId.value = groupId
    fetchMembers(groupId)
    fetchGroupInfo(groupId)
  }

  // 获取成员类型文字说明
  const getMemberTypeText = (type: number): string => {
    switch (type) {
      case 1:
        return '主持人';
      case 2:
        return '玩家';
      case 3:
        return '观战';
      default:
        return `类型: ${type}`;
    }
  }

  return {
    // 状态
    currentGroupId,
    currentGroup,
    members,
    roleMap,
    userInfoMap,
    loading,
    error,
    // 方法
    fetchMembers,
    fetchGroupInfo,
    setCurrentGroupId,
    getMemberTypeText
  }
})