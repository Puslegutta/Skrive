<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRounds } from '../composables/useRounds.js'
import RoundCard from '../components/RoundCard.vue'

const router = useRouter()
const { rounds, loading, error, fetchRounds, createRound } = useRounds()
const filter = ref('all')
const lastEditedId = ref(null)
const dismissed = ref(false)

const lastEditedRound = computed(() => {
  if (!lastEditedId.value || dismissed.value) return null
  return rounds.value.find(r => r._id === lastEditedId.value) || null
})

const filteredRounds = computed(() => {
  if (filter.value === 'all') return rounds.value
  return rounds.value.filter(r => (r.status || 'draft') === filter.value)
})

function dismissLastEdited() {
  dismissed.value = true
  localStorage.removeItem('skrive-last-edited')
}

async function handleNewRound() {
  const id = await createRound()
  router.push(`/round/${id}`)
}

// Save scroll position continuously (debounced)
let scrollTimer
function handleScroll() {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    sessionStorage.setItem('roundlist-scroll', String(window.scrollY))
  }, 150)
}

onMounted(async () => {
  lastEditedId.value = localStorage.getItem('skrive-last-edited')
  await fetchRounds()

  // Restore scroll after DOM has rendered the cards
  const saved = sessionStorage.getItem('roundlist-scroll')
  if (saved) {
    const target = parseInt(saved, 10)
    await nextTick()
    requestAnimationFrame(() => {
      window.scrollTo(0, target)
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  // Final save on unmount
  sessionStorage.setItem('roundlist-scroll', String(window.scrollY))
})
</script>
<template>
  <div class="round-list">
    <div class="list-header">
      <h1>Runder</h1>
      <button class="new-round-btn" @click="handleNewRound">+ Ny runde</button>
    </div>

    <div v-if="lastEditedRound" class="continue-banner">
      <router-link :to="`/round/${lastEditedRound._id}`" class="continue-link">
        <span class="continue-label">Fortsett</span>
        <span class="continue-title">{{ lastEditedRound.roundNumber ? `Runde ${lastEditedRound.roundNumber}` : 'Utkast' }}</span>
        <span v-if="lastEditedRound.cardPitch" class="continue-pitch">{{ lastEditedRound.cardPitch }}</span>
      </router-link>
      <button class="continue-dismiss" @click="dismissLastEdited">&times;</button>
    </div>

    <div class="filters">
      <button v-for="f in [{key:'all',label:'Alle'},{key:'draft',label:'Utkast'},{key:'inProgress',label:'Under arbeid'},{key:'review',label:'Til sjekk'},{key:'done',label:'Ferdige'}]" :key="f.key" :class="['filter-btn',{active:filter===f.key}]" @click="filter=f.key">{{ f.label }}</button>
    </div>
    <p v-if="loading" class="status-text">Laster runder...</p>
    <p v-else-if="error" class="status-text error">{{ error }}</p>
    <div v-else class="rounds-grid">
      <RoundCard v-for="round in filteredRounds" :key="round._id" :round="round" />
    </div>
  </div>
</template>
<style scoped>
.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); }
.list-header h1 { font-size: 1.5rem; }
.new-round-btn { font-family: var(--font-ui); font-weight: 600; padding: var(--space-sm) var(--space-lg); background: var(--color-primary); color: var(--color-bg); border-radius: var(--radius-md); }

.continue-banner { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-lg); padding: var(--space-md) var(--space-lg); background: var(--color-bg-surface); border: 2px solid var(--color-transition-in); border-radius: var(--radius-md); }
.continue-link { flex: 1; display: flex; align-items: center; gap: var(--space-md); text-decoration: none; color: inherit; min-width: 0; }
.continue-label { font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-transition-in); white-space: nowrap; }
.continue-title { font-family: var(--font-ui); font-weight: 700; font-size: 0.95rem; white-space: nowrap; }
.continue-pitch { color: var(--color-text-secondary); font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.continue-dismiss { font-size: 1.2rem; color: var(--color-text-muted); padding: var(--space-xs) var(--space-sm); opacity: 0.5; }
.continue-dismiss:hover { opacity: 1; }

.filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.filter-btn { font-family: var(--font-ui); font-size: 0.85rem; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); color: var(--color-text-secondary); }
.filter-btn.active { background: var(--color-bg-elevated); color: var(--color-text); font-weight: 600; }
.rounds-grid { display: flex; flex-direction: column; gap: var(--space-md); }
.status-text { color: var(--color-text-muted); font-size: 0.95rem; }
.error { color: var(--color-chain-break); }
</style>
