<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useIdeas } from '../composables/useIdeas.js'
import ConfirmModal from './ConfirmModal.vue'

const emit = defineEmits(['close'])
const { ideas, loading, fetchIdeas, addIdea, toggleUsed, updateIdea, deleteIdea } = useIdeas()

const newIdeaText = ref('')
const filter = ref('active')
const editingId = ref(null)
const editText = ref('')

const filteredIdeas = computed(() => {
  if (filter.value === 'active') return ideas.value.filter(i => !i.used)
  if (filter.value === 'used') return ideas.value.filter(i => i.used)
  return ideas.value
})

const counts = computed(() => ({
  active: ideas.value.filter(i => !i.used).length,
  used: ideas.value.filter(i => i.used).length,
  all: ideas.value.length,
}))

async function handleAdd() {
  const text = newIdeaText.value.trim()
  if (!text) return
  await addIdea(text)
  newIdeaText.value = ''
}

function handleAddKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAdd()
  }
}

async function startEditing(idea) {
  editingId.value = idea._id
  editText.value = idea.text
  await nextTick()
  const el = document.querySelector('.edit-input')
  if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) }
}

async function saveEdit() {
  if (!editingId.value) return
  const text = editText.value.trim()
  if (text) await updateIdea(editingId.value, text)
  editingId.value = null
  editText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

function handleEditKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
  if (e.key === 'Escape') cancelEdit()
}

async function handleArchive(id) {
  if (editingId.value === id) cancelEdit()
  await toggleUsed(id)
}

const pendingDeleteId = ref(null)

function handleDelete(id) {
  pendingDeleteId.value = id
}

async function confirmDelete() {
  const id = pendingDeleteId.value
  pendingDeleteId.value = null
  if (!id) return
  if (editingId.value === id) cancelEdit()
  await deleteIdea(id)
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
        @keydown="handleAddKeydown"
        placeholder="Ny ide eller overgang..."
        rows="2"
        class="add-input"
      />
      <button class="add-btn" :disabled="!newIdeaText.trim()" @click="handleAdd">Legg til</button>
    </div>

    <div class="panel-filters">
      <button v-for="f in [['active', 'Aktive'], ['used', 'Arkiv'], ['all', 'Alle']]" :key="f[0]" :class="['filter-btn', { active: filter === f[0] }]" @click="filter = f[0]">
        {{ f[1] }} <span class="filter-count">{{ counts[f[0]] }}</span>
      </button>
    </div>

    <div v-if="loading" class="panel-loading">Laster...</div>
    <div v-else-if="filteredIdeas.length === 0" class="panel-empty">{{ filter === 'active' ? 'Ingen aktive ideer' : filter === 'used' ? 'Arkivet er tomt' : 'Ingen ideer ennå' }}</div>
    <div v-else class="panel-list">
      <TransitionGroup name="idea-list" tag="div">
        <div v-for="idea in filteredIdeas" :key="idea._id" :class="['idea-item', { used: idea.used, editing: editingId === idea._id }]">
          <button class="idea-check" @click="toggleUsed(idea._id)">
            {{ idea.used ? '&#9745;' : '&#9744;' }}
          </button>

          <div v-if="editingId === idea._id" class="idea-edit-wrap">
            <textarea v-model="editText" @keydown="handleEditKeydown" @blur="saveEdit" class="edit-input" rows="2" />
          </div>
          <span v-else class="idea-text" @click="startEditing(idea)">{{ idea.text }}</span>

          <button v-if="!idea.used" class="idea-archive" @click="handleArchive(idea._id)" title="Arkiver">&#10003;</button>
          <button v-if="idea.used" class="idea-restore" @click="toggleUsed(idea._id)" title="Gjenopprett">&#8634;</button>
          <button v-if="idea.used" class="idea-delete" @click="handleDelete(idea._id)" title="Slett permanent">&times;</button>
        </div>
      </TransitionGroup>
    </div>

    <ConfirmModal v-if="pendingDeleteId" message="Slette denne ideen permanent?" confirm-label="Slett" @confirm="confirmDelete" @cancel="pendingDeleteId = null" />
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
  padding: var(--space-xs);
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
  transition: border-color 0.15s;
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
  transition: background 0.15s;
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
  transition: all 0.15s;
}
.filter-btn.active {
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-bg);
}
.filter-count {
  opacity: 0.6;
  font-size: 0.7rem;
}

.panel-loading, .panel-empty {
  padding: var(--space-xl);
  color: var(--color-text-muted);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  text-align: center;
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-xs) 0;
}

.idea-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  transition: background 0.15s;
}
.idea-item:hover { background: var(--color-bg); }
.idea-item.editing { background: var(--color-bg); }
.idea-item.used .idea-text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.idea-check {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  padding-top: 1px;
  transition: color 0.15s;
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
  cursor: text;
  padding: 1px 0;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.idea-text:hover { background: var(--color-bg); }

.idea-edit-wrap { flex: 1; }
.edit-input {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
  padding: var(--space-xs);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  resize: none;
}

.idea-archive, .idea-restore, .idea-delete {
  font-size: 1rem;
  color: var(--color-text-muted);
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 0.15s, color 0.15s;
}
.idea-item:hover .idea-archive,
.idea-item:hover .idea-restore,
.idea-item:hover .idea-delete { opacity: 1; }
.idea-archive:hover { color: var(--color-chain-ok); }
.idea-restore:hover { color: var(--color-transition-in); }
.idea-delete:hover { color: var(--color-chain-break); }

@media (max-width: 640px) {
  .idea-archive, .idea-restore, .idea-delete { opacity: 0.5; }
}

/* List transitions */
.idea-list-enter-active { transition: opacity 0.2s, transform 0.2s; }
.idea-list-leave-active { transition: opacity 0.15s; }
.idea-list-enter-from { opacity: 0; transform: translateY(-8px); }
.idea-list-leave-to { opacity: 0; }
.idea-list-move { transition: transform 0.2s; }
</style>
