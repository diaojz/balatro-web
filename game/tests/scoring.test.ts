import { describe, it, expect } from 'vitest'
import type { Card, SalesCardDef } from '../src/types'
import { calcScore } from '../src/logic/calcScore'
import { SALES_CARDS } from '../src/logic/salesCards'

// 辅助：按 id 找销售牌
function card(id: string): SalesCardDef {
  const c = SALES_CARDS.find(s => s.id === id)
  if (!c) throw new Error(`Sales card not found: ${id}`)
  return c
}

// 辅助：构建扑克牌
function mk(suit: Card['suit'], rank: Card['rank']): Card {
  const vals: Record<string, number> = {
    A: 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, J: 10, Q: 10, K: 10,
  }
  return { id: `${suit}_${rank}`, suit, rank, value: vals[rank] }
}

const DEFAULT_CTX = {
  discardsLeft: 3,
  money: 4,
  targetScore: 300,
  handPlayCounts: {},
}

describe('计分管道三个验证例子', () => {

  /**
   * 例 1：一对 5（5♥ 5♦ 7♠ K♣ 3♥），装备怒火(+4 Mult) 和 雕琢(+30 Chips)
   * PRD 计算：
   *   chips = 10(对子基础) + 5+5(计分的两张5) = 20
   *   怒火(槽位0)：addMult=4 → mult = 2+4 = 6
   *   雕琢(槽位1)：addChips=30 → chips = 20+30 = 50
   *   最终 = Math.floor(50 × 6 × 1) = 300
   */
  it('例1: 一对5 + 怒火 + 雕琢 = 300', () => {
    const played = [
      mk('H', '5'),
      mk('D', '5'),
      mk('S', '7'),
      mk('C', 'K'),
      mk('H', '3'),
    ]
    const equipped: (SalesCardDef | null)[] = [
      card('rage'),   // 槽位0: 怒火 +4 Mult
      card('carve'),  // 槽位1: 雕琢 +30 Chips
      null, null, null,
    ]
    const result = calcScore(played, equipped, DEFAULT_CTX)
    expect(result.chips).toBe(50)
    expect(result.mult).toBe(6)
    expect(result.xMult).toBe(1)
    expect(result.total).toBe(300)
  })

  /**
   * 例 2：同花 5 张红桃（A♥ K♥ 7♥ 5♥ 3♥），装备色欲 + 玻璃工匠
   * PRD 计算：
   *   chips = 35(同花基础) + 11+10+7+5+3 = 71
   *   色欲(槽位0)：5张红桃 → addMult = 5×3 = 15 → mult = 4+15 = 19
   *   玻璃工匠(槽位1)：同花 → xMult=1.5 → xMultProduct = 1.5
   *   最终 = Math.floor(71 × 19 × 1.5) = Math.floor(2023.5) = 2023
   */
  it('例2: 同花红桃 + 色欲 + 玻璃工匠 = 2023', () => {
    const played = [
      mk('H', 'A'),
      mk('H', 'K'),
      mk('H', '7'),
      mk('H', '5'),
      mk('H', '3'),
    ]
    const equipped: (SalesCardDef | null)[] = [
      card('lust'),       // 槽位0: 色欲 +3 per 红桃
      card('glasssmith'), // 槽位1: 玻璃工匠 同花×1.5
      null, null, null,
    ]
    const result = calcScore(played, equipped, DEFAULT_CTX)
    expect(result.chips).toBe(71)
    expect(result.mult).toBe(19)
    expect(result.xMult).toBeCloseTo(1.5)
    expect(result.total).toBe(2023)
  })

  /**
   * 例 3：葫芦（K♥ K♦ K♣ 4♠ 4♥），装备怒火 + 三角洲 + 卡文迪什
   * PRD 计算：
   *   chips = 40(葫芦基础) + 10+10+10+4+4 = 78
   *   怒火(槽位0)：addMult=4 → mult = 4+4 = 8
   *   三角洲(槽位1)：葫芦 → xMult=2 → xMultProduct = 2
   *   卡文迪什(槽位2)：xMult=3 → xMultProduct = 6
   *   最终 = Math.floor(78 × 8 × 6) = 3744
   */
  it('例3: 葫芦 + 怒火 + 三角洲 + 卡文迪什 = 3744', () => {
    const played = [
      mk('H', 'K'),
      mk('D', 'K'),
      mk('C', 'K'),
      mk('S', '4'),
      mk('H', '4'),
    ]
    const equipped: (SalesCardDef | null)[] = [
      card('rage'),      // 槽位0: 怒火 +4 Mult
      card('delta'),     // 槽位1: 三角洲 葫芦×2
      card('cavendish'), // 槽位2: 卡文迪什 ×3
      null, null,
    ]
    const result = calcScore(played, equipped, DEFAULT_CTX)
    expect(result.chips).toBe(78)
    expect(result.mult).toBe(8)
    expect(result.xMult).toBe(6)
    expect(result.total).toBe(3744)
  })
})

describe('牌型识别补充测试', () => {
  it('高牌只有最高牌参与计分', () => {
    const played = [mk('H', 'A'), mk('D', '7'), mk('C', '3')]
    const result = calcScore(played, [null, null, null, null, null], DEFAULT_CTX)
    // 高牌 baseChips=5，只有 A(11) 参与
    expect(result.chips).toBe(5 + 11) // 16
    expect(result.handName).toBe('HIGH_CARD')
  })

  it('顺子 5 张全部参与计分', () => {
    const played = [mk('H', '5'), mk('D', '6'), mk('C', '7'), mk('S', '8'), mk('H', '9')]
    const result = calcScore(played, [null, null, null, null, null], DEFAULT_CTX)
    // 顺子 baseChips=30，5+6+7+8+9=35
    expect(result.chips).toBe(30 + 35) // 65
    expect(result.handName).toBe('STRAIGHT')
  })
})
