import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'
import { tuanchat } from '@/api/instance'

/**
 * 用户管理Store
 * 负责管理用户登录状态、用户信息和用户信息缓存
 * 维护用户Token和用户信息的获取与更新
 */
export const useUserStore = defineStore('user', () => {
  /** 用户登录Token */
  const token = ref<string | null>(localStorage.getItem('token'))
  /** 当前用户信息 */
  const userInfo = ref<UserInfoResponse | null>(null)
  /** 用户控制器API实例 */
  const userControllerApi = tuanchat.userController
  /** 用户信息缓存映射，key为用户ID */
  const userInfoCache = ref<Map<number, UserInfoResponse>>(new Map())

  /**
   * 设置用户Token
   * 同时更新localStorage中的Token
   * @param newToken 新的Token值
   */
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  /**
   * 设置用户信息
   * @param info 用户信息
   */
  const setUserInfo = (info: UserInfoResponse | null) => {
    userInfo.value = info
  }

  /**
   * 清空用户信息
   * 清除Token和用户信息
   */
  const clearUserInfo = () => {
    setToken(null)
    setUserInfo(null)
  }

  /**
   * 同步获取用户名称
   * @param userId 用户ID
   * @returns 用户名称，如果未找到则返回空字符串
   */
  const getUsernameById = (userId: number): string => {
    const cachedUser = userInfoCache.value.get(userId)
    return cachedUser?.username || ''
  }

  /**
   * 异步加载用户信息到缓存
   * @param userId 用户ID
   */
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