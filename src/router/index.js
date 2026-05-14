import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/', name: 'rounds', component: () => import('../views/RoundListView.vue') },
  { path: '/round/:id', name: 'round-editor', component: () => import('../views/RoundEditorView.vue') },
  { path: '/image-tasks', name: 'image-tasks', component: () => import('../views/ImageTasksView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authed = sessionStorage.getItem('auth') === 'true'
  if (!authed && to.name !== 'login') return { name: 'login' }
  if (authed && to.name === 'login') return { name: 'rounds' }
})

export default router
