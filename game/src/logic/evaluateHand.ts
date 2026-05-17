import type { Card, HandResult, HandType } from '../types'

// 牌型基础值
const BASE_VALUES: Record<HandType, { chips: number; mult: number }> = {
  HIGH_CARD:       { chips: 5,   mult: 1  },
  PAIR:            { chips: 10,  mult: 2  },
  TWO_PAIR:        { chips: 20,  mult: 2  },
  THREE_OF_A_KIND: { chips: 30,  mult: 3  },
  STRAIGHT:        { chips: 30,  mult: 4  },
  FLUSH:           { chips: 35,  mult: 4  },
  FULL_HOUSE:      { chips: 40,  mult: 4  },
  FOUR_OF_A_KIND:  { chips: 60,  mult: 7  },
  STRAIGHT_FLUSH:  { chips: 100, mult: 8  },
  FLUSH_FIVE:      { chips: 120, mult: 14 },
}

// 将 rank 映射为数值，用于顺子判断（A 既可以做 1 也可以做 14）
function rankNum(rank: string): number {
  if (rank === 'A') return 14
  if (rank === 'K') return 13
  if (rank === 'Q') return 12
  if (rank === 'J') return 11
  return parseInt(rank)
}

// 判断一组牌是否构成顺子（支持 A-2-3-4-5 低顺子）
function isStraightCheck(cards: Card[]): boolean {
  if (cards.length < 5) return false
  const nums = cards.map(c => rankNum(c.rank)).sort((a, b) => a - b)
  // 普通顺子
  let ok = true
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] !== 1) { ok = false; break }
  }
  if (ok) return true
  // A-2-3-4-5 低顺子
  if (nums[nums.length - 1] === 14) {
    const low = [1, ...nums.slice(0, -1)]
    let lowOk = true
    for (let i = 1; i < low.length; i++) {
      if (low[i] - low[i - 1] !== 1) { lowOk = false; break }
    }
    return lowOk
  }
  return false
}

// 判断 HandType 是否 >= 三条（用于七星灯）
export function isThreeOrBetter(type: HandType): boolean {
  const order: HandType[] = [
    'HIGH_CARD', 'PAIR', 'TWO_PAIR', 'THREE_OF_A_KIND',
    'STRAIGHT', 'FLUSH', 'FULL_HOUSE', 'FOUR_OF_A_KIND',
    'STRAIGHT_FLUSH', 'FLUSH_FIVE',
  ]
  const idx = order.indexOf(type)
  return idx >= 3 // THREE_OF_A_KIND 及以上
}

/**
 * 识别牌型，返回 HandResult
 * 支持 1-5 张牌（Balatro 允许出 1-5 张）
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length === 0) {
    throw new Error('至少要出 1 张牌')
  }

  const n = cards.length

  // ---- 统计
  const rankCounts = new Map<string, number>()
  for (const c of cards) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) ?? 0) + 1)
  }
  const counts = [...rankCounts.values()].sort((a, b) => b - a)

  const allSameSuit = new Set(cards.map(c => c.suit)).size === 1
  const straight = n === 5 && isStraightCheck(cards)

  // ---- 判断牌型（5 张满手）
  let type: HandType

  if (n === 5 && allSameSuit && counts[0] === 5) {
    type = 'FLUSH_FIVE'
  } else if (n === 5 && allSameSuit && straight) {
    type = 'STRAIGHT_FLUSH'
  } else if (counts[0] === 4) {
    type = 'FOUR_OF_A_KIND'
  } else if (counts[0] === 3 && counts[1] === 2) {
    type = 'FULL_HOUSE'
  } else if (n === 5 && allSameSuit) {
    type = 'FLUSH'
  } else if (n === 5 && straight) {
    type = 'STRAIGHT'
  } else if (counts[0] === 3) {
    type = 'THREE_OF_A_KIND'
  } else if (counts[0] === 2 && counts[1] === 2) {
    type = 'TWO_PAIR'
  } else if (counts[0] === 2) {
    type = 'PAIR'
  } else {
    type = 'HIGH_CARD'
  }

  // ---- 计分牌（scoringCards）
  // 规则：参与牌型的牌才加 chips，踢脚牌不加
  let scoringCards: Card[]

  switch (type) {
    case 'FLUSH_FIVE':
    case 'STRAIGHT_FLUSH':
    case 'FLUSH':
    case 'STRAIGHT':
    case 'FULL_HOUSE':
      // 5 张全部参与
      scoringCards = [...cards]
      break
    case 'FOUR_OF_A_KIND': {
      // 找四条的那个 rank
      const fourRank = [...rankCounts.entries()].find(([, v]) => v === 4)![0]
      scoringCards = cards.filter(c => c.rank === fourRank)
      break
    }
    case 'THREE_OF_A_KIND': {
      const threeRank = [...rankCounts.entries()].find(([, v]) => v === 3)![0]
      scoringCards = cards.filter(c => c.rank === threeRank)
      break
    }
    case 'TWO_PAIR': {
      const pairRanks = [...rankCounts.entries()].filter(([, v]) => v === 2).map(([k]) => k)
      scoringCards = cards.filter(c => pairRanks.includes(c.rank))
      break
    }
    case 'PAIR': {
      const pairRank = [...rankCounts.entries()].find(([, v]) => v === 2)![0]
      scoringCards = cards.filter(c => c.rank === pairRank)
      break
    }
    case 'HIGH_CARD':
    default: {
      // 只有最高牌参与
      const sorted = [...cards].sort((a, b) => rankNum(b.rank) - rankNum(a.rank))
      scoringCards = [sorted[0]]
      break
    }
  }

  const { chips, mult } = BASE_VALUES[type]

  return {
    type,
    baseChips: chips,
    baseMult: mult,
    scoringCards,
    isFlush: allSameSuit,
    isStraight: straight,
    hasPair: counts[0] >= 2,
    hasThreeOrMore: counts[0] >= 3,
  }
}
