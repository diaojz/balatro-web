<template>
  <div
    class="sales-slot"
    :class="{ 'sales-slot--occupied': card !== null, 'sales-slot--triggered': isTriggered }"
    @click="handleClick"
  >
    <template v-if="card">
      <div class="sales-icon">{{ card.icon }}</div>
      <div class="sales-name">{{ card.name }}</div>
      <div class="sales-sell-hint">卖 ${{ card.sellValue }}</div>
    </template>
    <template v-else>
      <div class="slot-empty-label">空槽</div>
    </template>
  </div>

  <!-- 卖出确认弹窗 -->
  <div v-if="showConfirm" class="sell-confirm-overlay" @click.self="showConfirm = false">
    <div class="sell-confirm-box">
      <div class="sell-confirm-icon">{{ card?.icon }}</div>
      <div class="sell-confirm-name">{{ card?.name }}</div>
      <div class="sell-confirm-btns">
        <button class="btn btn-gold" @click="confirmSell">卖出 ${{ card?.sellValue }}</button>
        <button class="btn btn-gray" @click="showConfirm = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SalesCardDef } from '../types'

const props = defineProps<{
  card: SalesCardDef | null
  slotIndex: number
  isTriggered?: boolean
}>()

const emit = defineEmits<{
  sell: [slotIndex: number]
}>()

const showConfirm = ref(false)

function handleClick() {
  if (!props.card) return
  showConfirm.value = true
}

function confirmSell() {
  emit('sell', props.slotIndex)
  showConfirm.value = false
}
</script>

<style scoped>
.sales-slot {
  width: 90px;
  height: 120px;
  border-radius: 8px;
  border: 2px dashed rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  text-align: center;
  padding: 6px;
}

.sales-slot--occupied {
  border-style: solid;
  border-color: rgba(255,255,255,0.3);
  background: rgba(0,0,0,0.35);
}

.sales-slot--occupied:hover {
  border-color: #d4a017;
}

.sales-slot--triggered {
  border-color: #e8682a !important;
  box-shadow: 0 0 12px rgba(232,104,42,0.6);
  animation: pulse-trigger 0.4s ease-out;
}

@keyframes pulse-trigger {
  0%  { transform: scale(1.08); }
  100%{ transform: scale(1); }
}

.sales-icon {
  font-size: 22px;
  line-height: 1;
}

.sales-name {
  font-size: 11px;
  font-weight: 700;
  color: #f0ece0;
  word-break: break-all;
}

.sales-sell-hint {
  font-size: 10px;
  color: #d4a017;
}

.slot-empty-label {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
}

/* 卖出确认弹窗 */
.sell-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.sell-confirm-box {
  background: #2a2a3e;
  border: 2px solid #d4a017;
  border-radius: 12px;
  padding: 24px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.sell-confirm-icon {
  font-size: 40px;
}

.sell-confirm-name {
  font-size: 18px;
  font-weight: 700;
  color: #f0ece0;
}

.sell-confirm-btns {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
</style>
