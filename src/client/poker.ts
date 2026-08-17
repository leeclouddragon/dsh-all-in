export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const

export type Suit = typeof SUITS[number]
export type Rank = typeof RANKS[number]

export interface Card {
  readonly rank: Rank
  readonly suit: Suit
}

export interface HandValue {
  readonly category: number
  readonly kickers: readonly number[]
  readonly label: string
}

const LABELS = [
  'High card', 'One pair', 'Two pair', 'Three of a kind', 'Straight',
  'Flush', 'Full house', 'Four of a kind', 'Straight flush',
] as const

export function createDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) for (const rank of RANKS) cards.push({ rank, suit })
  return cards
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const value = result[i]
    result[i] = result[j] as T
    result[j] = value as T
  }
  return result
}

function straightHigh(uniqueRanks: readonly number[]): number | undefined {
  const ranks = [...uniqueRanks]
  if (ranks.includes(14)) ranks.unshift(1)
  let run = 1
  for (let i = 1; i < ranks.length; i += 1) {
    if ((ranks[i] as number) === (ranks[i - 1] as number) + 1) run += 1
    else run = 1
    if (run >= 5) return ranks[i]
  }
  return undefined
}

export function evaluateFive(cards: readonly Card[]): HandValue {
  if (cards.length !== 5) throw new Error('evaluateFive requires exactly five cards')
  const ranks = cards.map(card => card.rank).sort((a, b) => b - a)
  const ascendingUnique = [...new Set(ranks)].sort((a, b) => a - b)
  const flush = cards.every(card => card.suit === cards[0]?.suit)
  const straight = straightHigh(ascendingUnique)

  const counts = new Map<number, number>()
  for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1)
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])

  let category: number
  let kickers: number[]
  if (flush && straight !== undefined) {
    category = 8
    kickers = [straight]
  } else if (groups[0]?.[1] === 4) {
    category = 7
    kickers = [groups[0][0], groups[1]?.[0] ?? 0]
  } else if (groups[0]?.[1] === 3 && groups[1]?.[1] === 2) {
    category = 6
    kickers = [groups[0][0], groups[1][0]]
  } else if (flush) {
    category = 5
    kickers = ranks
  } else if (straight !== undefined) {
    category = 4
    kickers = [straight]
  } else if (groups[0]?.[1] === 3) {
    category = 3
    kickers = [groups[0][0], ...groups.slice(1).map(group => group[0]).sort((a, b) => b - a)]
  } else if (groups[0]?.[1] === 2 && groups[1]?.[1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a)
    category = 2
    kickers = [...pairs, groups.find(group => group[1] === 1)?.[0] ?? 0]
  } else if (groups[0]?.[1] === 2) {
    category = 1
    kickers = [groups[0][0], ...groups.slice(1).map(group => group[0]).sort((a, b) => b - a)]
  } else {
    category = 0
    kickers = ranks
  }
  return { category, kickers, label: LABELS[category] as string }
}

export function compareValues(left: HandValue, right: HandValue): number {
  if (left.category !== right.category) return left.category - right.category
  const length = Math.max(left.kickers.length, right.kickers.length)
  for (let i = 0; i < length; i += 1) {
    const delta = (left.kickers[i] ?? 0) - (right.kickers[i] ?? 0)
    if (delta !== 0) return delta
  }
  return 0
}

export function evaluateBest(cards: readonly Card[]): HandValue {
  if (cards.length < 5 || cards.length > 7) throw new Error('evaluateBest requires five to seven cards')
  let best: HandValue | undefined
  for (let a = 0; a < cards.length - 4; a += 1) {
    for (let b = a + 1; b < cards.length - 3; b += 1) {
      for (let c = b + 1; c < cards.length - 2; c += 1) {
        for (let d = c + 1; d < cards.length - 1; d += 1) {
          for (let e = d + 1; e < cards.length; e += 1) {
            const value = evaluateFive([
              cards[a] as Card, cards[b] as Card, cards[c] as Card,
              cards[d] as Card, cards[e] as Card,
            ])
            if (best === undefined || compareValues(value, best) > 0) best = value
          }
        }
      }
    }
  }
  if (best === undefined) throw new Error('no five-card combination')
  return best
}

export function cardText(card: Card): string {
  const rank = card.rank === 14 ? 'A' : card.rank === 13 ? 'K' : card.rank === 12 ? 'Q' : card.rank === 11 ? 'J' : String(card.rank)
  const suit = card.suit === 'spades' ? '♠' : card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : '♣'
  return `${rank}${suit}`
}

export function isRed(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds'
}
