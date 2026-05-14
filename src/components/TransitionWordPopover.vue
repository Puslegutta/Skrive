<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  editor: { type: Object, default: null },
})

const emit = defineEmits(['mark'])

const visible = ref(false)
const position = ref({ top: 0, left: 0 })
const popoverEl = ref(null)

function updatePosition() {
  if (!props.editor) return
  const { from, to } = props.editor.state.selection
  if (from === to) { visible.value = false; return }
  visible.value = true
  const coords = props.editor.view.coordsAtPos(from)
  const editorRect = props.editor.view.dom.getBoundingClientRect()
  position.value = {
    top: coords.top - editorRect.top - 40,
    left: coords.left - editorRect.left,
  }
}

watch(() => props.editor?.state?.selection, () => updatePosition(), { deep: true })

function dismissOnOutsideTouch(e) {
  if (!visible.value) return
  if (popoverEl.value?.contains(e.target)) return
  visible.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', dismissOnOutsideTouch, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', dismissOnOutsideTouch, true)
})

function handleMark(type) {
  emit('mark', type)
  visible.value = false
}
</script>

<template>
  <div v-if="visible" ref="popoverEl" class="tw-popover" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <button @mousedown.prevent="handleMark('transitionIn')" class="tw-btn tw-in">Inn</button>
    <button @mousedown.prevent="handleMark('transitionOut')" class="tw-btn tw-out">Ut</button>
  </div>
</template>

<style scoped>
.tw-popover {
  position: absolute; display: flex; gap: 2px;
  background: var(--color-bg-elevated); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 10; padding: 2px;
}
.tw-btn { font-family: var(--font-ui); font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 3px; }
.tw-in:hover { background: var(--color-transition-in-bg); color: var(--color-transition-in); }
.tw-out:hover { background: var(--color-transition-out-bg); color: var(--color-transition-out); }
</style>
