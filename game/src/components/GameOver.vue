<template>
  <div class="gameover-overlay">
    <div class="gameover-box">
      <div class="gameover-icon">💀</div>
      <h2 class="gameover-title">游戏结束</h2>
      <div class="gameover-stats">
        <div class="stat-row">
          <span class="stat-label">最终得分</span>
          <span class="stat-value">{{ game.score }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">目标分数</span>
          <span class="stat-value">{{ game.targetScore }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">坚持了</span>
          <span class="stat-value">第 {{ game.round }} 局</span>
        </div>
      </div>
      <p class="gameover-hint">出牌次数耗尽，未达到目标分数</p>
      <button class="btn btn-orange btn-restart" @click="game.restart()">
        再来一局
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'

const game = useGameStore()
</script>

<style scoped>
.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.gameover-box {
  background: #1e1e30;
  border: 2px solid #dc2626;
  border-radius: 16px;
  padding: 36px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 320px;
}

.gameover-icon {
  font-size: 56px;
}

.gameover-title {
  font-size: 28px;
  font-weight: 800;
  color: #dc2626;
  margin: 0;
}

.gameover-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 12px 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.stat-label { color: #aaa; }
.stat-value { color: #f0ece0; font-weight: 700; }

.gameover-hint {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.btn-restart {
  padding: 12px 36px;
  font-size: 16px;
  margin-top: 4px;
}
</style>
