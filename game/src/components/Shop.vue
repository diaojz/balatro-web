<template>
  <div class="shop-overlay">
    <div class="shop-box">
      <h2 class="shop-title">商店</h2>
      <p class="shop-money">
        钱包：<span class="money-num">${{ sales.money }}</span>
      </p>

      <!-- 商店牌货架 -->
      <div class="shop-shelf">
        <div
          v-for="shopCard in sales.shopPool"
          :key="shopCard.id"
          class="shop-item"
        >
          <SalesCard :card="shopCard" :showPrice="true" @click="handleBuy" />
          <button
            class="btn btn-gold btn-buy"
            :disabled="sales.money < shopCard.price || sales.slotsFull"
            @click="handleBuy(shopCard)"
          >
            ${{ shopCard.price }} 购买
          </button>
          <div v-if="sales.slotsFull" class="slot-full-hint">槽位已满</div>
        </div>
        <div v-if="sales.shopPool.length === 0" class="shop-empty">
          商品已售罄
        </div>
      </div>

      <!-- 操作区 -->
      <div class="shop-actions">
        <button
          class="btn btn-gray"
          :disabled="sales.money < 5"
          @click="handleReroll"
        >
          刷新商店 $5
        </button>
        <button class="btn btn-orange btn-continue" @click="handleContinue">
          继续出发
        </button>
      </div>

      <!-- 已装备的销售牌预览 -->
      <div class="equipped-preview">
        <div class="equipped-label">已装备（{{ equippedCount }}/5）</div>
        <div class="equipped-slots">
          <div
            v-for="(slot, idx) in sales.slots"
            :key="idx"
            class="equipped-slot-mini"
            :class="{ 'has-card': slot !== null }"
          >
            <template v-if="slot">
              <span class="mini-icon">{{ slot.icon }}</span>
              <span class="mini-name">{{ slot.name }}</span>
            </template>
            <template v-else>
              <span class="mini-empty">—</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSalesStore } from '../stores/salesStore'
import { useGameStore } from '../stores/gameStore'
import type { SalesCardDef } from '../types'
import SalesCard from './SalesCard.vue'

const sales = useSalesStore()
const game = useGameStore()

const equippedCount = computed(() =>
  sales.slots.filter(s => s !== null).length
)

onMounted(() => {
  sales.refreshShop()
})

function handleBuy(card: SalesCardDef) {
  if (sales.money < card.price || sales.slotsFull) return
  sales.buy(card)
}

function handleReroll() {
  sales.reroll()
}

function handleContinue() {
  game.continueToNextRound()
}
</script>

<style scoped>
.shop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.shop-box {
  background: #1e1e30;
  border: 2px solid #e8682a;
  border-radius: 16px;
  padding: 28px 32px;
  min-width: 480px;
  max-width: 680px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shop-title {
  font-size: 24px;
  font-weight: 800;
  color: #e8682a;
  text-align: center;
  margin: 0;
}

.shop-money {
  text-align: center;
  font-size: 16px;
  color: #aaa;
}

.money-num {
  color: #d4a017;
  font-weight: 800;
  font-size: 20px;
}

.shop-shelf {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 80px;
}

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.btn-buy {
  font-size: 13px;
  padding: 6px 14px;
}

.slot-full-hint {
  font-size: 11px;
  color: #f97316;
}

.shop-empty {
  color: #666;
  align-self: center;
  font-size: 14px;
}

.shop-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-continue {
  padding: 10px 28px;
  font-size: 15px;
}

/* 已装备预览 */
.equipped-preview {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 12px;
}

.equipped-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  text-align: center;
}

.equipped-slots {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.equipped-slot-mini {
  width: 72px;
  height: 64px;
  border-radius: 8px;
  border: 1px dashed rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.equipped-slot-mini.has-card {
  border-color: rgba(255,255,255,0.3);
  background: rgba(0,0,0,0.35);
}

.mini-icon  { font-size: 18px; }
.mini-name  { font-size: 10px; color: #ccc; text-align: center; word-break: break-all; }
.mini-empty { font-size: 16px; color: rgba(255,255,255,0.15); }
</style>
