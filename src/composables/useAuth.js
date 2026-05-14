import { ref, readonly } from 'vue'

const PASSCODE = import.meta.env.VITE_APP_PASSCODE

const isAuthenticated = ref(false)

export function useAuth() {
  function login(passcode) {
    if (passcode === PASSCODE) {
      isAuthenticated.value = true
      sessionStorage.setItem('auth', 'true')
      return true
    }
    return false
  }

  function logout() {
    isAuthenticated.value = false
    sessionStorage.removeItem('auth')
  }

  function checkSession() {
    if (sessionStorage.getItem('auth') === 'true') {
      isAuthenticated.value = true
    }
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    login,
    logout,
    checkSession,
  }
}
