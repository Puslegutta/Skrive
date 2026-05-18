<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useRounds } from '../composables/useRounds.js'
import { findNextRoundNumber } from '../composables/useAutoNumber.js'
import { getRating, setRating } from '../composables/useLocalRatings.js'
import QuestionBlock from '../components/QuestionBlock.vue'
import TransitionChainLink from '../components/TransitionChainLink.vue'
import StatusBadge from '../components/StatusBadge.vue'
import IdeaBankPanel from '../components/IdeaBankPanel.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { rounds, loading, error, fetchRounds, saveRound, deleteRound } = useRounds()

const round = ref(null)
const savedSnapshot = ref(null)
const initialized = ref(false)
const saving = ref(false)
const saveStatus = ref('')
const ideaPanelOpen = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')
let pendingNavigation = null

function showConfirm(message, action) {
  confirmMessage.value = message
  confirmAction.value = action
}

function handleConfirm() {
  const action = confirmAction.value
  confirmAction.value = null
  confirmMessage.value = ''
  if (action) action()
}

function handleCancelConfirm() {
  confirmAction.value = null
  confirmMessage.value = ''
  pendingNavigation = null
}
const hasChanges = computed(() => {
  if (!initialized.value || !round.value || !savedSnapshot.value) return false
  return JSON.stringify(round.value) !== savedSnapshot.value
})

function takeSnapshot() {
  savedSnapshot.value = JSON.stringify(round.value)
}

function revert() {
  if (!savedSnapshot.value) return
  round.value = JSON.parse(savedSnapshot.value)
  localStorage.removeItem(`skrive-draft-${route.params.id}`)
}

watch(round, () => {
  if (!initialized.value || !round.value) return
  if (hasChanges.value) {
    localStorage.setItem(`skrive-draft-${route.params.id}`, JSON.stringify(round.value))
  } else {
    localStorage.removeItem(`skrive-draft-${route.params.id}`)
  }
}, { deep: true })

function extractAnnotationFromPT(blocks, type) {
  if (!Array.isArray(blocks)) return null
  for (const block of blocks) {
    if (!block.markDefs || !block.children) continue
    const keys = block.markDefs.filter(md => md._type === type).map(md => md._key)
    if (keys.length === 0) continue
    for (const child of block.children) {
      if (child.marks?.some(m => keys.includes(m))) return child.text
    }
  }
  return null
}

function getTransitionOut(question) {
  if (!question) return null
  return extractAnnotationFromPT(question.question, 'transitionOut')
    || extractAnnotationFromPT(question.answer, 'transitionOut')
    || extractAnnotationFromPT(question.extraInfo, 'transitionOut')
    || question.transitionOut || null
}

function getTransitionIn(question) {
  if (!question) return null
  return extractAnnotationFromPT(question.question, 'transitionIn')
    || extractAnnotationFromPT(question.answer, 'transitionIn')
    || extractAnnotationFromPT(question.extraInfo, 'transitionIn')
    || question.transitionIn || null
}

const title = computed(() => {
  if (!round.value) return ''
  return round.value.roundNumber ? `Runde ${round.value.roundNumber}` : 'Utkast'
})

function updateQuestion(index, updated) {
  round.value.questions[index] = updated
}

function deleteQuestion(index) {
  showConfirm('Slette dette sporsmalet?', () => {
    round.value.questions.splice(index, 1)
  })
}

function moveQuestion(index, direction) {
  const target = index + direction
  if (target < 0 || target >= round.value.questions.length) return
  const questions = [...round.value.questions]
  const [moved] = questions.splice(index, 1)
  questions.splice(target, 0, moved)
  round.value.questions = questions
}

function addQuestion() {
  if (!round.value) return
  if ((round.value.questions || []).length >= 10) return
  if (!round.value.questions) round.value.questions = []
  round.value.questions.push({
    _key: Math.random().toString(36).slice(2, 10),
    question: [],
    answer: [],
    options: [],
    extraInfo: '',
    transitionIn: '',
    transitionOut: '',
    imageNote: '',
  })
}

function setStatus(status) {
  if (!round.value) return
  round.value.status = status
  if (status === 'done' && !round.value.roundNumber) {
    round.value.roundNumber = findNextRoundNumber(rounds.value)
  }
}

function ptToText(blocks) {
  if (!Array.isArray(blocks)) return blocks || ''
  return blocks.map(b => b.children?.map(c => c.text).join('') || '').join(' ')
}

const localRating = ref(0)

