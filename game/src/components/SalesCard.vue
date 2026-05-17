<template>
  <div
    class="sales-card"
    :class="`rarity-${card.rarity}`"
    @click="emit('click', card)"
  >
    <div class="sales-icon">{{ card.icon }}</div>
    <div class="sales-name">{{ card.name }}</div>
    <div class="sales-desc">{{ card.desc }}</div>
    <div class="sales-footer">
      <span class="rarity-badge">{{ rarityLabel }}</span>
      <span v-if="showPrice" class="price-tag">${{ card.price }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SalesCardDef } from '../types'

const props = defineProps<{
  card: SalesCardDef
  showPrice?: boolean
}>()

const emit = defineEmits<{
  click: [card: SalesCardDef]
}>()

const rarityLabel = computed(() =>
  props.card.rarity === 'rare' ? 'Rare' : 'Common'
)
</script>

<style scoped>
.sales-card {
  width: 110px;
  min-height: 140px;
  border-radius: 10px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 2px solid transparent;
  text-align: center;
  background: #2a2a3e;
}

.sales-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
}

.rarity-common {
  border-color: #94a3b8;
}

.rarity-rare {
  border-color: #fb923c;
  background: linear-gradient(135deg, #2a2a3e 0%, #3a2518 100%);
}

.sales-icon {
  font-size: 28px;
  line-height: 1;
}

.sales-name {
  font-size: 13px;
  font-weight: 700;
  color: #f0ece0;
}

.sales-desc {
  font-size: 11px;
  color: #aaa;
  line-height: 1.3;
  flex: 1;
}

.sales-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: auto;
}

.rarity-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.rarity-common .rarity-badge {
  background: #475569;
  color: #94a3b8;
}

.rarity-rare .rarity-badge {
  background: #7c3f00;
  color: #fb923c;
}

.price-tag {
  font-size: 13px;
  font-weight: 800;
  color: #d4a017;
}
</style>
