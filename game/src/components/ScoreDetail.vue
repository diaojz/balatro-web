<template>
  <div v-if="detail" class="score-detail">
    <span class="sd-hand-name">{{ HAND_NAMES[detail.handName] }}</span>
    <span class="sd-sep">→</span>
    <span class="sd-chips">{{ detail.chips }} Chips</span>
    <span class="sd-sep">×</span>
    <span class="sd-mult">{{ detail.mult }} Mult</span>
    <template v-if="detail.xMult !== 1">
      <span class="sd-sep">×</span>
      <span class="sd-xmult">{{ formatXMult(detail.xMult) }}x</span>
    </template>
    <span class="sd-sep">=</span>
    <span class="sd-total">{{ detail.total }}</span>
  </div>
</template>

<script setup lang="ts">
import type { ScoreDetail } from '../types'
import { HAND_NAMES } from '../types'

defineProps<{
  detail: ScoreDetail | null
}>()

function formatXMult(x: number): string {
  return Number.isInteger(x) ? String(x) : x.toFixed(1)
}
</script>

<style scoped>
.score-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.4);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  flex-wrap: wrap;
  justify-content: center;
}

.sd-hand-name { color: #f0ece0; }
.sd-sep { color: #666; }
.sd-chips { color: #60a5fa; }
.sd-mult  { color: #f97316; }
.sd-xmult { color: #a855f7; }
.sd-total { color: #4ade80; font-size: 18px; }
</style>