function toggleRating(n) {
  const newVal = localRating.value === n ? 0 : n
  localRating.value = newVal
  setRating(route.params.id, newVal)
}

const copiedBtn = ref('')

function buildRoundText() {
  if (!round.value) return ''
  const lines = []
  lines.push(title.value)
  if (round.value.cardPitch) lines.push(`Kortpitch: ${round.value.cardPitch}`)
  lines.push('')

  for (let i = 0; i < (round.value.questions || []).length; i++) {
    const q = round.value.questions[i]
    const qText = ptToText(q.question)
    const aText = ptToText(q.answer)
    lines.push(`${i + 1}. ${qText}`)
    lines.push(`   Svar: ${aText}`)
    if (q.options?.length) {
      lines.push(`   Alternativer: ${q.options.filter(o => o).join(', ')}`)
    }
    const extra = ptToText(q.extraInfo)
    if (extra) lines.push(`   Tilleggstekst: ${extra}`)
    const tin = getTransitionIn(q)
    const tout = getTransitionOut(q)
    if (tin || tout) lines.push(`   Overgangsord: ${[tin && `inn: ${tin}`, tout && `ut: ${tout}`].filter(Boolean).join(', ')}`)
    lines.push('')
  }
  return lines.join('\n')
}

const AI_REVIEW_PROMPT = `Du er en faktasjekker og quizredaktør. Gå gjennom denne quizrunden fra Iddiotquiz.

Konseptet: En runde har 3\u201310 spørsmål i kjede. Svaret på hvert spørsmål inneholder et «overgangsord» som kobler til neste spørsmål — enten bokstavelig (et ord som går igjen) eller tematisk. Spillerne ser ikke svaret før de har svart, så overgangen er en skjult kobling.

Sjekk følgende:
1. FAKTA: Er alle spørsmål og svar faktisk korrekte? Merk eventuelle feil eller tvilstilfeller.
2. OVERGANGER: Fungerer koblingen mellom hvert spørsmål? Er overgangsordene tydelige nok?
3. VANSKELIGHETSGRAD: Er runden balansert i vanskelighetsgrad, eller er noen spørsmål mye vanskeligere/lettere enn resten?
4. ALTERNATIVER: Er de gale svaralternativene troverdige men tydelig feil? Er de for lette å eliminere?
5. FORMULERING: Er spørsmålene klare og entydige? Kan noe misforstås?
6. TILLEGGSTEKST: Er «visste du at»-tekstene interessante og korrekte?

Gi konkret tilbakemelding per spørsmål der du finner noe. Avslutt med en kort oppsummering.

Her er runden:

`

async function copyToClipboard(text, btnId) {
  try {
    await navigator.clipboard.writeText(text)
    copiedBtn.value = btnId
  } catch {
    copiedBtn.value = ''
  }
  setTimeout(() => { copiedBtn.value = '' }, 2000)
}

async function copyRoundAsText() {
  await copyToClipboard(buildRoundText(), 'copy')
}

async function copyForAIReview() {
  await copyToClipboard(AI_REVIEW_PROMPT + buildRoundText(), 'ai')
}

async function handleSave() {
  if (!round.value || saving.value) return
  saving.value = true
  saveStatus.value = 'Lagrer...'
  try {
    await saveRound(route.params.id, {
      status: round.value.status,
      roundNumber: round.value.roundNumber,
      cardPitch: round.value.cardPitch || undefined,
      note: round.value.note || undefined,
      questions: round.value.questions.map(q => ({
        _key: q._key,
        question: q.question,
        answer: q.answer,
        options: (q.options || []).filter(o => o),
        transitionIn: q.transitionIn || undefined,
        transitionOut: q.transitionOut || undefined,
        extraInfo: q.extraInfo || undefined,
        imageNote: q.imageNote || undefined,
      })),
    })
    takeSnapshot()
    localStorage.removeItem(`skrive-draft-${route.params.id}`)
    localStorage.setItem('skrive-last-edited', route.params.id)
    saveStatus.value = 'Lagret'
    setTimeout(() => { saveStatus.value = '' }, 2000)
  } catch (e) {
    saveStatus.value = `Feil: ${e.message}`
  } finally {
    saving.value = false
  }
}

