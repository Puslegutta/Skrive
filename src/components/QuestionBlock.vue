<script setup>
import { ref } from 'vue'
import QuestionEditor from '../editor/QuestionEditor.vue'
import TransitionWordPopover from './TransitionWordPopover.vue'

const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, required: true },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})

const emit = defineEmits(['update', 'delete', 'move-up', 'move-down'])
const questionEditorRef = ref(null)
const answerEditorRef = ref(null)
const extraInfoEditorRef = ref(null)
const showExtras = ref(!!props.question.transitionIn || !!props.question.transitionOut || !!props.question.imageNote)

function updateField(field, value) {
  emit('update', { ...props.question, [field]: value })
}

function updateOption(i, value) {
  const options = [...(props.question.options || [])]
  options[i] = value
  emit('update', { ...props.question, options })
}

function addOption() {
  const options = [...(props.question.options || []), '']
  emit('update', { ...props.question, options })
}

function removeOption(i) {
  const options = (props.question.options || []).filter((_, idx) => idx !== i)
  emit('update', { ...props.question, options })
}

function handleTransitionMark(editorRef, type) {
  // Max 1 inn/ut per question: clear existing marks of this type in all fields
  for (const ref of [questionEditorRef.value, answerEditorRef.value, extraInfoEditorRef.value]) {
    if (ref && ref !== editorRef) ref.clearMarkAll(type)
  }
  editorRef?.toggleTransitionMark(type)
}
</script>

<template>
  <div class="question-block">
    <div class="question-gutter">
      <span class="question-number">{{ index + 1 }}.</span>
      <div class="move-buttons">
        <button class="move-btn" :disabled="isFirst" @click="emit('move-up')">&uarr;</button>
        <button class="move-btn" :disabled="isLast" @click="emit('move-down')">&darr;</button>
      </div>
    </div>
    <div class="question-content">
      <div class="field-question">
        <div style="position: relative;">
          <QuestionEditor ref="questionEditorRef" :portable-text="question.question" placeholder="Skriv sporsmal..." @update="updateField('question', $event)" />
          <TransitionWordPopover :editor="questionEditorRef?.editor" @mark="handleTransitionMark(questionEditorRef, $event)" @remove="questionEditorRef?.removeTransitionMarks()" />
        </div>
      </div>

      <div class="field-answer">
        <span class="field-marker">&rarr;</span>
        <div style="position: relative; flex: 1;">
          <QuestionEditor ref="answerEditorRef" :portable-text="question.answer" placeholder="Skriv svar..." @update="updateField('answer', $event)" />
          <TransitionWordPopover :editor="answerEditorRef?.editor" @mark="handleTransitionMark(answerEditorRef, $event)" @remove="answerEditorRef?.removeTransitionMarks()" />
        </div>
      </div>

      <div class="field-options">
        <div v-for="(opt, i) in (question.options || [])" :key="i" class="option-row">
          <span class="field-marker">&times;</span>
          <input :value="opt" @input="updateOption(i, $event.target.value)" placeholder="Galt alternativ..." class="option-input" />
          <button class="remove-option" @click="removeOption(i)">&times;</button>
        </div>
        <button v-if="(question.options || []).length < 3" class="add-option" @click="addOption">+ alternativ</button>
      </div>

      <div class="field-extra">
        <div style="position: relative;">
          <QuestionEditor ref="extraInfoEditorRef" :portable-text="question.extraInfo" placeholder="Tilleggstekst..." @update="updateField('extraInfo', $event)" />
          <TransitionWordPopover :editor="extraInfoEditorRef?.editor" @mark="handleTransitionMark(extraInfoEditorRef, $event)" @remove="extraInfoEditorRef?.removeTransitionMarks()" />
        </div>
      </div>

      <button class="toggle-extras" @click="showExtras = !showExtras">{{ showExtras ? '&#9662;' : '&#9656;' }} Mer</button>

      <div v-if="showExtras" class="extras-panel">
        <div class="text-transition">
          <label>&larr; Overgang inn (tekst):</label>
          <input :value="question.transitionIn || ''" @input="updateField('transitionIn', $event.target.value)" placeholder="Overgangsord..." />
        </div>
        <div class="text-transition">
          <label>Overgang ut (tekst) &rarr;:</label>
          <input :value="question.transitionOut || ''" @input="updateField('transitionOut', $event.target.value)" placeholder="Overgangsord..." />
        </div>
        <div class="image-note">
          <label>Bildenotat:</label>
          <input :value="question.imageNote || ''" @input="updateField('imageNote', $event.target.value)" placeholder="f.eks. bilde av Wagner..." />
        </div>
        <button class="delete-question" @click="emit('delete')">Slett sporsmal</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-block { display: flex; gap: var(--space-md); padding: var(--space-lg) 0; border-bottom: 1px solid var(--color-border-subtle); }
.question-gutter { display: flex; flex-direction: column; align-items: center; min-width: 2rem; gap: var(--space-xs); }
.question-number { font-family: var(--font-ui); font-weight: 700; font-size: 1.1rem; color: var(--color-text-muted); padding-top: 2px; }
.move-buttons { display: flex; flex-direction: column; gap: 0; }
.move-btn { font-size: 0.75rem; color: var(--color-text-muted); padding: 2px 6px; line-height: 1; opacity: 0.5; }
.move-btn:hover:not(:disabled) { opacity: 1; }
.move-btn:disabled { opacity: 0.15; cursor: default; }
.question-content { flex: 1; display: flex; flex-direction: column; gap: var(--space-sm); }
.field-question { font-size: 1.1rem; line-height: 1.5; }
.field-answer { display: flex; align-items: flex-start; gap: var(--space-sm); }
.field-marker { font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-muted); padding-top: 2px; }
.field-options { display: flex; flex-direction: column; gap: var(--space-xs); padding-left: 1.5rem; }
.option-row { display: flex; align-items: center; gap: var(--space-sm); }
.option-input { flex: 1; font-size: 0.95rem; padding: 2px 0; border-bottom: 1px solid transparent; color: var(--color-text-secondary); }
.option-input:focus { border-bottom-color: var(--color-border); }
.remove-option { font-size: 1rem; color: var(--color-text-muted); opacity: 0; }
.option-row:hover .remove-option { opacity: 1; }
.add-option { font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-text-muted); text-align: left; padding: 2px 0; }
.field-extra { font-size: 0.9rem; font-style: italic; color: var(--color-text-secondary); }
.toggle-extras { font-family: var(--font-ui); font-size: 0.8rem; color: var(--color-text-muted); text-align: left; }
.extras-panel { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-sm); background: var(--color-bg); border-radius: var(--radius-sm); }
.text-transition, .image-note { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.85rem; }
.text-transition label, .image-note label { font-family: var(--font-ui); color: var(--color-text-muted); white-space: nowrap; }
.text-transition input, .image-note input { flex: 1; font-size: 0.85rem; padding: 2px 0; border-bottom: 1px solid var(--color-border-subtle); }
.delete-question { font-family: var(--font-ui); font-size: 0.75rem; color: var(--color-chain-break); opacity: 0.6; text-align: left; padding: var(--space-sm) 0 0; }
.delete-question:hover { opacity: 1; }
</style>
