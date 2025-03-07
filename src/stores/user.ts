import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfoResponse } from '@/api/models/UserInfoResponse'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfoResponse | null>(null)

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

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUserInfo
  }
})