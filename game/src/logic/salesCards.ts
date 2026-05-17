import type { SalesCardDef, SalesCardEffectResult, ScoreContext } from '../types'
import { isThreeOrBetter } from './evaluateHand'

// ============================================================
// 工具函数
// ============================================================
function isFlushType(type: string): boolean {
  return type === 'FLUSH' || type === 'STRAIGHT_FLUSH' || type === 'FLUSH_FIVE'
}

// ============================================================
// 20 张销售牌完整定义
// 效果函数：pure function，不修改 ctx，只返回增量
// ============================================================
export const SALES_CARDS: SalesCardDef[] = [
  {
    id: 'carve',
    name: '雕琢',
    desc: '每次出牌恒定 +30 Chips',
    icon: '⚒️',
    price: 4,
    sellValue: 2,
    rarity: 'common',
    effect: (): SalesCardEffectResult => ({ addChips: 30 }),
  },
  {
    id: 'rage',
    name: '怒火',
    desc: '每次出牌恒定 +4 Mult',
    icon: '😤',
    price: 4,
    sellValue: 2,
    rarity: 'common',
    effect: (): SalesCardEffectResult => ({ addMult: 4 }),
  },
  {
    id: 'greed',
    name: '贪婪',
    desc: '出牌含方块，每张 +3 Mult',
    icon: '💎',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: ctx.allCards.filter(c => c.suit === 'D').length * 3,
    }),
  },
  {
    id: 'lust',
    name: '色欲',
    desc: '出牌含红桃，每张 +3 Mult',
    icon: '♥️',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: ctx.allCards.filter(c => c.suit === 'H').length * 3,
    }),
  },
  {
    id: 'gluttony',
    name: '暴食',
    desc: '出牌含梅花，每张 +3 Mult',
    icon: '♣️',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: ctx.allCards.filter(c => c.suit === 'C').length * 3,
    }),
  },
  {
    id: 'envy',
    name: '嫉妒',
    desc: '出牌含黑桃，每张 +3 Mult',
    icon: '♠️',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: ctx.allCards.filter(c => c.suit === 'S').length * 3,
    }),
  },
  {
    id: 'halfmoon',
    name: '半月',
    desc: '只打 1 张牌时 +20 Mult',
    icon: '🌙',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      ctx.allCards.length === 1 ? { addMult: 20 } : {},
  },
  {
    id: 'cavendish',
    name: '卡文迪什',
    desc: '×3 Mult；每局结算后 1/100 概率永久销毁',
    icon: '🃏',
    price: 8,
    sellValue: 4,
    rarity: 'rare',
    effect: (): SalesCardEffectResult => ({ xMult: 3 }),
  },
  {
    id: 'supernova',
    name: '超新星',
    desc: '该牌型本关已出次数 +Mult（上限 +8）',
    icon: '💫',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: Math.min(ctx.handPlayCounts[ctx.handType] ?? 0, 8),
    }),
  },
  {
    id: 'piano',
    name: '钢琴',
    desc: '打出对子时 +8 Mult',
    icon: '🎹',
    price: 4,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      ctx.handType === 'PAIR' ? { addMult: 8 } : {},
  },
  {
    id: 'spade_knight',
    name: '黑桃骑士',
    desc: '出牌每含 1 张黑桃 +30 Chips',
    icon: '⚔️',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addChips: ctx.allCards.filter(c => c.suit === 'S').length * 30,
    }),
  },
  {
    id: 'heart_queen',
    name: '红心皇后',
    desc: '出牌每含 1 张红桃 +30 Chips',
    icon: '👑',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addChips: ctx.allCards.filter(c => c.suit === 'H').length * 30,
    }),
  },
  {
    id: 'glasssmith',
    name: '玻璃工匠',
    desc: '打出同花时 ×1.5 Mult',
    icon: '🔮',
    price: 8,
    sellValue: 4,
    rarity: 'rare',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      isFlushType(ctx.handType) ? { xMult: 1.5 } : {},
  },
  {
    id: 'hourglass',
    name: '时间沙漏',
    desc: '剩余弃牌次数每张 +5 Mult',
    icon: '⏳',
    price: 5,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: ctx.discardsLeft * 5,
    }),
  },
  {
    id: 'frugal',
    name: '节俭管家',
    desc: '当前金钱每 $1 贡献 +0.5 Mult（向下取整）',
    icon: '💰',
    price: 4,
    sellValue: 2,
    rarity: 'common',
    effect: (ctx: ScoreContext): SalesCardEffectResult => ({
      addMult: Math.floor(ctx.money * 0.5),
    }),
  },
  {
    id: 'delta',
    name: '三角洲',
    desc: '打出葫芦时 ×2 Mult',
    icon: '🔺',
    price: 8,
    sellValue: 4,
    rarity: 'rare',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      ctx.handType === 'FULL_HOUSE' ? { xMult: 2 } : {},
  },
  {
    id: 'sevenstar',
    name: '七星灯',
    desc: '牌型 ≥ 三条时 +50 Chips',
    icon: '✨',
    price: 7,
    sellValue: 3,
    rarity: 'rare',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      isThreeOrBetter(ctx.handType) ? { addChips: 50 } : {},
  },
  {
    id: 'mirror',
    name: '镜中花',
    desc: '所有已装备的 +Mult 销售牌效果各再 +1',
    icon: '🪞',
    price: 6,
    sellValue: 3,
    rarity: 'common',
    // 注意：镜中花的具体逻辑在 calcScore 中特殊处理
    // 这里的 effect 留给 calcScore 调用时传入已经统计好的 N
    effect: (): SalesCardEffectResult => ({}),
  },
  {
    id: 'moonbox',
    name: '月光宝盒',
    desc: '打出顺子时 +100 Chips',
    icon: '📦',
    price: 9,
    sellValue: 4,
    rarity: 'rare',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      ctx.handType === 'STRAIGHT' ? { addChips: 100 } : {},
  },
  {
    id: 'final_grip',
    name: '终焉之握',
    desc: '目标分 ≥ 1000 时 ×2 Mult',
    icon: '🌑',
    price: 10,
    sellValue: 5,
    rarity: 'rare',
    effect: (ctx: ScoreContext): SalesCardEffectResult =>
      ctx.targetScore >= 1000 ? { xMult: 2 } : {},
  },
]

// ============================================================
// 商店抽卡：80% Common / 20% Rare 显式分层
// ============================================================
const COMMON_POOL = SALES_CARDS.filter(c => c.rarity === 'common')
const RARE_POOL   = SALES_CARDS.filter(c => c.rarity === 'rare')

export function drawShopCards(
  equippedIds: Set<string>,
  count = 3,
): SalesCardDef[] {
  const result: SalesCardDef[] = []
  const usedIds = new Set(equippedIds)

  for (let i = 0; i < count; i++) {
    const isRare = Math.random() < 0.2
    const pool = (isRare ? RARE_POOL : COMMON_POOL).filter(c => !usedIds.has(c.id))
    // 如果该档位空了就换另一档
    const fallback = (isRare ? COMMON_POOL : RARE_POOL).filter(c => !usedIds.has(c.id))
    const candidates = pool.length > 0 ? pool : fallback
    if (candidates.length === 0) break

    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    result.push(picked)
    usedIds.add(picked.id) // 同一批商店不重复
  }

  return result
}
