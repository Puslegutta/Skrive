const KNOWN_ANNOTATION_TYPES = new Set(['transitionIn', 'transitionOut'])
const KNOWN_DECORATOR_TYPES = new Set(['strong'])

const DECORATOR_TO_TIPTAP = {
  strong: 'bold',
}

/**
 * Convert a Sanity Portable Text block (single block) into a TipTap-compatible
 * JSON document. Returns { doc, preservedMarkDefs } where preservedMarkDefs
 * contains any markDefs not handled by our known mark types.
 */
export function portableTextToTiptap(block) {
  if (!block || !block.children || block.children.length === 0) {
    return {
      doc: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
          },
        ],
      },
      preservedMarkDefs: [],
    }
  }

  const markDefs = block.markDefs || []
  const markDefsByKey = new Map(markDefs.map((md) => [md._key, md]))

  const preservedMarkDefs = markDefs.filter(
    (md) => !KNOWN_ANNOTATION_TYPES.has(md._type)
  )

  const content = block.children.map((child) => {
    const node = { type: 'text', text: child.text || '' }
    const marks = []

    for (const markRef of child.marks || []) {
      if (KNOWN_DECORATOR_TYPES.has(markRef)) {
        marks.push({ type: DECORATOR_TO_TIPTAP[markRef] })
      } else {
        const markDef = markDefsByKey.get(markRef)
        if (markDef && KNOWN_ANNOTATION_TYPES.has(markDef._type)) {
          marks.push({
            type: markDef._type,
            attrs: { sanityKey: markDef._key },
          })
        }
        // Unknown annotation marks are silently skipped from inline marks
        // but their markDefs are preserved in preservedMarkDefs
      }
    }

    if (marks.length > 0) {
      node.marks = marks
    }

    return node
  })

  return {
    doc: {
      type: 'doc',
      content: [{ type: 'paragraph', content }],
    },
    preservedMarkDefs,
  }
}
