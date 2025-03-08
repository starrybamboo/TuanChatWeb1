# TuanChat API 说明文档

## 基础信息

- 基础路径：`/capi`
- 认证方式：Token认证（通过请求头传递）
- 跨域支持：开启跨域认证（credentials）

## 通用响应格式

所有API响应都遵循以下格式：

```json
{
  "success": boolean,    // 请求是否成功
  "errCode": number,    // 错误码，成功时为0
  "errMsg": string,     // 错误信息
  "data": any          // 响应数据，格式随接口变化
}
```

## 错误码说明

- 200: 请求成功
- 400: 请求参数错误
- 405: 方法不允许
- 429: 请求过于频繁
- 500: 服务器内部错误

## API 接口

### 用户模块

#### 获取用户信息
- 接口：GET `/capi/user/info`
- 用途：获取指定用户的详细信息
- 请求参数：
  - userId: number (必填) - 用户ID
- 响应数据：UserInfoResponse对象

#### 好友相关

##### 检查好友关系
- 接口：GET `/capi/user/friend/check`
- 用途：检查与指定用户的好友关系
- 请求参数：FriendCheckReq对象
- 响应数据：FriendCheckResp对象

##### 获取好友列表
- 接口：GET `/capi/user/friend/page`
- 用途：分页获取好友列表
- 请求参数：分页参数
- 响应数据：好友列表数据

### 聊天模块

#### 消息管理

##### 更新消息
- 接口：PUT `/capi/chat/message`
- 用途：更新已发送的消息内容
- 请求体：Message对象
- 响应数据：更新后的Message对象

### 群组模块

#### 创建群组
- 接口：POST `/capi/room/group/`
- 用途：创建新的群聊
- 请求体：GroupAddRequest对象
- 响应数据：新建群组的ID

#### 获取群成员
- 请求参数：
  - pageSize: number - 每页数量
  - cursor: number - 分页游标
  - roomId: number - 群组ID
- 响应数据：ChatMemberResp对象数组

### 角色管理

#### 获取角色权限
- 接口：GET `/capi/role/ability`
- 用途：获取指定角色的权限配置
- 请求参数：
  - roleId: number (必填) - 角色ID
- 响应数据：RoleAbilityTable对象

## 数据模型

### ChatMemberResp
群成员信息响应模型：
```typescript
{
  uid: number;      // 用户ID
  roleId: number;    // 角色ID
}
```

### UserRole
用户角色模型：
```typescript
{
  // 角色相关属性
}
```

## 开发指南

### 客户端集成

1. API实例创建：
```typescript
const api = new TuanChat({
    BASE: 'http://localhost:8081',
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    TOKEN: async () => userStore.token
});
```

2. 错误处理：
- 所有请求都应该处理可能的错误响应
- 检查响应中的success字段
- 错误信息通过errMsg字段返回

### 最佳实践

1. 认证处理：
- 所有需要认证的请求都应携带token
- token通过请求头自动注入

2. 请求频率：
- 注意请求频率限制（429错误）
- 实现适当的重试机制

3. 数据缓存：
- 合理缓存不常变化的数据
- 实现数据更新机制