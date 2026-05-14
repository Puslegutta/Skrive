import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
const mockCreate = vi.fn()
const mockDelete = vi.fn()
const mockPatch = vi.fn(() => ({ set: vi.fn(() => ({ commit: vi.fn() })) }))

vi.mock('../../src/composables/useSanityClient.js', () => ({
  useSanityClient: () => ({
    client: { fetch: mockFetch, create: mockCreate, delete: mockDelete, patch: mockPatch },
  }),
}))

import { useRounds } from '../../src/composables/useRounds.js'

describe('useRounds', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchRounds returns rounds from Sanity', async () => {
    const mockRounds = [
      { _id: 'r1', roundNumber: 1, status: 'done', questions: [{}, {}] },
      { _id: 'r2', roundNumber: null, status: 'draft', questions: [{}] },
    ]
    mockFetch.mockResolvedValue(mockRounds)
    const { fetchRounds, rounds } = useRounds()
    await fetchRounds()
    expect(rounds.value).toEqual(mockRounds)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('iddiotRound'))
  })

  it('createRound creates a draft round', async () => {
    mockCreate.mockResolvedValue({ _id: 'new-id' })
    const { createRound } = useRounds()
    const id = await createRound()
    expect(id).toBe('new-id')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'iddiotRound', status: 'draft', questions: [] })
    )
  })

  it('deleteRound calls client.delete', async () => {
    mockDelete.mockResolvedValue(undefined)
    const { deleteRound } = useRounds()
    await deleteRound('r1')
    expect(mockDelete).toHaveBeenCalledWith('r1')
  })
})
