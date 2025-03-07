import { createPinia } from 'pinia'
import type { App } from 'vue'

// 创建pinia实例
const pinia = createPinia()

// 配置插件
export function setupStore(app: App) {
  app.use(pinia)
}

export { pinia }