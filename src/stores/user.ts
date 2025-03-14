import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'
import { tuanchat } from '@/api/instance'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfoResponse | null>(null)
  const userControllerApi = tuanchat.userController

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUserInfo = (info: UserInfoResponse | null) => {
    userInfo.value = info
  }

  const clearUserInfo = () => {
    setToken(null)
    setUserInfo(null)
  }

  // 获取用户名称
  async function getUsernameById(userId: number) {
    try {
      const response = await userControllerApi.getUserInfo(userId)
      if (response.success && response.data) {
        return response.data.username
      }
      return ''
    } catch (error) {
      console.error('Failed to get username:', error)
      return ''
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUserInfo,
    getUsernameById
  }
})