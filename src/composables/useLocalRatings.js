const STORAGE_KEY = 'skrive-ratings'

function loadRatings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getRating(roundId) {
  return loadRatings()[roundId] || 0
}

export function setRating(roundId, value) {
  const ratings = loadRatings()
  if (value > 0) {
    ratings[roundId] = value
  } else {
    delete ratings[roundId]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
}
