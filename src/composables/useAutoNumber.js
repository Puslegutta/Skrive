export function findNextRoundNumber(rounds) {
  const numbers = rounds.map(r => r.roundNumber).filter(n => n != null)
  if (numbers.length === 0) return 1
  return Math.max(...numbers) + 1
}
