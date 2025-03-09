import { defineStore } from 'pinia';
import type { UserRole } from '@/api/models/UserRole';
import { tuanchat } from '@/api/instance';

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
        // 假设这里调用获取角色列表的API
        // 由于API中没有直接获取所有角色的方法，这里模拟一个获取角色列表的请求
        // 实际项目中需要根据真实API进行调整
        const response = await tuanchat.roleController.createRole();
        if (response.success && response.data) {
          // 这里只是添加一个角色，实际项目中应该有获取所有角色的API
          this.roles = [response.data];
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
    }
  }
});