function handleDelete() {
  showConfirm('Slette denne runden?', async () => {
    await deleteRound(route.params.id)
    router.push('/')
  })
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function handleBack() {
  goBack()
}

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

const headerHidden = ref(false)
let lastScrollY = 0

function handleScroll() {
  const y = window.scrollY
  headerHidden.value = y > lastScrollY && y > 60
  lastScrollY = y
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('beforeunload', handleBeforeUnload)
  await fetchRounds()
  const found = rounds.value.find(r => r._id === route.params.id)
  if (found) {
    const draft = localStorage.getItem(`skrive-draft-${route.params.id}`)
    if (draft) {
      round.value = JSON.parse(draft)
    } else {
      round.value = JSON.parse(JSON.stringify(found))
    }
    localRating.value = getRating(route.params.id)
    // Let TipTap editors initialize and round-trip before taking snapshot
    setTimeout(() => {
      takeSnapshot()
      initialized.value = true
    }, 300)
  }
})

// Warn on browser refresh/close with unsaved changes
function handleBeforeUnload(e) {
  if (hasChanges.value) {
    e.preventDefault()
  }
}

// Warn on in-app navigation (nav links, browser back)
let leaveConfirmed = false

onBeforeRouteLeave((to) => {
  if (leaveConfirmed || !hasChanges.value) return true
  pendingNavigation = to.fullPath
  showConfirm('Du har ulagrede endringer. Vil du forlate siden?', () => {
    localStorage.removeItem(`skrive-draft-${route.params.id}`)
    leaveConfirmed = true
    router.push(pendingNavigation)
  })
  return false
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div v-if="loading" class="editor-status">Laster...</div>
  <div v-else-if="error" class="editor-status editor-error">{{ error }}</div>
  <div v-else-if="!round" class="editor-status">Fant ikke runden.</div>
  <div v-else :class="['editor-layout', { 'panel-open': ideaPanelOpen }]">
    <div class="editor-main">
      <div class="round-editor">
        <div class="editor-top" :class="{ 'header-hidden': headerHidden }">
          <a href="#" class="back-link" @click.prevent="handleBack">&larr; Alle runder</a>
          <div class="editor-top-actions">
            <button class="idea-toggle" @click="ideaPanelOpen = !ideaPanelOpen">Idebank</button>
            <button class="delete-round-btn" @click="handleDelete">Slett runde</button>
          </div>
        </div>

        <h1 class="editor-title">{{ title }}</h1>

        <div class="status-row">
          <button v-for="s in ['draft', 'inProgress', 'review', 'done']" :key="s" :class="['status-btn', { active: round.status === s }]" @click="setStatus(s)">
            <StatusBadge :status="s" />
          </button>
          <span class="rating-divider"></span>
          <button v-for="n in 3" :key="'star'+n" class="rating-btn" @click="toggleRating(n)">{{ n <= localRating ? '\u2605' : '\u2606' }}</button>
        </div>

        <div class="meta-fields">
          <div class="meta-field">
            <label>Kortpitch</label>
            <input v-model="round.cardPitch" placeholder="Kort beskrivelse av runden..." class="meta-input" />
          </div>
          <div class="meta-field">
            <label>Notat</label>
            <textarea v-model="round.note" placeholder="Interne notater..." rows="2" class="meta-input meta-textarea" />
          </div>
        </div>

        <div class="questions-flow">
          <template v-for="(q, i) in round.questions" :key="q._key">
            <TransitionChainLink v-if="i > 0" :out-word="getTransitionOut(round.questions[i - 1])" :in-word="getTransitionIn(q)" />
            <QuestionBlock :question="q" :index="i" :is-first="i === 0" :is-last="i === round.questions.length - 1" @update="updateQuestion(i, $event)" @delete="deleteQuestion(i)" @move-up="moveQuestion(i, -1)" @move-down="moveQuestion(i, 1)" />
          </template>
        </div>

        <button v-if="(round.questions || []).length < 10" class="add-question-btn" @click="addQuestion">+ Legg til sporsmal</button>
      </div>
    </div>

    <Transition name="slide">
      <aside v-if="ideaPanelOpen" class="idea-sidebar">
        <IdeaBankPanel @close="ideaPanelOpen = false" />
      </aside>
    </Transition>

    <div v-if="ideaPanelOpen" class="idea-overlay" @click="ideaPanelOpen = false" />

    <div class="save-bar">
      <button class="copy-btn" @click="copyRoundAsText">Kopier {{ copiedBtn === 'copy' ? '\u2713' : '' }}</button>
      <button class="copy-btn ai-review-btn" @click="copyForAIReview">AI-sjekk {{ copiedBtn === 'ai' ? '\u2713' : '' }}</button>
      <button v-if="hasChanges" class="revert-btn" @click="revert">Angre</button>
      <span class="save-status">{{ saveStatus }}</span>
      <button class="save-btn" :disabled="saving" @click="handleSave">Lagre</button>
    </div>

    <ConfirmModal v-if="confirmAction" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancelConfirm" />
  </div>
</template>

<style scoped>
.editor-status { padding: var(--space-2xl); color: var(--color-text-muted); font-size: 1.1rem; }
.editor-error { color: var(--color-chain-break); }

.editor-layout { position: relative; }
.editor-main { transition: margin-right 0.3s ease; }
.round-editor { max-width: 720px; margin: 0 auto; padding: var(--space-lg) var(--space-md) 6rem; }

.editor-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg);
  position: sticky; top: calc(var(--app-header-height, 2.5rem) - 1px); z-index: 15;
  background: var(--color-bg);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  margin: 0 calc(-1 * var(--space-md)); padding: var(--space-sm) var(--space-md);
  transition: transform 0.25s ease;
}
.editor-top.header-hidden {
  transform: translateY(-100%);
}
.editor-top-actions { display: flex; align-items: center; gap: var(--space-md); }
.back-link { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-muted); }
.back-link:hover { color: var(--color-text); }
.delete-round-btn { font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-chain-break); opacity: 0.6; }
.delete-round-btn:hover { opacity: 1; }

