<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
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
  () => props.portableText,
  (pt) => {
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

defineExpose({ toggleTransitionMark, editor })
</script>

<template>
  <EditorContent :editor="editor" />
</template>

<style>
.question-editor-content { outline: none; min-height: 1.6em; }
.question-editor-content p { margin: 0; }
</style>
