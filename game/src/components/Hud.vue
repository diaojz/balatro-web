<template>
  <div class="hud">
    <div class="hud-left">
      <div class="hud-label">目标</div>
      <div class="hud-value hud-target">{{ game.targetScore }}</div>
    </div>
    <div class="hud-center">
      <div class="hud-label">得分</div>
      <div class="hud-value hud-score" :class="{ 'hud-score--win': game.score >= game.targetScore }">
        {{ game.score }}
      </div>
    </div>
    <div class="hud-right">
      <div class="hud-stat">
        <span class="hud-label">出牌</span>
        <span class="hud-badge hud-hands">{{ game.handsLeft }}</span>
      </div>
      <div class="hud-stat">
        <span class="hud-label">弃牌</span>
        <span class="hud-badge hud-discards">{{ game.discardsLeft }}</span>
      </div>
      <div class="hud-stat">
        <span class="hud-label">金钱</span>
        <span class="hud-badge hud-money">${{ sales.money }}</span>
      </div>
    </div>
    <div class="hud-round">第 {{ game.round }} 局</div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { useSalesStore } from '../stores/salesStore'

const game = useGameStore()
const sales = useSalesStore()
</script>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 24px;
  background: rgba(0,0,0,0.35);
  border-bottom: 2px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.hud-left, .hud-center, .hud-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hud-label {
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
}

.hud-value {
  font-size: 20px;
  font-weight: 800;
  min-width: 60px;
  text-align: right;
}

.hud-target { color: #d4a017; }
.hud-score  { color: #fff; transition: color 0.3s; }
.hud-score--win { color: #4ade80; }

.hud-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hud-badge {
  font-size: 15px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 12px;
  min-width: 36px;
  text-align: center;
}

.hud-hands    { background: #e8682a; color: #fff; }
.hud-discards { background: #2563eb; color: #fff; }
.hud-money    { background: #d4a017; color: #1a1a1a; }

.hud-round {
  margin-left: auto;
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
}
</style>
