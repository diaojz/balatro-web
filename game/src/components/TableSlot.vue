<template>
  <div class="table-slots-row">
    <div
      v-for="(card, idx) in displayCards"
      :key="idx"
      class="table-slot"
      :class="{ 'table-slot--occupied': card !== null }"
    >
      <div v-if="card" class="table-card" :class="`suit-${card.suit}`">
        <div class="tc-rank">{{ card.rank }}</div>
        <div class="tc-suit">{{ SUIT_SYMBOLS[card.suit] }}</div>
      </div>
      <div v-else class="table-slot-empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '../types'

const props = defineProps<{
  cards: Card[]  // 当前桌面上显示的牌（可为空数组）
  maxSlots?: number
}>()

const MAX = computed(() => props.maxSlots ?? 5)

const displayCards = computed<(Card | null)[]>(() => {
  const result: (Card | null)[] = [...props.cards.slice(0, MAX.value)]
  while (result.length < MAX.value) result.push(null)
  return result
})

const SUIT_SYMBOLS: Record<string, string> = {
  H: '♥', D: '♦', C: '♣', S: '♠',
}
</script>

<style scoped>
.table-slots-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.table-slot {
  width: 60px;
  height: 84px;
  border-radius: 6px;
  border: 2px dashed rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-slot--occupied {
  border-color: rgba(255,255,255,0.3);
  background: transparent;
}

.table-card {
  width: 54px;
  height: 78px;
  background: #fbfaf7;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #1a1a1a;
}

.suit-H .tc-suit, .suit-D .tc-suit { color: #dc2626; }
.suit-S .tc-suit, .suit-C .tc-suit { color: #1a1a1a; }
.suit-H .tc-rank, .suit-D .tc-rank { color: #dc2626; }
.suit-S .tc-rank, .suit-C .tc-rank { color: #1a1a1a; }

.tc-rank {
  font-size: 16px;
  line-height: 1;
}

.tc-suit {
  font-size: 22px;
  line-height: 1;
}

.table-slot-empty {
  width: 100%;
  height: 100%;
}
</style>
