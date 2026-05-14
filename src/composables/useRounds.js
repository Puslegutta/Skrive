import { ref } from 'vue'
import { useSanityClient } from './useSanityClient.js'

const ROUNDS_QUERY = `*[_type == "iddiotRound"] | order(roundNumber asc) {
  _id,
  roundNumber,
  status,
  cardPitch,
  note,
  "questionCount": count(questions),
  "firstQuestion": questions[0].question,
  questions[] {
    _key,
    question,
    answer,
    options,
    transitionIn,
    transitionOut,
    extraInfo,
    imageNote,
    "extraImage": extraImage.asset->url
  }
}`

export function useRounds() {
  const { client } = useSanityClient()
  const rounds = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchRounds() {
    loading.value = true
    error.value = null
    try {
      rounds.value = await client.fetch(ROUNDS_QUERY)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
    return rounds
  }

  async function createRound() {
    const doc = {
      _type: 'iddiotRound',
      status: 'draft',
      questions: [],
    }
    const result = await client.create(doc)
    return result._id
  }

  async function saveRound(id, data) {
    const existing = await client.fetch(`*[_id == $id][0]`, { id })
    const patchData = {}
    for (const key of ['status', 'roundNumber', 'cardPitch', 'note']) {
      if (data[key] !== undefined && data[key] !== existing?.[key]) {
        patchData[key] = data[key]
      }
    }
    if (data.questions) {
      patchData.questions = data.questions.map(q => {
        const existingQ = existing?.questions?.find(eq => eq._key === q._key)
        if (!existingQ) return q
        return { ...existingQ, ...q }
      })
    }
    if (Object.keys(patchData).length > 0) {
      await client.patch(id).set(patchData).commit()
    }
  }

  async function deleteRound(id) {
    await client.delete(id)
  }

  return { rounds, loading, error, fetchRounds, createRound, saveRound, deleteRound }
}
