<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIdeas } from '../composables/useIdeas.js'

const emit = defineEmits(['close'])
const { ideas, loading, fetchIdeas, addIdea, toggleUsed, deleteIdea } = useIdeas()

const newIdeaText = ref('')
const filter = ref('active') // 'active' | 'used' | 'all'

const filteredIdeas = computed(() => {
  if (filter.value === 'active') return ideas.value.filter(i => !i.used)
  if (filter.value === 'used') return ideas.value.filter(i => i.used)
  return ideas.value
})

async function handleAdd() {
  const text = newIdeaText.value.trim()
  if (!text) return
  await addIdea(text)
  newIdeaText.value = ''
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAdd()
  }
}

onMounted(fetchIdeas)
</script>

<template>
  <div class="idea-panel">
    <div class="panel-header">
      <h2 class="panel-title">Idebank</h2>
      <button class="panel-close" @click="emit('close')">&times;</button>
    </div>

    <div class="panel-add">
      <textarea
        v-model="newIdeaText"
        @keydown="handleKeydown"
        placeholder="Ny ide..."
        rows="2"
        class="add-input"
      />
      <button class="add-btn" :disabled="!newIdeaText.trim()" @click="handleAdd">Legg til</button>
    </div>

    <div class="panel-filters">
      <button v-for="f in [['active', 'Aktive'], ['used', 'Brukte'], ['all', 'Alle']]" :key="f[0]" :class="['filter-btn', { active: filter === f[0] }]" @click="filter = f[0]">{{ f[1] }}</button>
    </div>

    <div v-if="loading" class="panel-loading">Laster...</div>
    <div v-else-if="filteredIdeas.length === 0" class="panel-empty">Ingen ideer ennå</div>
    <div v-else class="panel-list">
      <div v-for="idea in filteredIdeas" :key="idea._id" :class="['idea-item', { used: idea.used }]">
        <button class="idea-check" @click="toggleUsed(idea._id)">
          {{ idea.used ? '&#9745;' : '&#9744;' }}
        </button>
        <span class="idea-text">{{ idea.text }}</span>
        <button class="idea-delete" @click="deleteIdea(idea._id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.idea-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-surface);
  border-left: 1px solid var(--color-border);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-subtle);
}

.panel-title {
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
}

.panel-close {
  font-size: 1.5rem;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 0 var(--space-xs);
}
.panel-close:hover { color: var(--color-text); }

.panel-add {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.add-input {
  font-family: var(--font-body);
  font-size: 0.9rem;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  resize: none;
  background: var(--color-bg);
  color: var(--color-text);
}
.add-input:focus { border-color: var(--color-primary); }

.add-btn {
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 600;
  padding: var(--space-xs) var(--space-md);
  background: var(--color-primary);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  align-self: flex-end;
}
.add-btn:hover { background: var(--color-primary-hover); }
.add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.panel-filters {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--color-border-subtle);
}

.filter-btn {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  border: 1px solid transparent;
}
.filter-btn.active {
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-bg);
}

.panel-loading, .panel-empty {
  padding: var(--space-lg);
  color: var(--color-text-muted);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  text-align: center;
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm) 0;
}

.idea-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  transition: background 0.1s;
}
.idea-item:hover { background: var(--color-bg); }
.idea-item.used .idea-text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.idea-check {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  padding-top: 1px;
}
.idea-check:hover { color: var(--color-chain-ok); }

.idea-text {
  flex: 1;
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.idea-delete {
  font-size: 1rem;
  color: var(--color-text-muted);
  opacity: 0;
  flex-shrink: 0;
}
.idea-item:hover .idea-delete { opacity: 1; }
.idea-delete:hover { color: var(--color-chain-break); }
</style>
