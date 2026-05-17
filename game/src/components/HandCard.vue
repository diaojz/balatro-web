<template>
  <div
    class="poker-card hand-card"
    :class="[`suit-${card.suit}`, { selected: isSelected }]"
    @click="emit('toggle', card.id)"
  >
    <div class="card-corner card-corner--top">
      <span class="card-rank">{{ card.rank }}</span>
      <span class="card-suit-symbol">{{ suitSymbol }}</span>
    </div>
    <div class="card-center">{{ suitSymbol }}</div>
    <div class="card-corner card-corner--bottom">
      <span class="card-rank">{{ card.rank }}</span>
      <span class="card-suit-symbol">{{ suitSymbol }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '../types'

const props = defineProps<{
  card: Card
  isSelected: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

const SUIT_SYMBOLS: Record<string, string> = {
  H: '♥', D: '♦', C: '♣', S: '♠',
}

const suitSymbol = computed(() => SUIT_SYMBOLS[props.card.suit])
</script>

<style scoped>
.hand-card {
  width: 72px;
  height: 100px;
  flex-shrink: 0;
  font-size: 13px;
}

.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
  font-size: 12px;
  font-weight: 800;
}

.card-corner--top {
  top: 4px;
  left: 6px;
}

.card-corner--bottom {
  bottom: 4px;
  right: 6px;
  transform: rotate(180deg);
}

.card-rank {
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}

.card-suit-symbol {
  font-size: 11px;
  line-height: 1;
}

.card-center {
  font-size: 26px;
  line-height: 1;
}
</style>
