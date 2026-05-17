import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SalesCardDef } from '../types'
import { drawShopCards } from '../logic/salesCards'

export const useSalesStore = defineStore('sales', () => {
  // 5 个装备槽，null 表示空
  const slots = ref<(SalesCardDef | null)[]>([null, null, null, null, null])
  const shopPool = ref<SalesCardDef[]>([])
  const money = ref(0)

  // 已装备的销售牌 id 集合
  const equippedIds = computed<Set<string>>(() =>
    new Set(slots.value.filter((s): s is SalesCardDef => s !== null).map(s => s.id))
  )

  // 槽位是否已满
  const slotsFull = computed(() => slots.value.every(s => s !== null))

  // 刷新商店（抽 3 张）
  function refreshShop() {
    shopPool.value = drawShopCards(equippedIds.value, 3)
  }

  // 购买销售牌
  function buy(card: SalesCardDef): boolean {
    if (money.value < card.price) return false
    const emptyIdx = slots.value.findIndex(s => s === null)
    if (emptyIdx === -1) return false
    slots.value[emptyIdx] = card
    money.value -= card.price
    // 从商店移除
    shopPool.value = shopPool.value.filter(c => c.id !== card.id)
    return true
  }

  // 卖出（半价回收）
  function sell(slotIdx: number): boolean {
    const card = slots.value[slotIdx]
    if (!card) return false
    money.value += card.sellValue
    slots.value[slotIdx] = null
    return true
  }

  // Reroll 商店
  function reroll(): boolean {
    if (money.value < 5) return false
    money.value -= 5
    refreshShop()
    return true
  }

  // 获得金钱（赢关奖励）
  function earnMoney(amount: number) {
    money.value += amount
  }

  // 重置（游戏失败重开）
  function reset() {
    slots.value = [null, null, null, null, null]
    shopPool.value = []
    money.value = 0
  }

  // 设置金钱（供 gameStore.restart 调用）
  function setMoney(amount: number) {
    money.value = amount
  }

  // 强制清空某个槽位（不给钱，用于卡文迪什消失）
  function removeSlot(idx: number) {
    if (idx >= 0 && idx < slots.value.length) {
      slots.value[idx] = null
    }
  }

  // 初始化（开局给初始金钱）
  function init() {
    reset()
    money.value = 4
  }

  return {
    slots,
    shopPool,
    money,
    equippedIds,
    slotsFull,
    refreshShop,
    buy,
    sell,
    reroll,
    earnMoney,
    setMoney,
    removeSlot,
    reset,
    init,
  }
})
