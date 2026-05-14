import { Mark } from '@tiptap/core'

export const TransitionOutMark = Mark.create({
  name: 'transitionOut',

  addAttributes() {
    return {
      sanityKey: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span.transition-out' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'transition-out', ...HTMLAttributes }, 0]
  },
})
