import { defineStore } from 'pinia';
import type { UserRole } from '@/api/models/UserRole';
import { tuanchat } from '@/api/instance';
import { useUserStore } from '@/stores/user';

/**
 * 角色管理Store
 * 负责管理用户角色的状态、获取、创建、更新和删除等操作
 * 维护角色列表和当前选中角色
 */
export const useRoleStore = defineStore('role', {
  state: () => ({
    /** 用户的所有角色列表 */
    roles: [] as UserRole[],
    /** 当前选中的角色 */
    currentRole: null as UserRole | null,
    /** 加载状态标识 */
    loading: false,
    /** 错误信息 */
    error: null as string | null
  }),
  actions: {
    /**
     * 获取用户的所有角色
     * 需要用户已登录
     */
    async fetchRoles() {
      this.loading = true;
      this.error = null;
      try {
        // 获取当前登录用户的ID
        const userStore = useUserStore();
        if (!userStore.token) {
          this.error = '用户未登录，无法获取角色列表';
          return;
        }
        
        const userId = Number(userStore.token);
        // 使用getUserRoles API获取用户的所有角色
        const response = await tuanchat.roleController.getUserRoles(userId);
        
        if (response.success && response.data) {
          this.roles = response.data;
        } else {
          this.error = response.errMsg || '获取角色列表失败';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误';
      } finally {
        this.loading = false;
      }
    },
    /**
     * 根据ID获取角色详情
     * @param id 角色ID
     * @returns 角色详情
     */
    async fetchRoleById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.getRole(id);
        if (response.success && response.data) {
          this.currentRole = response.data;
          return response.data;
        } else {
          this.error = response.errMsg || '获取角色详情失败';
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
     * 创建新角色
     * @returns 新创建的角色信息
     */
    async createRole() {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.createRole();
        if (response.success && response.data) {
          this.roles.push(response.data);
          return response.data;
        } else {
          this.error = response.errMsg || '创建角色失败';
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
     * 更新角色信息
     * @param id 角色ID
     * @param roleData 角色更新数据
     * @returns 更新后的角色信息
     */
    async updateRole(id: number, roleData: UserRole) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.updateRole(roleData);
        if (response.success && response.data) {
          const index = this.roles.findIndex(role => role.roleId === id);
          if (index !== -1) {
            this.roles[index] = response.data;
          }
          if (this.currentRole && this.currentRole.roleId === id) {
            this.currentRole = response.data;
          }
          return response.data;
        } else {
          this.error = response.errMsg || '更新角色失败';
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
     * 删除角色
     * @param id 角色ID
     * @returns 是否删除成功
     */
    async deleteRole(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.deleteRole(id);
        if (response.success) {
          this.roles = this.roles.filter(role => role.roleId !== id);
          if (this.currentRole && this.currentRole.roleId === id) {
            this.currentRole = null;
          }
          return true;
        } else {
          this.error = response.errMsg || '删除角色失败';
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
     * 根据ID获取角色名称
     * @param id 角色ID
     * @returns 角色名称，如果未找到则返回默认名称
     */
    getRoleNameById(id: number) {
      // 从缓存的roles中查找
      const cachedRole = this.roles.find(role => role.roleId === id);
      return cachedRole?.roleName || '未命名角色';
    },
  }
});