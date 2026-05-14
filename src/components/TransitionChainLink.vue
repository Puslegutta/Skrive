<script setup>
import { computed } from 'vue'
const props = defineProps({
  outWord: { type: String, default: null },
  inWord: { type: String, default: null },
})
const isLinked = computed(() => {
  if (!props.outWord || !props.inWord) return false
  return props.outWord.toLowerCase() === props.inWord.toLowerCase()
})
</script>
<template>
  <div :class="['chain-link', { linked: isLinked, broken: outWord && inWord && !isLinked, missing: !outWord || !inWord }]">
    <span v-if="outWord" class="chain-out">{{ outWord }}</span>
    <span class="chain-arrow">&rarr;</span>
    <span v-if="inWord" class="chain-in">{{ inWord }}</span>
    <span v-if="!outWord && !inWord" class="chain-empty">ingen kobling</span>
  </div>
</template>
<style scoped>
.chain-link { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) var(--space-md); margin-left: 2rem; font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-text-muted); }
.linked .chain-arrow { color: var(--color-chain-ok); }
.broken .chain-arrow { color: var(--color-chain-break); }
.broken { color: var(--color-chain-break); }
.chain-out { color: var(--color-transition-out); }
.chain-in { color: var(--color-transition-in); }
.chain-empty { font-style: italic; }
</style>
