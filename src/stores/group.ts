import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tuanchat } from '@/api/instance'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'
import type { UserRole } from '@/api/models/UserRole'
import {useRoleStore} from "@/stores/role.ts";

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
  const roleMap = ref<Map<number, UserRole[]>>(new Map())
  const userInfoMap = ref<Map<number, UserInfoResponse>>(new Map())
  const currentGroup = ref<RoomGroup | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const roleStore = useRoleStore();

  // 获取群组成员列表
  const fetchMembers = async (groupId: number) => {
    if (!groupId) return
    
    loading.value = true
    error.value = null
    try {
      const memberResponse = await tuanchat.groupMemberController.getMemberList(groupId)
      
      if (memberResponse.success && memberResponse.data) {
        
        // 更新成员列表
        const membersList = memberResponse.data.map(member => ({
          uid: member.uid,
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
        error.value = memberResponse.errMsg || '获取群组数据失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取群组成员列表失败'
      console.error('获取群组成员列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取群组角色列表
  const fetchGroupRoles = async (roomId: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await tuanchat.groupRoleController.groupRole(roomId)
      console.log("群聊获取到的角色列表", response.data)

      if (response.success && response.data) {
        // 使用Map缓存群组角色，并只添加不存在的角色
        response.data.forEach(newRole => {
          if (!roleStore.roles.some(existingRole => existingRole.roleId === newRole.roleId)) {
            roleStore.roles.push(newRole)
          }
        })
        // 更新群组角色映射
        roleMap.value.set(roomId, response.data)
      } else {
        error.value = response.errMsg || '获取群组角色列表失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('获取群组角色列表失败:', err)
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
      const response = await tuanchat.groupController.getGroupInfo(groupId)
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

  // 添加成员
  const addMember = async (params: { roomId: number, uid: number, roleId: number, memberType: number }) => {
    const memberAddRequest = {
      roomId: params.roomId,
      userIdList: [params.uid]
    }
    loading.value = true
    error.value = null
    try {
      const response = await tuanchat.groupMemberController.addMember(memberAddRequest)
      if (!response.success) {
        error.value = response.errMsg || '添加成员失败'
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加成员失败'
      console.error('添加成员失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除成员
  const deleteMember = async (params: { roomId: number, uid: number }) => {
    loading.value = true
    error.value = null
    try {
      const memberDelRequest = {
        roomId: params.roomId,
        userIdList: [params.uid]
      }
      const response = await tuanchat.groupMemberController.deleteMember(memberDelRequest)
      if (!response.success) {
        error.value = response.errMsg || '删除成员失败'
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除成员失败'
      console.error('删除成员失败:', err)
      throw err
    } finally {
      loading.value = false
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
    fetchGroupRoles,
    setCurrentGroupId,
    getMemberTypeText,
    addMember,
    deleteMember
  }
})