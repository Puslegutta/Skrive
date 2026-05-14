<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRounds } from '../composables/useRounds.js'
import RoundCard from '../components/RoundCard.vue'

const router = useRouter()
const { rounds, loading, error, fetchRounds, createRound } = useRounds()
const filter = ref('all')

const filteredRounds = computed(() => {
  if (filter.value === 'done') return rounds.value.filter(r => r.status === 'done')
  if (filter.value === 'draft') return rounds.value.filter(r => r.status !== 'done')
  return rounds.value
})

async function handleNewRound() {
  const id = await createRound()
  router.push(`/round/${id}`)
}

onMounted(() => fetchRounds())
</script>
<template>
  <div class="round-list">
    <div class="list-header">
      <h1>Runder</h1>
      <button class="new-round-btn" @click="handleNewRound">+ Ny runde</button>
    </div>
    <div class="filters">
      <button v-for="f in [{key:'all',label:'Alle'},{key:'draft',label:'Uferdige'},{key:'done',label:'Ferdige'}]" :key="f.key" :class="['filter-btn',{active:filter===f.key}]" @click="filter=f.key">{{ f.label }}</button>
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
.filters { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.filter-btn { font-family: var(--font-ui); font-size: 0.85rem; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); color: var(--color-text-secondary); }
.filter-btn.active { background: var(--color-bg-elevated); color: var(--color-text); font-weight: 600; }
.rounds-grid { display: flex; flex-direction: column; gap: var(--space-md); }
.status-text { color: var(--color-text-muted); font-size: 0.95rem; }
.error { color: var(--color-chain-break); }
</style>
