import { describe, it, expect } from 'vitest'
import { findNextRoundNumber } from '../../src/composables/useAutoNumber.js'

describe('findNextRoundNumber', () => {
  it('returns 1 when no rounds exist', () => {
    expect(findNextRoundNumber([])).toBe(1)
  })
  it('returns next number after highest', () => {
    expect(findNextRoundNumber([{ roundNumber: 1 }, { roundNumber: 3 }, { roundNumber: 5 }])).toBe(6)
  })
  it('ignores rounds without roundNumber', () => {
    expect(findNextRoundNumber([{ roundNumber: 1 }, { roundNumber: null }, { roundNumber: 3 }])).toBe(4)
  })
})
