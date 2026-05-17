// ============================================================
// 基础扑克牌
// ============================================================
export interface Card {
  id: string              // 唯一标识，如 "H_A"
  suit: 'H' | 'D' | 'C' | 'S'  // 红心/方块/梅花/黑桃
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  value: number           // A=11, J/Q/K=10, 2-10 按面值
}

// ============================================================
// 牌型
// ============================================================
export type HandType =
  | 'HIGH_CARD'
  | 'PAIR'
  | 'TWO_PAIR'
  | 'THREE_OF_A_KIND'
  | 'STRAIGHT'
  | 'FLUSH'
  | 'FULL_HOUSE'
  | 'FOUR_OF_A_KIND'
  | 'STRAIGHT_FLUSH'
  | 'FLUSH_FIVE'

export const HAND_NAMES: Record<HandType, string> = {
  HIGH_CARD: '高牌',
  PAIR: '一对',
  TWO_PAIR: '两对',
  THREE_OF_A_KIND: '三条',
  STRAIGHT: '顺子',
  FLUSH: '同花',
  FULL_HOUSE: '葫芦',
  FOUR_OF_A_KIND: '四条',
  STRAIGHT_FLUSH: '同花顺',
  FLUSH_FIVE: '同花五条',
}

// ============================================================
// 牌型识别结果
// ============================================================
export interface HandResult {
  type: HandType
  baseChips: number
  baseMult: number
  scoringCards: Card[]    // 参与计分的牌（踢脚牌不加 chips）
  // flags 方便销售牌效果直接用，避免各自重判
  isFlush: boolean
  isStraight: boolean
  hasPair: boolean        // 含至少一对
  hasThreeOrMore: boolean // 含三条以上（三条/葫芦/四条/同花顺/同花五条）
}

// ============================================================
// 计分上下文（传给销售牌 effect 的参数）
// ============================================================
export interface ScoreContext {
  handType: HandType
  scoringCards: Card[]
  allCards: Card[]        // 本次出的全部牌
  discardsLeft: number    // 剩余弃牌次数（时间沙漏需要）
  money: number           // 当前金钱（节俭管家需要）
  targetScore: number     // 目标分（终焉之握需要）
  // 该牌型本关已出次数（超新星需要），key 为 HandType
  handPlayCounts: Record<string, number>
}

// ============================================================
// 销售牌效果返回值
// ============================================================
export interface SalesCardEffectResult {
  addChips?: number
  addMult?: number
  xMult?: number
}

export type SalesCardEffect = (ctx: ScoreContext) => SalesCardEffectResult

// ============================================================
// 销售牌定义
// ============================================================
export interface SalesCardDef {
  id: string
  name: string
  desc: string
  icon: string
  price: number
  sellValue: number       // Math.floor(price / 2)
  rarity: 'common' | 'rare'
  effect: SalesCardEffect
}

// ============================================================
// 计分明细（传给 ScoreDetail 组件）
// ============================================================
export interface ScoreDetail {
  handName: HandType
  chips: number
  mult: number
  xMult: number
  total: number
  triggeredIds: string[]  // 触发效果的销售牌 id 列表（用于高亮）
}

// ============================================================
// Game Phase
// ============================================================
export type GamePhase = 'playing' | 'shop' | 'lose'
