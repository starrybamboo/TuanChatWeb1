import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'
import { tuanchat } from '@/api/instance'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfoResponse | null>(null)
  const userControllerApi = tuanchat.userController
  // 用户信息缓存
  const userInfoCache = ref<Map<number, UserInfoResponse>>(new Map())

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

  // 同步获取用户名称
  const getUsernameById = (userId: number): string => {
    const cachedUser = userInfoCache.value.get(userId)
    return cachedUser?.username || ''
  }

  // 异步加载用户信息到缓存
  const loadUserInfo = async (userId: number) => {
    try {
      const response = await userControllerApi.getUserInfo(userId)
      if (response.success && response.data) {
        userInfoCache.value.set(userId, response.data)
      }
    } catch (error) {
      console.error('Failed to load user info:', error)
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUserInfo,
    getUsernameById,
    loadUserInfo,
    userInfoCache
  }
})