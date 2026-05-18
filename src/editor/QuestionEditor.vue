<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions/placeholder'
import { TransitionInMark } from './TransitionInMark.js'
import { TransitionOutMark } from './TransitionOutMark.js'
import { portableTextToTiptap } from './portableTextToTiptap.js'
import { tiptapToPortableText } from './tiptapToPortableText.js'

const props = defineProps({
  portableText: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update'])

let preservedMarkDefs = []

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit.configure({
      heading: false, bulletList: false, orderedList: false,
      blockquote: false, codeBlock: false, horizontalRule: false,
    }),
    TransitionInMark,
    TransitionOutMark,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: { class: 'question-editor-content' },
  },
  onUpdate: ({ editor }) => {
    const doc = editor.getJSON()
    const pt = tiptapToPortableText(doc, preservedMarkDefs)
    emit('update', [pt])
  },
})

watch(
  [() => props.portableText, editor],
  ([pt]) => {
    if (!editor.value || !pt) return
    const block = Array.isArray(pt) ? pt[0] : pt
    if (!block) return
    const result = portableTextToTiptap(block)
    preservedMarkDefs = result.preservedMarkDefs || []
    const currentText = editor.value.getText()
    const newText = block?.children?.map(c => c.text).join('') || ''
    if (currentText !== newText) {
      editor.value.commands.setContent(result.doc)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => editor.value?.destroy())

function toggleTransitionMark(type) {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  if (from === to) return
  editor.value.chain().focus().toggleMark(type).run()
}

function removeTransitionMarks() {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  if (from === to) return
  if (editor.value.isActive('transitionIn')) {
    editor.value.chain().focus().toggleMark('transitionIn').run()
  } else if (editor.value.isActive('transitionOut')) {
    editor.value.chain().focus().toggleMark('transitionOut').run()
  }
}

function clearMarkAll(type) {
  if (!editor.value) return
  const { doc } = editor.value.state
  const { tr } = editor.value.state
  const markType = editor.value.schema.marks[type]
  if (!markType) return
  doc.descendants((node, pos) => {
    node.marks.filter(m => m.type === markType).forEach(() => {
      tr.removeMark(pos, pos + node.nodeSize, markType)
    })
  })
  if (tr.docChanged) editor.value.view.dispatch(tr)
}

defineExpose({ toggleTransitionMark, removeTransitionMarks, clearMarkAll, editor })
</script>

<template>
  <EditorContent :editor="editor" />
</template>

<style>
.question-editor-content { outline: none; min-height: 1.6em; }
.question-editor-content p { margin: 0; }
.question-editor-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--color-text-muted, #999);
  opacity: 0.5;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
