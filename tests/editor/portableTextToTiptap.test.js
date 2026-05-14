import { describe, it, expect } from 'vitest'
import { portableTextToTiptap } from '../../src/editor/portableTextToTiptap.js'

describe('portableTextToTiptap', () => {
  it('converts a plain text block', () => {
    const block = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: 's1', text: 'Hello world', marks: [] },
      ],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(block)

    expect(doc.type).toBe('doc')
    expect(doc.content).toHaveLength(1)
    expect(doc.content[0].type).toBe('paragraph')
    expect(doc.content[0].content).toHaveLength(1)
    expect(doc.content[0].content[0]).toEqual({
      type: 'text',
      text: 'Hello world',
    })
    expect(preservedMarkDefs).toEqual([])
  })

  it('converts a block with transitionIn annotation', () => {
    const block = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [
        { _key: 'm1', _type: 'transitionIn', dummy: 'in' },
      ],
      children: [
        { _type: 'span', _key: 's1', text: 'In filmen ', marks: [] },
        { _type: 'span', _key: 's2', text: 'Fargo', marks: ['m1'] },
      ],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(block)
    const spans = doc.content[0].content

    expect(spans).toHaveLength(2)
    expect(spans[0]).toEqual({ type: 'text', text: 'In filmen ' })
    expect(spans[1]).toEqual({
      type: 'text',
      text: 'Fargo',
      marks: [{ type: 'transitionIn', attrs: { sanityKey: 'm1' } }],
    })
    expect(preservedMarkDefs).toEqual([])
  })

  it('converts a block with both transitionIn and transitionOut', () => {
    const block = {
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
        { _type: 'span', _key: 's4', text: 'brødrene', marks: ['m2'] },
      ],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(block)
    const spans = doc.content[0].content

    expect(spans).toHaveLength(4)
    expect(spans[1].marks).toEqual([
      { type: 'transitionIn', attrs: { sanityKey: 'm1' } },
    ])
    expect(spans[3].marks).toEqual([
      { type: 'transitionOut', attrs: { sanityKey: 'm2' } },
    ])
    expect(preservedMarkDefs).toEqual([])
  })

  it('converts a block with strong/bold decorator', () => {
    const block = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: 's1', text: 'This is ', marks: [] },
        { _type: 'span', _key: 's2', text: 'bold', marks: ['strong'] },
        { _type: 'span', _key: 's3', text: ' text', marks: [] },
      ],
    }

    const { doc } = portableTextToTiptap(block)
    const spans = doc.content[0].content

    expect(spans[1]).toEqual({
      type: 'text',
      text: 'bold',
      marks: [{ type: 'bold' }],
    })
  })

  it('preserves unknown marks like helpText in preservedMarkDefs', () => {
    const block = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [
        { _key: 'h1', _type: 'helpText', text: 'This is a hint' },
        { _key: 'm1', _type: 'transitionIn', dummy: 'in' },
      ],
      children: [
        { _type: 'span', _key: 's1', text: 'Some ', marks: [] },
        { _type: 'span', _key: 's2', text: 'word', marks: ['m1'] },
        { _type: 'span', _key: 's3', text: ' help', marks: ['h1'] },
      ],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(block)

    expect(preservedMarkDefs).toEqual([
      { _key: 'h1', _type: 'helpText', text: 'This is a hint' },
    ])

    const spans = doc.content[0].content
    // The helpText-marked span should NOT have any marks in TipTap
    expect(spans[2]).toEqual({ type: 'text', text: ' help' })
  })

  it('handles null input', () => {
    const { doc, preservedMarkDefs } = portableTextToTiptap(null)

    expect(doc.type).toBe('doc')
    expect(doc.content[0].type).toBe('paragraph')
    expect(doc.content[0].content[0].text).toBe('')
    expect(preservedMarkDefs).toEqual([])
  })

  it('handles undefined input', () => {
    const { doc, preservedMarkDefs } = portableTextToTiptap(undefined)

    expect(doc.type).toBe('doc')
    expect(doc.content[0].content[0].text).toBe('')
    expect(preservedMarkDefs).toEqual([])
  })

  it('handles empty children array', () => {
    const block = {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [],
      children: [],
    }

    const { doc, preservedMarkDefs } = portableTextToTiptap(block)

    expect(doc.content[0].content[0].text).toBe('')
    expect(preservedMarkDefs).toEqual([])
  })
})
