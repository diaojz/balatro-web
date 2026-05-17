import type { Card } from '../types'

const SUITS = ['H', 'D', 'C', 'S'] as const
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

// 牌面点数
function rankValue(rank: string): number {
  if (rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(rank)) return 10
  return parseInt(rank)
}

// 创建一副标准 52 张牌
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank: rank as Card['rank'],
        value: rankValue(rank),
      })
    }
  }
  return deck
}

// Fisher-Yates 洗牌（原地修改）
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 从牌堆顶取 n 张
export function deal(deck: Card[], n: number): { drawn: Card[]; remaining: Card[] } {
  const drawn = deck.slice(0, n)
  const remaining = deck.slice(n)
  return { drawn, remaining }
}
