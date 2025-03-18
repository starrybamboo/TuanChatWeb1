import { defineStore } from 'pinia';
import type { RoleAvatar } from '@/api/models/RoleAvatar';
import type { RoleAvatarRequest } from '@/api/models/RoleAvatarRequest';
import type { RoleAvatarCreateRequest } from '@/api/models/RoleAvatarCreateRequest';
import { tuanchat } from '@/api/instance';

export const useAvatarStore = defineStore('avatar', {
  state: () => ({
    /** 角色的所有头像列表 */
    avatars: [] as RoleAvatar[],
    /** 当前选中的头像 */
    currentAvatar: null as RoleAvatar | null,
    /** avatarId到avatarUrl的映射，用于快速获取头像URL */
    avatarMap: new Map<number, string>(),
    /** avatarId到spriteUrl的映射，用于快速获取精灵图URL */
    spriteUrlMap: new Map<number, string>(),
    /** avatarId到avatarTitle的映射，用于快速获取头像标题 */
    avatarTitleMap: new Map<number, string>(),
    /** 加载状态标识 */
    loading: false,
    /** 错误信息 */
    error: null as string | null
  }),
  getters: {
    /**
     * 获取指定角色的所有头像
     * @param roleId 角色ID
     * @returns 角色的头像列表
     */
    getRoleAvatars: (state) => (roleId: number | undefined) => {
      if (!roleId) return [];
      return state.avatars.filter(avatar => avatar.roleId === roleId);
    },
    /**
     * 根据头像ID获取头像URL
     * @param avatarId 头像ID
     * @returns 头像URL
     */
    getAvatarUrl: (state) => (avatarId: number | undefined) => {
      if (!avatarId) return '';
      return state.avatarMap.get(avatarId) || '';
    },
    /**
     * 根据头像ID获取精灵图URL
     * @param avatarId 头像ID
     * @returns 精灵图URL
     */
    getSpriteUrl: (state) => (avatarId: number | undefined) => {
      if (!avatarId) return '';
      return state.spriteUrlMap.get(avatarId) || '';
    },
    /**
     * 根据头像ID获取头像标题
     * @param avatarId 头像ID
     * @returns 头像标题
     */
    getAvatarTitle: (state) => (avatarId: number | undefined) => {
      if (!avatarId) return '';
      return state.avatarTitleMap.get(avatarId) || '';
    },
    /**
     * 获取所有头像列表
     * @returns 所有头像列表
     */
    getAllAvatars: (state) => {
      return state.avatars;
    }
  },
  actions: {    
    /**
     * 获取角色的所有头像
     * @param roleId 角色ID
     * @returns 角色的头像列表
     */
    async fetchRoleAvatars(roleId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.getRoleAvatars(roleId);
        if (response.success && response.data) {
          this.avatars = response.data;
          // 更新头像映射
          this.updateAvatarMap(response.data);
          return response.data;
        } else {
          this.error = response.errMsg || '获取头像列表失败';
          return [];
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
        return [];
      } finally {
        this.loading = false;
      }
    },
    /**
     * 根据ID获取头像详情
     * @param avatarId 头像ID
     * @returns 头像详情
     */
    async fetchAvatarById(avatarId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.avatarController.getRoleAvatar(avatarId);
        if (response.success && response.data) {
          this.currentAvatar = response.data;
          // 更新头像映射
          if (response.data.avatarId) {
            if (response.data.avatarUrl) {
              this.avatarMap.set(response.data.avatarId, response.data.avatarUrl);
            }
            if (response.data.spriteUrl) {
              this.spriteUrlMap.set(response.data.avatarId, response.data.spriteUrl);
            }
            if (response.data.avatarTitle) {
              this.avatarTitleMap.set(response.data.avatarId, response.data.avatarTitle);
            }
          }
          return response.data;
        } else {
          this.error = response.errMsg || '获取头像详情失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * 创建新头像
     * @param roleId 角色ID
     * @returns 新创建的头像信息
     */
    async createAvatar(roleId: number) {
      this.loading = true;
      this.error = null;
      try {
        const requestBody: RoleAvatarCreateRequest = {
          roleId: roleId
        };
        const response = await tuanchat.avatarController.setRoleAvatar(requestBody);
        if (response.success && response.data) {
          // 创建成功后，获取新创建的头像详情
          const avatarId = response.data;
          const newAvatar = await this.fetchAvatarById(avatarId);
          if (newAvatar) {
            this.avatars.push(newAvatar);
          }
          return newAvatar;
        } else {
          this.error = response.errMsg || '创建头像失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * 更新头像信息
     * @param avatarData 头像更新数据
     * @returns 更新后的头像信息
     */
    async updateAvatar(avatarData: RoleAvatarRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.avatarController.updateRoleAvatar(avatarData);
        if (response.success && response.data) {
          const updatedAvatar = response.data;
          // 更新头像列表中的对应项
          if (updatedAvatar.avatarId) {
            const index = this.avatars.findIndex(avatar => avatar.avatarId === updatedAvatar.avatarId);
            if (index !== -1) {
              this.avatars[index] = updatedAvatar;
            }
            // 更新当前选中的头像（如果是同一个）
            if (this.currentAvatar && this.currentAvatar.avatarId === updatedAvatar.avatarId) {
              this.currentAvatar = updatedAvatar;
            }
            // 更新头像映射
            if (updatedAvatar.avatarUrl) {
              this.avatarMap.set(updatedAvatar.avatarId, updatedAvatar.avatarUrl);
            }
            if (updatedAvatar.spriteUrl) {
              this.spriteUrlMap.set(updatedAvatar.avatarId, updatedAvatar.spriteUrl);
            }
            if (updatedAvatar.avatarTitle) {
              this.avatarTitleMap.set(updatedAvatar.avatarId, updatedAvatar.avatarTitle);
            }
          }
          return updatedAvatar;
        } else {
          this.error = response.errMsg || '更新头像失败';
          return null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * 删除头像
     * @param avatarId 头像ID
     * @returns 是否删除成功
     */
    async deleteAvatar(avatarId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.avatarController.deleteRoleAvatar(avatarId);
        if (response.success) {
          // 从列表中移除
          this.avatars = this.avatars.filter(avatar => avatar.avatarId !== avatarId);
          // 如果当前选中的是被删除的头像，则清空当前选中
          if (this.currentAvatar && this.currentAvatar.avatarId === avatarId) {
            this.currentAvatar = null;
          }
          // 从映射中移除
          this.avatarMap.delete(avatarId);
          this.spriteUrlMap.delete(avatarId);
          this.avatarTitleMap.delete(avatarId);
          return true;
        } else {
          this.error = response.errMsg || '删除头像失败';
          return false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
        return false;
      } finally {
        this.loading = false;
      }
    },
    /**
     * 更新头像映射
     * 更新avatarMap、spriteUrlMap和avatarTitleMap
     * @param avatars 头像列表
     */
    updateAvatarMap(avatars: RoleAvatar[]) {
      avatars.forEach(avatar => {
        if (avatar.avatarId) {
          if (avatar.avatarUrl) {
            this.avatarMap.set(avatar.avatarId, avatar.avatarUrl);
          }
          if (avatar.spriteUrl) {
            this.spriteUrlMap.set(avatar.avatarId, avatar.spriteUrl);
          }
          if (avatar.avatarTitle) {
            this.avatarTitleMap.set(avatar.avatarId, avatar.avatarTitle);
          }
        }
      });
    },
    /**
     * 清空状态
     * 重置所有状态为初始值
     */
    clearAvatarState() {
      this.avatars = [];
      this.currentAvatar = null;
      this.avatarMap.clear();
      this.spriteUrlMap.clear();
      this.avatarTitleMap.clear();
      this.loading = false;
      this.error = null;
    }
  }
});