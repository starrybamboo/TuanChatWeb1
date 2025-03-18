import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/feed',
    name: 'feed',
    component: () => import('@/views/feed/index.vue')
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/community/index.vue')
  },
  {
    path: '/chat/:groupId?',
    name: 'chat',
    component: () => import('@/views/chat/index.vue')
  },
  {
    path: '/role',
    name: 'role',
    component: () => import('@/views/role/index.vue')
  },
  {
    path: '/role/:roleId',
    name: 'roleDetail',
    component: () => import('@/views/role/index.vue')
  },
  {
    path: '/module',
    name: 'module',
    component: () => import('@/views/module/index.vue')
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/create/index.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router