import { Mark } from '@tiptap/core'

export const TransitionInMark = Mark.create({
  name: 'transitionIn',

  addAttributes() {
    return {
      sanityKey: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span.transition-in' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'transition-in', ...HTMLAttributes }, 0]
  },
})
