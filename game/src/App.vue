<template>
  <div class="game-viewport">
    <!-- HUD 顶栏 -->
    <Hud />

    <!-- 主游戏区 -->
    <div class="game-main">
      <!-- 左侧：销售牌装备区 -->
      <div class="sales-panel">
        <div class="panel-label">销售牌</div>
        <div class="sales-slots-grid">
          <SalesSlot
            v-for="(slot, idx) in sales.slots"
            :key="idx"
            :card="slot"
            :slotIndex="idx"
            :isTriggered="lastTriggeredIds.includes(slot?.id ?? '')"
            @sell="onSellSlot"
          />
        </div>
      </div>

      <!-- 中间：桌面区 + 手牌区 -->
      <div class="center-panel">
        <!-- 计分展示 -->
        <div class="score-area">
          <ScoreDetail :detail="game.lastScoreDetail" />
          <div v-if="game.cavendishDestroyedMsg" class="cavendish-msg">
            {{ game.cavendishDestroyedMsg }}
          </div>
        </div>

        <!-- 桌面槽位（显示本次打出的牌） -->
        <div class="table-area">
          <TableSlot :cards="tableCards" :maxSlots="5" />
        </div>

        <!-- 手牌区 -->
        <div class="hand-area">
          <div class="hand-cards">
            <HandCard
              v-for="card in game.hand"
              :key="card.id"
              :card="card"
              :isSelected="game.selectedIds.has(card.id)"
              @toggle="game.toggleSelect"
            />
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="action-btns">
          <button
            class="btn btn-orange btn-play"
            :disabled="!game.canPlay"
            @click="onPlay"
          >
            出牌 ({{ game.selectedIds.size }})
          </button>
          <button
            class="btn btn-gray btn-discard"
            :disabled="!game.canDiscard"
            @click="onDiscard"
          >
            弃牌 ({{ game.selectedIds.size }})
          </button>
        </div>
      </div>
    </div>

    <!-- 商店遮罩 -->
    <Shop v-if="game.phase === 'shop'" />

    <!-- 失败遮罩 -->
    <GameOver v-if="game.phase === 'lose'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useSalesStore } from './stores/salesStore'
import type { Card } from './types'
import Hud from './components/Hud.vue'
import HandCard from './components/HandCard.vue'
import TableSlot from './components/TableSlot.vue'
import SalesSlot from './components/SalesSlot.vue'
import ScoreDetail from './components/ScoreDetail.vue'
import Shop from './components/Shop.vue'
import GameOver from './components/GameOver.vue'

const game = useGameStore()
const sales = useSalesStore()

// 桌面上显示的牌（最近一次打出的牌）
const tableCards = ref<Card[]>([])
// 最近触发效果的销售牌 id 列表
const lastTriggeredIds = ref<string[]>([])

onMounted(() => {
  game.init()
})

function onPlay() {
  if (!game.canPlay) return
  // 记录打出的牌用于桌面显示
  tableCards.value = [...game.selectedCards]
  game.playHand()
  // 更新触发高亮
  lastTriggeredIds.value = game.lastScoreDetail?.triggeredIds ?? []
  // 1.5s 后清除桌面显示
  setTimeout(() => {
    tableCards.value = []
    lastTriggeredIds.value = []
  }, 1500)
}

function onDiscard() {
  if (!game.canDiscard) return
  game.discardHand()
}

function onSellSlot(slotIdx: number) {
  sales.sell(slotIdx)
}
</script>

<style scoped>
.game-viewport {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.game-main {
  display: flex;
  flex: 1;
  gap: 0;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

/* 左侧销售牌面板 */
.sales-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-align: center;
  padding: 4px 0;
}

.sales-slots-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  justify-items: center;
}

/* 中间主区域 */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  min-height: 0;
}

/* 计分展示区 */
.score-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.cavendish-msg {
  font-size: 13px;
  color: #f97316;
  animation: fadeInOut 2s ease-out forwards;
}

@keyframes fadeInOut {
  0%   { opacity: 0; transform: translateY(-4px); }
  20%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}

/* 桌面区（打出的牌） */
.table-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  background: rgba(0,0,0,0.15);
  border-radius: 12px;
  padding: 12px 24px;
  width: 100%;
}

/* 手牌区 */
.hand-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
}

.hand-cards {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  padding: 8px 0;
}

/* 操作按钮区 */
.action-btns {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.btn-play {
  padding: 12px 32px;
  font-size: 16px;
  min-width: 120px;
}

.btn-discard {
  padding: 12px 28px;
  font-size: 16px;
  min-width: 120px;
}
</style>
