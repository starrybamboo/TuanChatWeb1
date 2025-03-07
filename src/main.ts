import { createApp } from 'vue'
import './style.css'
import App from '@/App.vue'
import { setupStore } from '@/stores'
import router from '@/router'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入API客户端
import { OpenAPI } from '@/api'

const app = createApp(App)

// 配置Pinia
setupStore(app)

// 配置路由
app.use(router)

// 配置Element Plus
app.use(ElementPlus)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置API客户端
OpenAPI.BASE = '/capi'

app.mount('#app')
