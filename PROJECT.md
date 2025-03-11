# TuanChat Web 项目说明

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia

## 项目配置

### TypeScript 配置

项目使用严格的 TypeScript 配置：

- `strict: true`：启用所有严格类型检查选项
- `noUnusedLocals: true`：检查未使用的局部变量
- `noUnusedParameters: true`：检查未使用的参数
- `noFallthroughCasesInSwitch: true`：检查 switch 语句的 fallthrough 情况
- `noUncheckedSideEffectImports: true`：检查未检查的副作用导入

### 路径别名

项目配置了 `@` 路径别名，指向 `src` 目录：

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, './src')
  }
}
```

## 第三方库集成

### Element Plus

项目集成了 Element Plus UI 组件库：

- 已全局注册所有 Element Plus 图标组件
- 已引入 Element Plus 样式
- 实现了登录对话框等基础UI组件

### Pinia 状态管理

项目使用 Pinia 进行状态管理：

- 已创建 Pinia 实例并配置到 Vue 应用
- 状态管理相关代码位于 `src/stores` 目录
- 实现了多个状态管理模块：
  - 用户状态（user.ts）：Token管理和用户信息
  - 角色状态（role.ts）：角色列表和当前角色
  - 头像状态（avatar.ts）：头像管理和URL映射

## 用户认证系统

### 登录功能

实现了完整的用户登录流程：

- 登录对话框组件（LoginDialog.vue）
  - 用户名/密码输入
  - 表单验证
  - 登录状态提示
- 登录状态管理
  - Token 的获取和存储
  - 登录状态的持久化
  - 登出功能

### API 认证

实现了基于 Token 的 API 认证机制：

- 统一的 API 实例配置
  - 基础URL配置
  - 跨域认证支持
  - Token 注入
- 请求拦截器
  - 自动添加认证头
  - Token 失效处理

## 页面布局与路由

### 顶部导航栏

项目使用 `AppLayout.vue` 作为全局布局组件，实现了统一的顶部导航栏：

- Logo 展示：左侧显示网站 Logo
- 导航菜单：包含主要功能模块的导航链接
  - 推荐（/feed）
  - 社区（/community）
  - 游玩（/play）
  - 角色（/role）
  - 模组（/module）
  - 创作（/create）
- 用户功能：右侧显示登录按钮

导航栏样式特点：
- 固定在页面顶部
- 背景色为白色，底部有分割线
- 导航链接hover时显示特殊效果
- 响应式布局，适配不同屏幕尺寸

### 页面路由

项目采用 Vue Router 进行路由管理，主要功能模块包括：

- 推荐页（/feed）：展示推荐内容
- 社区页（/community）：社区交流功能
- 游玩页（/play）：游戏相关功能
- 角色页（/role）：角色管理和展示
- 模组页（/module）：模组相关功能
- 创作页（/create）：创作者功能

## 角色系统

### 角色管理

实现了完整的角色管理功能：

- 角色列表展示
- 角色创建和编辑
- 当前角色切换
- 角色状态同步

### 头像系统

集成了角色头像管理功能：

- 头像存储和缓存
- 头像URL映射管理
- 精灵图（Sprite）支持
- 头像标题管理

## API 接口

### OpenAPI 生成

项目使用 OpenAPI 自动生成 API 客户端代码：

- API 定义文件：`public/tuanchat.openapi.json`
- 生成命令：`yarn openapi`
- 生成目录：`src/api`
- 基础配置：
  - API 基础路径：`/capi`
  - 开启跨域认证（credentials）
  - 自动注入认证Token

## 项目结构

```
├── public/                    # 静态资源目录
│   ├── favicon.ico           # 网站图标
│   ├── tuanchat.openapi.json # OpenAPI接口定义文件
│   └── vite.svg             # Vite logo图标
├── src/                      # 源代码目录
│   ├── api/                  # API 相关代码（自动生成）
│   │   ├── core/            # API核心功能代码
│   │   ├── models/          # API数据模型定义
│   │   ├── services/        # API服务接口定义
│   │   └── index.ts         # API模块入口文件
│   ├── assets/              # 项目资源文件
│   ├── components/          # Vue组件目录
│   │   └── LoginDialog.vue  # 登录对话框组件
│   ├── layouts/             # 布局组件目录
│   │   └── AppLayout.vue    # 全局布局组件
│   ├── stores/              # Pinia状态管理
│   │   ├── avatar.ts        # 头像状态管理
│   │   ├── role.ts          # 角色状态管理
│   │   ├── user.ts          # 用户状态管理
│   │   └── index.ts         # 状态管理入口文件
│   ├── views/               # 页面视图组件
│   │   ├── community/       # 社区页面
│   │   ├── create/          # 创作页面
│   │   ├── feed/            # 推荐页面
│   │   ├── module/          # 模组页面
│   │   ├── play/            # 游玩页面
│   │   └── role/            # 角色页面
│   ├── App.vue              # 应用根组件
│   ├── main.ts              # 应用入口文件
│   ├── style.css            # 全局样式文件
│   └── vite-env.d.ts        # Vite环境类型声明文件
├── .vscode/                  # VSCode配置目录
│   └── extensions.json      # 推荐的VSCode扩展配置
├── index.html               # 应用入口HTML文件
├── package.json             # 项目依赖和脚本配置
├── tsconfig.json            # TypeScript主配置文件
├── tsconfig.app.json        # 应用相关的TypeScript配置
├── tsconfig.node.json       # Node.js相关的TypeScript配置
├── vite.config.ts           # Vite构建工具配置文件
└── yarn.lock                # Yarn依赖版本锁定文件
```

## 开发命令

- `yarn dev`: 启动开发服务器（自动打开浏览器）
- `yarn build`: 构建生产版本
- `yarn preview`: 本地预览生产构建
- `yarn openapi`: 生成 API 客户端代码