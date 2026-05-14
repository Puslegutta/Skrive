const TIPTAP_TO_DECORATOR = {
  bold: 'strong',
}

const ANNOTATION_MARK_TYPES = new Set(['transitionIn', 'transitionOut'])

const DUMMY_VALUES = {
  transitionIn: 'in',
  transitionOut: 'out',
}

let keyCounter = 0

function generateKey() {
  keyCounter++
  return `k${Date.now().toString(36)}${keyCounter.toString(36)}`
}

/**
 * Convert a TipTap JSON document back to a Sanity Portable Text block.
 * Accepts an optional preservedMarkDefs array to restore unknown marks
 * that were stripped during the PT → TipTap conversion.
 */
export function tiptapToPortableText(doc, preservedMarkDefs = []) {
  if (!doc || !doc.content || doc.content.length === 0) {
    return {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      markDefs: [...preservedMarkDefs],
      children: [
        { _type: 'span', _key: generateKey(), text: '', marks: [] },
      ],
    }
  }

  const paragraph = doc.content[0]
  if (!paragraph || !paragraph.content || paragraph.content.length === 0) {
    return {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      markDefs: [...preservedMarkDefs],
      children: [
        { _type: 'span', _key: generateKey(), text: '', marks: [] },
      ],
    }
  }

  const markDefs = [...preservedMarkDefs]
  const children = []

  for (const textNode of paragraph.content) {
    const spanMarks = []

    for (const mark of textNode.marks || []) {
      const decoratorName = TIPTAP_TO_DECORATOR[mark.type]
      if (decoratorName) {
        spanMarks.push(decoratorName)
      } else if (ANNOTATION_MARK_TYPES.has(mark.type)) {
        const key =
          (mark.attrs && mark.attrs.sanityKey) || generateKey()

        const alreadyDefined = markDefs.some((md) => md._key === key)
        if (!alreadyDefined) {
          markDefs.push({
            _key: key,
            _type: mark.type,
            dummy: DUMMY_VALUES[mark.type],
          })
        }

        spanMarks.push(key)
      }
    }

    children.push({
      _type: 'span',
      _key: generateKey(),
      text: textNode.text || '',
      marks: spanMarks,
    })
  }

  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    markDefs,
    children,
  }
}
