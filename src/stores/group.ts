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
  // 当前群组ID
  const currentGroupId = ref<number | null>(null)
  
  // 群组成员列表
  const members = ref<GroupMember[]>([])
  
  // 群组角色映射
  const roleMap = ref<Map<number, any>>(new Map())

  // 用户信息映射
  const userInfoMap = ref<Map<number, UserInfoResponse>>(new Map())

  // 当前群组信息
  const currentGroup = ref<RoomGroup | null>(null)

  // 获取群组成员列表
  const fetchMembers = async (groupId: number) => {
    try {
      // 获取成员列表
      const memberResponse = await tuanchat.roomGroupController.getMemberList({
        roomId: groupId
      })
      
      // 获取角色列表
      const roleResponse = await tuanchat.roomGroupController.groupRole(groupId)
      
      if (memberResponse.data && roleResponse.data) {
        // 创建角色映射
        roleMap.value = new Map(roleResponse.data.map(role => [role.roleId, role]))
        
        members.value = memberResponse.data.map(member => ({
          uid: member.uid,
          roleId: member.roleId,
          memberType: member.memberType
        }))

        // 获取所有成员的用户信息
        await Promise.all(members.value.map(async member => {
          if (member.uid) {
            try {
              const userInfoResponse = await tuanchat.userController.getUserInfo(member.uid)
              if (userInfoResponse.data) {
                userInfoMap.value.set(member.uid, userInfoResponse.data)
              }
            } catch (error) {
              console.error(`获取用户 ${member.uid} 信息失败:`, error)
            }
          }
        }))
      }
    } catch (error) {
      console.error('获取群组成员列表失败:', error)
    }
  }

  // 获取群组信息
  const fetchGroupInfo = async (groupId: number) => {
    try {
      const response = await tuanchat.roomGroupController.groupDetail(groupId)
      if (response.data) {
        currentGroup.value = response.data
      }
    } catch (error) {
      console.error('获取群组信息失败:', error)
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
    currentGroupId,
    currentGroup,
    members,
    roleMap,
    userInfoMap,
    fetchMembers,
    fetchGroupInfo,
    setCurrentGroupId,
    getMemberTypeText
  }
})