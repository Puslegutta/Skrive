<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const { login } = useAuth()
const router = useRouter()
const passcode = ref('')
const error = ref(false)

function handleLogin() {
  if (login(passcode.value)) {
    router.push('/')
  } else {
    error.value = true
    passcode.value = ''
  }
}
</script>

<template>
  <div class="login">
    <div class="login-card">
      <h1>Puslegutta</h1>
      <p>Skriveapp</p>
      <form @submit.prevent="handleLogin">
        <input v-model="passcode" type="password" placeholder="Passord" autofocus />
        <button type="submit">Logg inn</button>
        <p v-if="error" class="error">Feil passord</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--color-bg); }
.login-card { text-align: center; padding: var(--space-2xl); }
.login-card h1 { font-family: var(--font-body); font-size: 2rem; margin-bottom: var(--space-xs); }
.login-card p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
.login-card form { display: flex; flex-direction: column; gap: var(--space-md); max-width: 16rem; margin: 0 auto; }
.login-card input { text-align: center; padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--color-border); font-size: 1rem; }
.login-card button[type="submit"] { padding: var(--space-sm) var(--space-md); background: var(--color-primary); color: var(--color-bg); border-radius: var(--radius-md); font-weight: 600; }
.error { color: var(--color-chain-break); font-size: 0.85rem; }
</style>
