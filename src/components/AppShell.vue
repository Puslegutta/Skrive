<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const { logout } = useAuth()
const router = useRouter()
const route = useRoute()

const tabs = [
  { label: 'Iddiotquiz', to: '/', active: true },
  { label: 'Wrd', to: null, active: false },
]

const navItems = [
  { label: 'Runder', to: '/' },
  { label: 'Bildeoppgaver', to: '/image-tasks' },
]

const darkMode = ref(localStorage.getItem('dark-mode') === 'true')

function applyDarkMode(v) {
  document.documentElement.classList.toggle('dark-mode', v)
  document.body.classList.toggle('dark-mode', v)
  localStorage.setItem('dark-mode', v)
}

applyDarkMode(darkMode.value)

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  applyDarkMode(darkMode.value)
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="product-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.label"
          :class="['tab', { active: tab.active, disabled: !tab.active }]"
          @click="tab.to && router.push(tab.to)"
        >
          {{ tab.label }}
        </button>
      </div>
      <nav class="app-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: route.path === item.to }]"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <div class="app-actions">
        <button class="dark-toggle" @click="toggleDarkMode">
          {{ darkMode ? 'Light' : 'Dark' }}
        </button>
        <button class="logout-btn" @click="handleLogout">Logg ut</button>
      </div>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.app-header {
  display: flex; align-items: center; gap: var(--space-lg);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-wrap: wrap;
}
.product-tabs { display: flex; gap: var(--space-xs); }
.tab {
  padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm);
  font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600;
}
.tab.active { background: var(--color-primary); color: var(--color-bg); }
.tab.disabled { opacity: 0.4; cursor: default; }
.app-nav { display: flex; gap: var(--space-md); margin-left: auto; }
.nav-item { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-secondary); padding: var(--space-xs) var(--space-sm); }
.nav-item.active { color: var(--color-text); font-weight: 600; }
.app-actions { display: flex; align-items: center; gap: var(--space-sm); }
.dark-toggle { font-family: var(--font-ui); font-size: 0.85rem; padding: var(--space-xs); color: var(--color-text-muted); }
.logout-btn { font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-text-muted); }
.app-main { flex: 1; padding: var(--space-xl); max-width: 48rem; margin: 0 auto; width: 100%; }
@media (max-width: 640px) {
  .app-header { padding: var(--space-sm); gap: var(--space-sm); }
  .app-main { padding: var(--space-md); }
}
</style>
