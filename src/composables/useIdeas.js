import { ref } from 'vue'
import { useSanityClient } from './useSanityClient.js'

const IDEAS_QUERY = `*[_type == "iddiotIdea"] | order(_createdAt desc) {
  _id,
  text,
  used
}`

export function useIdeas() {
  const { client } = useSanityClient()
  const ideas = ref([])
  const loading = ref(false)

  async function fetchIdeas() {
    loading.value = true
    try {
      ideas.value = await client.fetch(IDEAS_QUERY)
    } catch (e) {
      console.error('Failed to fetch ideas:', e)
    } finally {
      loading.value = false
    }
  }

  async function addIdea(text) {
    const doc = { _type: 'iddiotIdea', text, used: false }
    const result = await client.create(doc)
    ideas.value.unshift({ _id: result._id, text, used: false })
  }

  async function toggleUsed(id) {
    const idea = ideas.value.find(i => i._id === id)
    if (!idea) return
    const newUsed = !idea.used
    await client.patch(id).set({ used: newUsed }).commit()
    idea.used = newUsed
  }

  async function updateIdea(id, text) {
    await client.patch(id).set({ text }).commit()
    const idea = ideas.value.find(i => i._id === id)
    if (idea) idea.text = text
  }

  async function deleteIdea(id) {
    await client.delete(id)
    ideas.value = ideas.value.filter(i => i._id !== id)
  }

  return { ideas, loading, fetchIdeas, addIdea, toggleUsed, updateIdea, deleteIdea }
}
