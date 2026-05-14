<script setup>
import StatusBadge from './StatusBadge.vue'
const props = defineProps({ round: { type: Object, required: true } })

function getPreview(round) {
  if (round.cardPitch) return round.cardPitch
  if (round.firstQuestion) {
    const spans = round.firstQuestion?.[0]?.children || []
    return spans.map(s => s.text).join('')
  }
  return 'Ingen spørsmål ennå'
}
</script>
<template>
  <router-link :to="`/round/${round._id}`" class="round-card">
    <div class="round-header">
      <span class="round-number">{{ round.roundNumber ? `Runde ${round.roundNumber}` : 'Utkast' }}</span>
      <StatusBadge :status="round.status || 'draft'" />
    </div>
    <p class="round-preview">{{ getPreview(round) }}</p>
    <div class="round-meta">
      <span class="question-count">{{ round.questionCount || 0 }}/10 spørsmål</span>
    </div>
  </router-link>
</template>
<style scoped>
.round-card { display: block; padding: var(--space-lg); background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); text-decoration: none; color: inherit; transition: border-color 0.15s; }
.round-card:hover { border-color: var(--color-border); }
.round-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.round-number { font-family: var(--font-ui); font-weight: 700; font-size: 0.9rem; }
.round-preview { color: var(--color-text-secondary); font-size: 0.95rem; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.round-meta { margin-top: var(--space-sm); }
.question-count { font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-text-muted); }
</style>
