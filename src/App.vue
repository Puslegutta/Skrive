<script setup>
import { useAuth } from './composables/useAuth.js'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'
import LoginView from './views/LoginView.vue'

const { isAuthenticated, checkSession } = useAuth()
const route = useRoute()

checkSession()
</script>

<template>
  <LoginView v-if="route.name === 'login'" />
  <AppShell v-else>
    <router-view />
  </AppShell>
</template>
