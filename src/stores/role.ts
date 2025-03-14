import { defineStore } from 'pinia';
import type { UserRole } from '@/api/models/UserRole';
import { tuanchat } from '@/api/instance';
import { useUserStore } from '@/stores/user';

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [] as UserRole[],
    currentRole: null as UserRole | null,
    loading: false,
    error: null as string | null
  }),
  actions: {
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
    async deleteRole(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tuanchat.roleController.deleteRole1(id);
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
    async getRoleNameById(id: number) {
      // 先从缓存的roles中查找
      const cachedRole = this.roles.find(role => role.roleId === id);
      if (cachedRole) {
        return cachedRole.roleName || '未命名角色';
      }
      
      // 如果缓存中没有，则调用API获取
      try {
        const role = await this.fetchRoleById(id);
        return role?.roleName || '未命名角色';
      } catch (error) {
        console.error('获取角色名称失败:', error);
        return '未知角色';
      }
    },
  }
});