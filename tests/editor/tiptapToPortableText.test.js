import { describe, it, expect } from 'vitest'
import { tiptapToPortableText } from '../../src/editor/tiptapToPortableText.js'
import { portableTextToTiptap } from '../../src/editor/portableTextToTiptap.js'

describe('tiptapToPortableText', () => {
  it('converts a plain text paragraph', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    }

    const block = tiptapToPortableText(doc)

    expect(block._type).toBe('block')
    expect(block.style).toBe('normal')
    expect(block.markDefs).toEqual([])
    expect(block.children).toHaveLength(1)
    expect(block.children[0]._type).toBe('span')
    expect(block.children[0].text).toBe('Hello world')
    expect(block.children[0].marks).toEqual([])
  })

  it('converts a paragraph with transitionIn mark', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'I filmen ' },
            {
              type: 'text',
              text: 'Fargo',
              marks: [
                {
                  type: 'transitionIn',
                  attrs: { sanityKey: 'm1' },
                },
              ],
            },
          ],
        },
      ],
    }

    const block = tiptapToPortableText(doc)

    expect(block.markDefs).toHaveLength(1)
    expect(block.markDefs[0]).toEqual({
      _key: 'm1',
      _type: 'transitionIn',
      dummy: 'in',
    })
    expect(block.children[0].text).toBe('I filmen ')
    expect(block.children[0].marks).toEqual([])
    expect(block.children[1].text).toBe('Fargo')
    expect(block.children[1].marks).toEqual(['m1'])
  })

  it('preserves existing sanityKey', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'word',
              marks: [
                {
                  type: 'transitionOut',
                  attrs: { sanityKey: 'original-key-42' },
                },
              ],
            },
          ],
        },
      ],
    }

    const block = tiptapToPortableText(doc)

    expect(block.markDefs[0]._key).toBe('original-key-42')
    expect(block.children[0].marks).toEqual(['original-key-42'])
  })

  it('generates new key when sanityKey is null', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'word',
              marks: [
                {
                  type: 'transitionIn',
                  attrs: { sanityKey: null },
                },
              ],
            },
          ],
        },
      ],
    }

    const block = tiptapToPortableText(doc)

    expect(block.markDefs).toHaveLength(1)
    expect(block.markDefs[0]._key).toBeTruthy()
    expect(block.markDefs[0]._type).toBe('transitionIn')
    expect(block.markDefs[0].dummy).toBe('in')
    expect(block.children[0].marks[0]).toBe(block.markDefs[0]._key)
  })

  it('restores preserved markDefs', () => {
    const preserved = [
      { _key: 'h1', _type: 'helpText', text: 'This is a hint' },
    ]

    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Some text' }],
        },
      ],
    }

    const block = tiptapToPortableText(doc, preserved)

    expect(block.markDefs).toContainEqual({
      _key: 'h1',
      _type: 'helpText',
      text: 'This is a hint',
    })
  })

  it('converts bold mark to strong decorator', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is ' },
            {
              type: 'text',
              text: 'bold',
              marks: [{ type: 'bold' }],
            },
            { type: 'text', text: ' text' },
          ],
        },
      ],
    }

    const block = tiptapToPortableText(doc)

    expect(block.markDefs).toEqual([])
    expect(block.children[1].text).toBe('bold')
    expect(block.children[1].marks).toEqual(['strong'])
  })

  it('roundtrips: PT → TipTap → PT preserves structure', () => {
    const original = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [
        { _key: 'm1', _type: 'transitionIn', dummy: 'in' },
        { _key: 'm2', _type: 'transitionOut', dummy: 'out' },
      ],
      children: [
        { _type: 'span', _key: 's1', text: 'I filmen ', marks: [] },
        { _type: 'span', _key: 's2', text: 'Fargo', marks: ['m1'] },
        { _type: 'span', _key: 's3', text: ' ser vi ', marks: [] },
        {
          _type: 'span',
          _key: 's4',
          text: 'brødrene',
          marks: ['m2'],
        },
      ],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(original)
    const result = tiptapToPortableText(doc, preservedMarkDefs)

    // Verify text content is preserved
    expect(result.children.map((c) => c.text)).toEqual(
      original.children.map((c) => c.text)
    )

    // Verify markDefs keys are preserved
    const resultKeys = result.markDefs.map((md) => md._key).sort()
    const originalKeys = original.markDefs.map((md) => md._key).sort()
    expect(resultKeys).toEqual(originalKeys)

    // Verify markDefs types and dummy values
    for (const origMd of original.markDefs) {
      const resultMd = result.markDefs.find(
        (md) => md._key === origMd._key
      )
      expect(resultMd._type).toBe(origMd._type)
      expect(resultMd.dummy).toBe(origMd.dummy)
    }

    // Verify marks on spans reference correct keys
    expect(result.children[0].marks).toEqual([])
    expect(result.children[1].marks).toEqual(['m1'])
    expect(result.children[2].marks).toEqual([])
    expect(result.children[3].marks).toEqual(['m2'])
  })

  it('handles null doc input', () => {
    const block = tiptapToPortableText(null)

    expect(block._type).toBe('block')
    expect(block.children).toHaveLength(1)
    expect(block.children[0].text).toBe('')
  })

  it('handles empty doc content', () => {
    const block = tiptapToPortableText({ type: 'doc', content: [] })

    expect(block._type).toBe('block')
    expect(block.children).toHaveLength(1)
    expect(block.children[0].text).toBe('')
  })
})
