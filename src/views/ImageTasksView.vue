<script setup>
import { computed, onMounted } from 'vue'
import { useRounds } from '../composables/useRounds.js'

const { rounds, fetchRounds, loading } = useRounds()

const imageTasks = computed(() => {
  const tasks = []
  for (const round of rounds.value) {
    for (let i = 0; i < (round.questions || []).length; i++) {
      const q = round.questions[i]
      if (q.imageNote && !q.extraImage) {
        tasks.push({
          roundId: round._id,
          roundNumber: round.roundNumber,
          questionIndex: i + 1,
          imageNote: q.imageNote,
        })
      }
    }
  }
  return tasks
})

function sanityStudioUrl(roundId) {
  return `https://puslegutta.sanity.studio/intent/edit/id=${roundId};type=iddiotRound`
}

onMounted(() => fetchRounds())
</script>

<template>
  <div class="image-tasks">
    <h1>Bildeoppgaver</h1>
    <p class="subtitle">Spørsmål med bildenotat som mangler bilde i Sanity.</p>
    <p v-if="loading">Laster...</p>
    <p v-else-if="imageTasks.length === 0" class="empty">Ingen bildeoppgaver!</p>
    <div v-else class="tasks-list">
      <div v-for="task in imageTasks" :key="`${task.roundId}-${task.questionIndex}`" class="task-card">
        <div class="task-header">
          <span class="task-location">{{ task.roundNumber ? `Runde ${task.roundNumber}` : 'Utkast' }}, spm {{ task.questionIndex }}</span>
          <a :href="sanityStudioUrl(task.roundId)" target="_blank" class="studio-link">Åpne i Sanity →</a>
        </div>
        <p class="task-note">{{ task.imageNote }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-tasks h1 { font-size: 1.5rem; margin-bottom: var(--space-xs); }
.subtitle { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
.empty { color: var(--color-chain-ok); font-style: italic; }
.tasks-list { display: flex; flex-direction: column; gap: var(--space-md); }
.task-card { padding: var(--space-md) var(--space-lg); background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); }
.task-location { font-family: var(--font-ui); font-weight: 600; font-size: 0.85rem; }
.studio-link { font-family: var(--font-ui); font-size: 0.8rem; }
.task-note { color: var(--color-text-secondary); font-style: italic; }
</style>
