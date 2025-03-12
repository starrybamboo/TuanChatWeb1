# TuanChat WebSocket消息API说明文档

## 1. 概述

TuanChat应用使用WebSocket协议实现实时双向通信，本文档详细说明WebSocket消息的格式、类型及使用方法，帮助开发者正确构造和解析WebSocket消息。

## 2. 消息基本结构

所有WebSocket消息都遵循以下基本结构：

```json
{
  "type": 消息类型编号,
  "data": 消息数据对象
}
```

字段说明：
- `type`: 整数类型，表示消息的类型，详见[消息类型](#3-消息类型)
- `data`: 对象类型，消息的具体内容，根据不同的消息类型有不同的结构

## 3. 消息类型

TuanChat支持以下WebSocket消息类型：

| 类型编号 | 类型名称 | 描述 |
| --- | --- | --- |
| 4 | MESSAGE | 聊天消息 |
| 5 | ONLINE_OFFLINE_NOTIFY | 上下线通知 |
| 6 | INVALIDATE_TOKEN | 使前端的token失效，意味着前端需要重新登录 |
| 8 | MARK | 消息标记 |
| 9 | RECALL | 消息撤回 |
| 10 | APPLY | 好友申请 |
| 11 | MEMBER_CHANGE | 成员变动 |
| 12 | ROLE_CHANGE | 角色变动 |
| 13 | BACKGROUND_CHANGE | 群背景变动 |

## 4. 消息详细说明

### 4.1 聊天消息 (MESSAGE)

**类型编号**: 4

**消息结构**:
```json
{
  "type": 4,
  "data": {
    // ChatMessageResponse的所有字段
  }
}
```

**说明**: 用于发送和接收聊天消息，data字段继承自ChatMessageResponse类。

**示例代码**:
```java
// 构建聊天消息
ChatMessageResponse messageResponse = new ChatMessageResponse();
messageResponse.setContent("你好！");
// 转换为WebSocket消息
WSBaseResp<ChatMessageResponse> wsMessage = WSAdapter.buildMsgSend(messageResponse);
// 发送给指定用户
webSocketService.sendToUid(wsMessage, userId);
```

### 4.2 上下线通知 (ONLINE_OFFLINE_NOTIFY)

**类型编号**: 5

**消息结构**:
```json
{
  "type": 5,
  "data": {
    "changeList": [
      {
        "uid": 用户ID,
        // 其他用户信息字段
      }
    ],
    "onlineNum": 在线人数
  }
}
```

**字段说明**:
- `changeList`: 数组类型，包含状态发生变化的用户信息
- `onlineNum`: 整数类型，当前在线人数

**示例代码**:
```java
// 构建上线通知
WSBaseResp<WSOnlineOfflineNotify> wsBaseResp = new WSBaseResp<>();
wsBaseResp.setType(WSRespTypeEnum.ONLINE_OFFLINE_NOTIFY.getType());
WSOnlineOfflineNotify onlineOfflineNotify = new WSOnlineOfflineNotify();
onlineOfflineNotify.setChangeList(Collections.singletonList(buildOnlineInfo(user)));
wsBaseResp.setData(onlineOfflineNotify);
// 发送通知
webSocketService.sendToAllOnline(wsBaseResp, userId);
```

### 4.3 Token失效通知 (INVALIDATE_TOKEN)

**类型编号**: 6

**消息结构**:
```json
{
  "type": 6,
  "data": null
}
```

**说明**: 通知客户端当前token已失效，需要重新登录。

**示例代码**:
```java
// 构建token失效通知
WSBaseResp<WSLoginSuccess> wsBaseResp = WSAdapter.buildInvalidateTokenResp();
// 发送给指定用户
webSocketService.sendToUid(wsBaseResp, userId);
```

### 4.4 消息标记 (MARK)

**类型编号**: 8

**消息结构**:
```json
{
  "type": 8,
  "data": {
    "markList": [
      {
        "userId": 操作者ID,
        "syncId": 消息ID,
        "markType": 标记类型,
        "avatarId": 标记对应头像ID,
        "actType": 动作类型
      }
    ]
  }
}
```

**字段说明**:
- `userId`: 整数类型，执行标记操作的用户ID
- `syncId`: 整数类型，被标记的消息ID
- `markType`: 整数类型，标记类型，1表示角色反应
- `avatarId`: 整数类型，标记对应的头像ID
- `actType`: 整数类型，动作类型，1表示确认，2表示取消

**示例代码**:
```java
// 构建消息标记
ChatMessageMarkDTO dto = new ChatMessageMarkDTO();
dto.setUserId(userId);
dto.setSyncId(messageId);
dto.setMarkType(MessageMarkTypeEnum.ROLE_REACTION.getType());
dto.setAvatarId(avatarId);
dto.setActType(MessageMarkActTypeEnum.CONFIRM.getType());
// 转换为WebSocket消息
WSBaseResp<WSMsgMark> wsBaseResp = WSAdapter.buildMsgMarkSend(dto);
// 发送消息
webSocketService.sendToUid(wsBaseResp, userId);
```

### 4.5 消息撤回 (RECALL)

**类型编号**: 9

**消息结构**:
```json
{
  "type": 9,
  "data": {
    // ChatMsgRecallDTO的所有字段
  }
}
```

**说明**: 用于撤回已发送的消息，data字段继承自ChatMsgRecallDTO类。

**示例代码**:
```java
// 构建消息撤回
ChatMsgRecallDTO recallDTO = new ChatMsgRecallDTO();
recallDTO.setMsgId(messageId);
// 转换为WebSocket消息
WSBaseResp<?> wsBaseResp = WSAdapter.buildMsgRecall(recallDTO);
// 发送消息
webSocketService.sendToUid(wsBaseResp, userId);
```

### 4.6 好友申请 (APPLY)

**类型编号**: 10

**消息结构**:
```json
{
  "type": 10,
  "data": {
    "uid": 申请人ID,
    "unreadCount": 申请未读数
  }
}
```

**字段说明**:
- `uid`: 整数类型，发起好友申请的用户ID
- `unreadCount`: 整数类型，未读的好友申请数量

**示例代码**:
```java
// 构建好友申请消息
WSFriendApply resp = new WSFriendApply();
resp.setUid(applicantId);
resp.setUnreadCount(unreadCount);
// 转换为WebSocket消息
WSBaseResp<WSFriendApply> wsBaseResp = WSAdapter.buildApplySend(resp);
// 发送消息
webSocketService.sendToUid(wsBaseResp, targetUserId);
```

### 4.7 成员变动 (MEMBER_CHANGE)

**类型编号**: 11

**消息结构**:
```json
{
  "type": 11,
  "data": {
    "roomId": 群组ID,
    "uid": 变动用户ID,
    "changeType": 变动类型,
    "activeStatus": 在线状态,
    "lastOptTime": 最后一次操作时间
  }
}
```

**字段说明**:
- `roomId`: 整数类型，群组ID
- `uid`: 整数类型，变动的用户ID
- `changeType`: 整数类型，变动类型，1表示加入群组，2表示移除群组，3表示更新
- `activeStatus`: 整数类型，在线状态，1表示在线，2表示离线
- `lastOptTime`: 日期类型，最后一次上下线时间

**示例代码**:
```java
// 构建成员变动消息
WSMemberChange memberChange = new WSMemberChange();
memberChange.setRoomId(roomId);
memberChange.setUid(userId);
memberChange.setChangeType(WSMemberChange.CHANGE_TYPE_ADD);
memberChange.setActiveStatus(ChatActiveStatusEnum.ONLINE.getStatus());
memberChange.setLastOptTime(new Date());
// 转换为WebSocket消息
WSBaseResp<WSMemberChange> wsBaseResp = new WSBaseResp<>();
wsBaseResp.setType(WSRespTypeEnum.MEMBER_CHANGE.getType());
wsBaseResp.setData(memberChange);
// 发送消息
webSocketService.sendToRoom(wsBaseResp, roomId);
```

### 4.8 角色变动 (ROLE_CHANGE)

**类型编号**: 12

**消息结构**:
```json
{
  "type": 12,
  "data": {
    "roleId": 角色ID,
    "RoomId": 群组ID,
    "ChangeType": 变动类型
  }
}
```

**字段说明**:
- `roleId`: 整数类型，角色ID
- `RoomId`: 整数类型，群组ID
- `ChangeType`: 整数类型，变动类型，1表示添加角色，2表示移除角色

**示例代码**:
```java
// 构建角色变动消息
WSRoleChange roleChange = new WSRoleChange();
roleChange.setRoleId(roleId);
roleChange.setRoomId(roomId);
roleChange.setChangeType(WSRoleChange.CHANGE_TYPE_ADD);
// 转换为WebSocket消息
WSBaseResp<WSRoleChange> wsBaseResp = new WSBaseResp<>();
wsBaseResp.setType(WSRespTypeEnum.ROLE_CHANGE.getType());
wsBaseResp.setData(roleChange);
// 发送消息
webSocketService.sendToRoom(wsBaseResp, roomId);
```

### 4.9 群背景变动 (BACKGROUND_CHANGE)

**类型编号**: 13

**消息结构**:
```json
{
  "type": 13,
  "data": {
    // WSBackgroundChange的所有字段
  }
}
```

**说明**: 用于通知群背景变动，data字段为WSBackgroundChange类型。

## 5. 消息发送方法

### 5.1 发送给指定用户

```java
webSocketService.sendToUid(WSBaseResp<?> wsBaseResp, Long uid);
```

### 5.2 发送给所有在线用户

```java
webSocketService.sendToAllOnline(WSBaseResp<?> wsBaseResp, Long skipUid);
```

### 5.3 发送给指定房间/群组

```java
webSocketService.sendToRoom(WSBaseResp<?> wsBaseResp, Long roomId);
```

## 6. 最佳实践

### 6.1 消息构建

推荐使用WSAdapter类提供的工具方法构建各类WebSocket消息：

```java
// 构建聊天消息
WSBaseResp<ChatMessageResponse> chatMsg = WSAdapter.buildMsgSend(messageResponse);

// 构建消息标记
WSBaseResp<WSMsgMark> markMsg = WSAdapter.buildMsgMarkSend(markDTO);

// 构建好友申请消息
WSBaseResp<WSFriendApply> applyMsg = WSAdapter.buildApplySend(applyResp);

// 构建消息撤回
WSBaseResp<?> recallMsg = WSAdapter.buildMsgRecall(recallDTO);

// 构建token失效通知
WSBaseResp<WSLoginSuccess> tokenMsg = WSAdapter.buildInvalidateTokenResp();

// 构建下线通知
WSBaseResp<WSOnlineOfflineNotify> offlineMsg = WSAdapter.buildOfflineNotifyResp(user);

// 构建上线通知
WSBaseResp<WSOnlineOfflineNotify> onlineMsg = wsAdapter.buildOnlineNotifyResp(user);
```

### 6.2 消息处理

客户端接收到WebSocket消息后，应根据消息的type字段判断消息类型，然后解析对应的data字段：

```javascript
// 客户端示例代码（JavaScript）
webSocket.onmessage = function(event) {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 4: // MESSAGE
      handleChatMessage(message.data);
      break;
    case 5: // ONLINE_OFFLINE_NOTIFY
      updateOnlineStatus(message.data);
      break;
    case 6: // INVALIDATE_TOKEN
      handleTokenInvalidation();
      break;
    case 8: // MARK
      handleMessageMark(message.data);
      break;
    case 9: // RECALL
      handleMessageRecall(message.data);
      break;
    case 10: // APPLY
      handleFriendApply(message.data);
      break;
    case 11: // MEMBER_CHANGE
      handleMemberChange(message.data);
      break;
    case 12: // ROLE_CHANGE
      handleRoleChange(message.data);
      break;
    case 13: // BACKGROUND_CHANGE
      handleBackgroundChange(message.data);
      break;
    default:
      console.log('未知消息类型:', message.type);
  }
};

// 处理聊天消息
function handleChatMessage(data) {
  // 处理聊天消息的逻辑
  console.log('收到新消息:', data.content);
}

// 处理上下线通知
function updateOnlineStatus(data) {
  // 更新在线状态的逻辑
  console.log('在线人数:', data.onlineNum);
}

// 处理token失效
function handleTokenInvalidation() {
  // 重新登录的逻辑
  console.log('Token已失效，请重新登录');
  // 跳转到登录页面
  window.location.href = '/login';
}
```

## 7. 注意事项

### 7.1 连接管理

- 客户端应实现自动重连机制，处理网络波动导致的连接断开
- 定期发送心跳消息，保持连接活跃
- 在用户登出时主动关闭WebSocket连接

### 7.2 消息处理

- 对于重要消息，应实现确认机制，确保消息被正确接收和处理
- 处理消息时注意异常捕获，避免因单条消息处理失败影响整个WebSocket连接
- 对于大量并发消息，考虑使用消息队列进行缓冲处理

### 7.3 安全性

- WebSocket连接应进行身份验证，未认证的连接应被拒绝
- 敏感信息应进行加密处理，避免明文传输
- 实现消息过滤机制，防止恶意消息攻击

## 8. 常见问题

### 8.1 连接问题

**Q: WebSocket连接频繁断开如何处理？**

A: 可能原因包括网络不稳定、服务器负载过高或防火墙拦截等。建议：
- 实现指数退避的重连策略
- 检查网络环境，确保WebSocket端口(8090)未被防火墙拦截
- 优化服务端配置，增加连接超时时间

### 8.2 消息问题

**Q: 消息发送成功但客户端未收到如何处理？**

A: 可能原因包括消息路由问题、客户端处理异常等。建议：
- 检查消息发送的目标用户ID是否正确
- 确认用户是否在线，离线消息需要特殊处理
- 实现消息确认机制，跟踪消息的发送状态

### 8.3 性能问题

**Q: 大量并发连接时系统性能下降如何优化？**

A: 建议：
- 调整Netty线程池参数，优化资源利用
- 使用消息队列进行消息缓冲，避免瞬时高并发
- 考虑WebSocket集群部署，提高系统容量