.idea-toggle {
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.idea-toggle:hover { color: var(--color-text); border-color: var(--color-text-muted); }
.panel-open .idea-toggle { color: var(--color-primary); border-color: var(--color-primary); }

.editor-title { font-size: 1.8rem; margin-bottom: var(--space-md); }
.status-row { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.status-btn { padding: 2px; border-radius: var(--radius-sm); opacity: 0.4; transition: opacity 0.15s; }
.status-btn.active { opacity: 1; }
.status-btn:hover { opacity: 0.8; }
.rating-divider { width: 1px; height: 1.2rem; background: var(--color-border-subtle); margin: 0 var(--space-xs); }
.rating-btn { font-size: 1.1rem; color: var(--color-status-in-progress); padding: 2px; }
.meta-fields { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-xl); padding-bottom: var(--space-xl); border-bottom: 1px solid var(--color-border-subtle); }
.meta-field { display: flex; flex-direction: column; gap: var(--space-xs); }
.meta-field label { font-family: var(--font-ui); font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.meta-input { font-size: 1rem; padding: var(--space-xs) 0; border-bottom: 1px solid var(--color-border-subtle); }
.meta-input:focus { border-bottom-color: var(--color-border); }
.meta-textarea { resize: vertical; min-height: 2.5rem; }
.questions-flow { margin-bottom: var(--space-lg); }
.add-question-btn { font-family: var(--font-ui); font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted); padding: var(--space-md) 0; width: 100%; text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-xl); }
.add-question-btn:hover { color: var(--color-text); border-color: var(--color-text-muted); }

/* Idea sidebar */
.idea-sidebar {
  position: fixed;
  top: 48px;
  right: 0;
  bottom: 0;
  width: 340px;
  z-index: 30;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
}
.idea-overlay { display: none; }

/* On desktop, push content */
@media (min-width: 1100px) {
  .panel-open .editor-main { margin-right: 340px; }
  .idea-sidebar { box-shadow: none; }
}

/* On mobile, overlay */
@media (max-width: 1099px) {
  .idea-sidebar { width: 85vw; max-width: 380px; }
  .idea-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 25;
  }
}

/* Slide transition */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* Save bar */
.save-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-sm) var(--space-lg); background: var(--color-bg-elevated); border-top: 1px solid var(--color-border); z-index: 20; }
.save-status { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-muted); }
.save-btn { font-family: var(--font-ui); font-weight: 600; padding: var(--space-sm) 4rem; background: var(--color-primary); color: var(--color-bg); border-radius: var(--radius-md); }
.save-btn:hover { background: var(--color-primary-hover); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.copy-btn { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-muted); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); min-width: 5rem; }
.copy-btn:hover { color: var(--color-text); border-color: var(--color-text-muted); }
.ai-review-btn { color: var(--color-status-review); border-color: var(--color-status-review); opacity: 0.7; }
.ai-review-btn:hover { opacity: 1; }
.revert-btn { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-muted); padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.revert-btn:hover { color: var(--color-chain-break); border-color: var(--color-chain-break); }
</style>
