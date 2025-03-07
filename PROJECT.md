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

### Pinia 状态管理

项目使用 Pinia 进行状态管理：

- 已创建 Pinia 实例并配置到 Vue 应用
- 状态管理相关代码位于 `src/stores` 目录

## API 接口

### OpenAPI 生成

项目使用 OpenAPI 自动生成 API 客户端代码：

- API 定义文件：`public/tuanchat.openapi.json`
- 生成命令：`yarn openapi`
- 生成目录：`src/api`
- 基础配置：API 基础路径设置为 `/capi`

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
│   │   └── vue.svg         # Vue logo图标
│   ├── components/          # Vue组件目录
│   │   └── HelloWorld.vue  # 示例组件
│   ├── stores/              # Pinia状态管理
│   │   └── index.ts        # 状态管理入口文件
│   ├── App.vue              # 应用根组件
│   ├── main.ts              # 应用入口文件，负责应用初始化
│   ├── style.css           # 全局样式文件
│   └── vite-env.d.ts       # Vite环境类型声明文件
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

### 关键文件说明

#### 配置文件
- `vite.config.ts`: Vite构建工具配置文件
  - 配置Vue插件支持
  - 配置路径别名，将`@`指向`src`目录
  - 其他构建和开发服务器相关配置

- `tsconfig.json`: TypeScript主配置文件
  - 通过引用分离应用和Node.js的配置
  - 引用`tsconfig.app.json`和`tsconfig.node.json`

- `tsconfig.app.json`: 应用相关的TypeScript配置
  - 继承自`@vue/tsconfig/tsconfig.dom.json`
  - 配置严格的类型检查选项
  - 配置路径别名`@/*`指向`src/*`
  - 包含所有源代码文件（.ts、.tsx、.vue）

- `tsconfig.node.json`: Node.js相关的TypeScript配置
  - 配置构建工具相关的TypeScript选项
  - 设置目标版本为ES2022
  - 启用严格模式和其他代码质量检查
  - 仅包含`vite.config.ts`

- `package.json`: 项目配置和依赖管理
  - 开发脚本：`dev`（启动开发服务器）
  - 构建脚本：`build`（生产环境构建）
  - 预览脚本：`preview`（预览生产构建）
  - API生成脚本：`openapi`（生成API客户端代码）
  - 核心依赖：Vue 3、Element Plus、Pinia
  - 开发依赖：TypeScript、Vite、Vue-tsc等

#### 源代码目录（src/）

##### 核心文件
- `main.ts`: 应用程序入口文件
  - 创建Vue应用实例
  - 配置Element Plus及其图标组件
  - 配置Pinia状态管理
  - 配置API客户端基础路径（/capi）

- `App.vue`: 应用根组件
  - 页面整体布局和结构
  - 集成示例组件和Logo展示
  - 基础样式设置

- `style.css`: 全局样式文件
  - 定义全局CSS变量和样式
  - 设置基础样式规则

##### API模块（api/）
- `index.ts`: API模块入口文件
  - 导出所有API相关类型和接口
  - 导出核心功能（ApiError、CancelablePromise等）
  - 导出OpenAPI配置和类型定义
- `core/`: API核心功能实现
  - API错误处理
  - 请求取消功能
  - OpenAPI基础配置
- `models/`: API数据模型定义
  - 请求和响应数据类型
  - 业务实体模型定义
- `services/`: API服务接口定义
  - 各个业务模块的API封装
  - RESTful接口实现

##### 状态管理（stores/）
- `index.ts`: Pinia状态管理入口文件
  - 创建Pinia实例
  - 配置Pinia插件
  - 提供状态管理初始化函数

##### 组件（components/）
- `HelloWorld.vue`: 示例组件
  - 展示基本的组件结构
  - 演示Vue 3组件特性
  - 包含计数器交互示例

##### 资源文件（assets/）
- `vue.svg`: Vue.js Logo图标
  - 用于页面展示
  - 支持hover效果

#### 静态资源（public/）
- `tuanchat.openapi.json`: OpenAPI接口定义文件
  - 定义API接口规范
  - 用于生成TypeScript API客户端代码
- `favicon.ico`: 网站图标
- `vite.svg`: Vite Logo图标

## 开发命令

- `yarn dev`: 启动开发服务器（自动打开浏览器）
- `yarn build`: 构建生产版本
- `yarn preview`: 本地预览生产构建
- `yarn openapi`: 生成 API 客户端代码