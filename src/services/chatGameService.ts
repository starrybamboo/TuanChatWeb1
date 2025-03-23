import { tuanchat } from '@/api/instance';
import type { ChatMessageResponse } from '@/api/models/ChatMessageResponse';
import type { UserRole } from '@/api/models/UserRole';
import type { RoleAvatar } from '@/api/models/RoleAvatar';
import { Renderer } from '@/renderer/renderer';

/**
 * 聊天游戏服务类
 * 用于获取群聊消息和角色信息，并将其交给renderer处理
 */
export class ChatGameService {
  private roomId: number;
  private renderer: Renderer;
  private roleAvatarMap: Map<number, RoleAvatar[]> = new Map();
  private roleMap: Map<number, UserRole> = new Map();

  /**
   * 构造函数
   * @param roomId 群聊ID
   */
  constructor(roomId: number) {
    this.roomId = roomId;
    this.renderer = new Renderer(roomId);
  }

  /**
   * 初始化渲染器并处理所有数据
   */
  public async initialize(): Promise<void> {
    try {
      // 初始化渲染器
      await this.renderer.initRender();
      
      // 获取并处理所有数据
      await this.fetchAndProcessAllData();
      
      return Promise.resolve();
    } catch (error) {
      console.error('初始化聊天游戏服务失败:', error);
      return Promise.reject(error);
    }
  }

  /**
   * 获取并处理所有数据
   * 包括获取群聊消息、角色信息、角色头像和精灵图
   */
  private async fetchAndProcessAllData(): Promise<void> {
    try {
      // 1. 获取所有消息
      const messagesResponse = await tuanchat.chatController.getAllMessage(this.roomId);
      if (!messagesResponse.success || !messagesResponse.data) {
        throw new Error('获取消息失败');
      }

      // 2. 获取所有角色
      const rolesResponse = await tuanchat.groupRoleController.groupRole(this.roomId);
      if (!rolesResponse.success || !rolesResponse.data) {
        throw new Error('获取角色失败');
      }

      // 3. 为每个角色获取头像和精灵图
      await this.fetchAllRoleAvatars(rolesResponse.data);

      // 4. 上传所有精灵图
      await this.uploadAllSprites();

      // 5. 按顺序渲染所有消息
      await this.renderMessages(messagesResponse.data);

    } catch (error) {
      console.error('获取和处理数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有角色的头像和精灵图
   * @param roles 角色列表
   */
  private async fetchAllRoleAvatars(roles: UserRole[]): Promise<void> {
    const avatarPromises: Promise<void>[] = [];

    for (const role of roles) {
      if (role.roleId) {
        // 将角色信息存入映射表
        this.roleMap.set(role.roleId, role);
        
        // 获取角色的所有头像
        avatarPromises.push(
          (async () => {
            const avatarsResponse = await tuanchat.roleController.getRoleAvatars(role.roleId);
            if (avatarsResponse.success && avatarsResponse.data) {
              this.roleAvatarMap.set(role.roleId, avatarsResponse.data);
            }
          })()
        );
      }
    }

    // 等待所有头像获取完成
    await Promise.all(avatarPromises);
  }

  /**
   * 上传所有精灵图
   */
  private async uploadAllSprites(): Promise<void> {
    const uploadPromises: Promise<void>[] = [];

    this.roleAvatarMap.forEach((avatars, roleId) => {
      avatars.forEach(avatar => {
        if (avatar.spriteUrl) {
          const spritesName = `role_${roleId}_sprites_${avatar.avatarId}`;
          uploadPromises.push(this.renderer.uploadSprites(avatar.spriteUrl, spritesName));
        }
      });
    });

    // 等待所有上传完成
    await Promise.all(uploadPromises);
  }

  /**
   * 渲染所有消息
   * @param messages 消息列表
   */
  private async renderMessages(messages: ChatMessageResponse[]): Promise<void> {
    // 按照消息ID排序以确保正确的顺序
    const sortedMessages = messages.sort((a, b) => 
      (a.message.messageID || 0) - (b.message.messageID || 0)
    );

    // 逐条添加对话
    for (const messageResponse of sortedMessages) {
      const { message } = messageResponse;
      const role = this.roleMap.get(message.roleId);
      
      if (role && role.roleName) {
        this.renderer.addDialog(
          message.roleId,
          role.roleName,
          message.avatarId,
          message.content
        );
      }
    }

    // 完成后同步渲染
    this.renderer.asycRender();
  }
}