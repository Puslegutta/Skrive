<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

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
const menuOpen = ref(false)

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

function navigateTo(to) {
  router.push(to)
  menuOpen.value = false
}

const headerEl = ref(null)

onMounted(() => {
  if (headerEl.value) {
    const h = headerEl.value.offsetHeight
    document.documentElement.style.setProperty('--app-header-height', `${h}px`)
  }
})
</script>

<template>
  <div class="app-shell">
    <header ref="headerEl" class="app-header">
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

      <nav class="app-nav desktop-only">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" :class="['nav-item', { active: route.path === item.to }]">{{ item.label }}</router-link>
      </nav>
      <div class="app-actions desktop-only">
        <button class="dark-toggle" @click="toggleDarkMode">{{ darkMode ? 'Light' : 'Dark' }}</button>
        <button class="logout-btn" @click="handleLogout">Logg ut</button>
      </div>

      <button class="hamburger mobile-only" @click="menuOpen = !menuOpen">
        <span :class="['hamburger-icon', { open: menuOpen }]">
          <span /><span /><span />
        </span>
      </button>

      <Transition name="dropdown">
        <div v-if="menuOpen" class="mobile-menu mobile-only">
          <div class="menu-section-label">Apper</div>
          <button v-for="tab in tabs" :key="tab.label" :class="['mobile-nav-item', { active: tab.active, disabled: !tab.active }]" @click="tab.to && navigateTo(tab.to)">{{ tab.label }}</button>
          <div class="mobile-divider" />
          <div class="menu-section-label">Innhold</div>
          <button v-for="item in navItems" :key="item.to" :class="['mobile-nav-item', { active: route.path === item.to }]" @click="navigateTo(item.to)">{{ item.label }}</button>
          <div class="mobile-divider" />
          <div class="menu-section-label">Innstillinger</div>
          <button class="mobile-nav-item" @click="toggleDarkMode(); menuOpen = false">{{ darkMode ? 'Light mode' : 'Dark mode' }}</button>
          <button class="mobile-nav-item" @click="handleLogout">Logg ut</button>
        </div>
      </Transition>
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
  position: sticky; top: 0; z-index: 50;
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

/* Hamburger */
.hamburger {
  margin-left: auto;
  padding: var(--space-xs) var(--space-sm);
}
.hamburger-icon {
  display: flex; flex-direction: column; gap: 4px; width: 20px;
}
.hamburger-icon span {
  display: block; height: 2px; background: var(--color-text); border-radius: 1px;
  transition: transform 0.2s, opacity 0.2s;
}
.hamburger-icon.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger-icon.open span:nth-child(2) { opacity: 0; }
.hamburger-icon.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 40;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex; flex-direction: column;
  padding: var(--space-sm) 0;
}
.mobile-nav-item {
  font-family: var(--font-ui); font-size: 0.95rem;
  padding: var(--space-sm) var(--space-lg);
  text-align: left; color: var(--color-text-secondary);
}
.mobile-nav-item.active { color: var(--color-text); font-weight: 600; }
.mobile-nav-item:hover { background: var(--color-bg); }
.mobile-divider { height: 1px; background: var(--color-border-subtle); margin: var(--space-xs) var(--space-lg); }
.menu-section-label {
  font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-text-muted); padding: var(--space-sm) var(--space-lg) 2px;
}
.mobile-nav-item.disabled { opacity: 0.4; }

/* Dropdown transition */
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

/* Responsive visibility */
.mobile-only { display: none; }
@media (max-width: 640px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .app-header { padding: var(--space-sm); gap: var(--space-sm); }
  .app-main { padding: var(--space-md); }
}
</style>
