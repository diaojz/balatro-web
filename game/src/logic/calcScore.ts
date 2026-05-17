import type { Card, SalesCardDef, ScoreContext, ScoreDetail } from '../types'
import { evaluateHand } from './evaluateHand'

/**
 * 计分管道（严格按 PRD 顺序）：
 * 1. 牌型基础值：baseChips, baseMult
 * 2. 计分牌加 chips：scoringCards.value 累加
 * 3. 销售牌加成（左到右槽位顺序）：addChips 加 chips，addMult 加 mult，xMult 累乘
 * 4. 最终：Math.floor(chips × mult × xMultProduct)
 *
 * 镜中花特殊处理：计分前先统计其他已装备的能产生 addMult 的销售牌数量 N，
 * 在触发镜中花时 addMult = N。
 */
export function calcScore(
  playedCards: Card[],
  equippedSalesCards: (SalesCardDef | null)[],
  extraCtx: {
    discardsLeft: number
    money: number
    targetScore: number
    handPlayCounts: Record<string, number>
  },
): ScoreDetail {
  const handResult = evaluateHand(playedCards)

  // 初始化
  let chips = handResult.baseChips + handResult.scoringCards.reduce((sum, c) => sum + c.value, 0)
  let mult = handResult.baseMult
  let xMultProduct = 1

  const ctx: ScoreContext = {
    handType: handResult.type,
    scoringCards: handResult.scoringCards,
    allCards: playedCards,
    discardsLeft: extraCtx.discardsLeft,
    money: extraCtx.money,
    targetScore: extraCtx.targetScore,
    handPlayCounts: extraCtx.handPlayCounts,
  }

  // 计算镜中花需要的 N（先扫一遍：有多少其他销售牌会产生 addMult）
  const activeSales = equippedSalesCards.filter((s): s is SalesCardDef => s !== null)
  const mirrorCard = activeSales.find(s => s.id === 'mirror')

  let mirrorN = 0
  if (mirrorCard) {
    // 统计除镜中花本身外，会产生 addMult 的销售牌数量
    for (const card of activeSales) {
      if (card.id === 'mirror') continue
      const result = card.effect(ctx)
      if (result.addMult !== undefined && result.addMult > 0) {
        mirrorN++
      }
    }
  }

  const triggeredIds: string[] = []

  // 按槽位顺序触发
  for (const card of activeSales) {
    let result = card.effect(ctx)

    // 镜中花：覆盖 effect 返回值
    if (card.id === 'mirror') {
      result = { addMult: mirrorN }
    }

    if (result.addChips) chips += result.addChips
    if (result.addMult) mult += result.addMult
    if (result.xMult) xMultProduct *= result.xMult

    // 只有真正产生了效果才算触发（用于高亮）
    const hasEffect =
      (result.addChips !== undefined && result.addChips !== 0) ||
      (result.addMult !== undefined && result.addMult !== 0) ||
      (result.xMult !== undefined && result.xMult !== 1)
    if (hasEffect) triggeredIds.push(card.id)
  }

  const total = Math.floor(chips * mult * xMultProduct)

  return {
    handName: handResult.type,
    chips,
    mult,
    xMult: xMultProduct,
    total,
    triggeredIds,
  }
}
