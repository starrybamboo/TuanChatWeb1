import { createPinia } from 'pinia'
import type { App } from 'vue'

/**
 * Pinia Store配置
 * 负责创建和配置Pinia实例，并提供全局状态管理功能
 */
const pinia = createPinia()

/**
 * 配置Pinia插件
 * @param app Vue应用实例
 */
export function setupStore(app: App) {
  app.use(pinia)
}

export { pinia }