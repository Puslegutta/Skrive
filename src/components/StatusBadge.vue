<script setup>
const props = defineProps({ status: { type: String, required: true } })
const labels = { draft: 'Utkast', inProgress: 'Under arbeid', review: 'Til sjekk', done: 'Ferdig' }
</script>
<template>
  <span :class="['status-badge', status]">{{ labels[status] || status }}</span>
</template>
<style scoped>
.status-badge { font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: var(--radius-sm); }
.draft { background: var(--color-status-draft); color: var(--color-bg); }
.inProgress { background: var(--color-status-in-progress); color: var(--color-bg); }
.review { background: var(--color-status-review); color: var(--color-bg); }
.done { background: var(--color-status-done); color: var(--color-bg); }
</style>
