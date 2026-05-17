import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GamePhase, ScoreDetail } from '../types'
import { createDeck, shuffle, deal } from '../logic/deck'
import { calcScore } from '../logic/calcScore'
import { useSalesStore } from './salesStore'

// 初始关卡参数
const INIT_TARGET = 300
const HANDS_PER_ROUND = 4
const DISCARDS_PER_ROUND = 3
const HAND_SIZE = 8
const WIN_MONEY = 5

export const useGameStore = defineStore('game', () => {
  const salesStore = useSalesStore()

  // ---- 状态
  const phase = ref<GamePhase>('playing')
  const deck = ref<Card[]>([])
  const hand = ref<Card[]>([])
  const selectedIds = ref<Set<string>>(new Set())
  const handsLeft = ref(HANDS_PER_ROUND)
  const discardsLeft = ref(DISCARDS_PER_ROUND)
  const score = ref(0)
  const targetScore = ref(INIT_TARGET)
  const round = ref(1)
  // 本关各牌型出牌次数（用于超新星）
  const handPlayCounts = ref<Record<string, number>>({})
  // 上一次出牌的计分详情（用于 ScoreDetail 展示）
  const lastScoreDetail = ref<ScoreDetail | null>(null)
  // 卡文迪什消失标志
  const cavendishDestroyedMsg = ref<string | null>(null)

  // ---- 计算属性
  const selectedCards = computed<Card[]>(() =>
    hand.value.filter(c => selectedIds.value.has(c.id))
  )

  const canPlay = computed(() =>
    selectedIds.value.size >= 1 && selectedIds.value.size <= 5 && handsLeft.value > 0
  )

  const canDiscard = computed(() =>
    selectedIds.value.size >= 1 && discardsLeft.value > 0
  )

  // ---- 初始化/重置
  function init() {
    salesStore.init()
    _startRound(INIT_TARGET, 1)
  }

  function _startRound(target: number, roundNum: number) {
    phase.value = 'playing'
    targetScore.value = target
    round.value = roundNum
    score.value = 0
    handsLeft.value = HANDS_PER_ROUND
    discardsLeft.value = DISCARDS_PER_ROUND
    handPlayCounts.value = {}
    lastScoreDetail.value = null
    cavendishDestroyedMsg.value = null
    selectedIds.value = new Set()

    const freshDeck = shuffle(createDeck())
    const { drawn, remaining } = deal(freshDeck, HAND_SIZE)
    hand.value = drawn
    deck.value = remaining
  }

  // ---- 切换选中
  function toggleSelect(cardId: string) {
    if (phase.value !== 'playing') return
    const next = new Set(selectedIds.value)
    if (next.has(cardId)) {
      next.delete(cardId)
    } else if (next.size < 5) {
      next.add(cardId)
    }
    selectedIds.value = next
  }

  // ---- 出牌
  function playHand() {
    if (!canPlay.value) return

    const played = selectedCards.value
    const detail = calcScore(played, salesStore.slots, {
      discardsLeft: discardsLeft.value,
      money: salesStore.money,
      targetScore: targetScore.value,
      handPlayCounts: handPlayCounts.value,
    })

    lastScoreDetail.value = detail
    score.value += detail.total

    // 更新本关出牌次数（超新星用）
    const ht = detail.handName
    handPlayCounts.value = {
      ...handPlayCounts.value,
      [ht]: (handPlayCounts.value[ht] ?? 0) + 1,
    }

    handsLeft.value--

    // 卡文迪什 1/100 概率消失
    _checkCavendish()

    // 补牌（把出去的牌替换回来）
    _refillHand(played)

    selectedIds.value = new Set()

    // 判断胜负
    if (score.value >= targetScore.value) {
      salesStore.earnMoney(WIN_MONEY)
      phase.value = 'shop'
    } else if (handsLeft.value === 0) {
      phase.value = 'lose'
    }
  }

  // ---- 弃牌
  function discardHand() {
    if (!canDiscard.value) return
    const discarded = selectedCards.value
    _refillHand(discarded)
    discardsLeft.value--
    selectedIds.value = new Set()
  }

  // ---- 补牌：把打出/弃掉的牌从牌堆补充到手牌
  function _refillHand(removedCards: Card[]) {
    const removedIds = new Set(removedCards.map(c => c.id))
    const remaining = hand.value.filter(c => !removedIds.has(c.id))
    const needed = HAND_SIZE - remaining.length

    // 牌堆不够时重新洗牌
    let currentDeck = deck.value
    if (currentDeck.length < needed) {
      const usedIds = new Set([...remaining.map(c => c.id)])
      currentDeck = shuffle(createDeck().filter(c => !usedIds.has(c.id)))
    }

    const { drawn, remaining: newDeck } = deal(currentDeck, needed)
    hand.value = [...remaining, ...drawn]
    deck.value = newDeck
  }

  // ---- 卡文迪什消失检查（消失不给钱，只移除槽位）
  function _checkCavendish() {
    const idx = salesStore.slots.findIndex(s => s?.id === 'cavendish')
    if (idx === -1) return
    if (Math.random() < 0.01) {
      // 直接置空槽位，不给钱（消失 ≠ 卖出）
      salesStore.removeSlot(idx)
      cavendishDestroyedMsg.value = '卡文迪什消失了！（1/100 概率触发）'
    }
  }

  // ---- 进入商店（已在 playHand 里自动切换，这里供外部调用）
  function enterShop() {
    if (phase.value !== 'playing') return
    phase.value = 'shop'
  }

  // ---- 离开商店，进入下一局
  function continueToNextRound() {
    const nextTarget = Math.floor(targetScore.value * 1.5)
    const nextRound = round.value + 1
    _startRound(nextTarget, nextRound)
  }

  // ---- 失败后重开（完全重置）
  function restart() {
    salesStore.reset()
    salesStore.setMoney(4)
    _startRound(INIT_TARGET, 1)
  }

  return {
    phase,
    deck,
    hand,
    selectedIds,
    selectedCards,
    handsLeft,
    discardsLeft,
    score,
    targetScore,
    round,
    handPlayCounts,
    lastScoreDetail,
    cavendishDestroyedMsg,
    canPlay,
    canDiscard,
    init,
    toggleSelect,
    playHand,
    discardHand,
    enterShop,
    continueToNextRound,
    restart,
  }
})
