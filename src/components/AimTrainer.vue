<template>
  <div class="aim-trainer">
    <div v-if="!gameStarted && !finished" class="start-screen">
      <div class="icon">🎯</div>
      <h2>瞄准训练</h2>
      <p>尽可能快地点击 30 个目标</p>
      <button @click="startGame">开始</button>
    </div>
    
    <div v-if="finished" class="result-screen">
      <div class="icon">🏆</div>
      <div class="label">平均时间</div>
      <div class="score">{{ averageTime }} ms</div>
      <button @click="startGame">重试</button>
    </div>
    
    <div v-if="gameStarted && !finished" class="game-area" ref="gameArea">
      <div class="stats">剩余: {{ remaining }}</div>
      <div 
        class="target" 
        :style="{ top: targetY + 'px', left: targetX + 'px' }"
        @mousedown="hitTarget"
      >
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="5" />
          <circle cx="50" cy="50" r="15" fill="white" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const TOTAL_TARGETS = 30;
const gameStarted = ref(false);
const finished = ref(false);
const remaining = ref(TOTAL_TARGETS);
const targetX = ref(0);
const targetY = ref(0);
const gameArea = ref(null);
const averageTime = ref(0);

let startTime = 0;

const startGame = async () => {
  gameStarted.value = true;
  finished.value = false;
  remaining.value = TOTAL_TARGETS;
  startTime = Date.now();
  await nextTick();
  moveTarget();
};

const moveTarget = () => {
  if (!gameArea.value) return;
  const width = gameArea.value.clientWidth;
  const height = gameArea.value.clientHeight;
  const targetSize = 60; // Approximate size
  
  targetX.value = Math.random() * (width - targetSize);
  targetY.value = Math.random() * (height - targetSize);
};

const hitTarget = () => {
  remaining.value--;
  if (remaining.value <= 0) {
    finishGame();
  } else {
    moveTarget();
  }
};

const finishGame = () => {
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  averageTime.value = Math.round(totalTime / TOTAL_TARGETS);
  gameStarted.value = false;
  finished.value = true;
};
</script>

<style lang="scss" scoped>
.aim-trainer {
  width: 100%;
  height: 500px;
  color: white;
  position: relative;
  
  button {
    padding: 10px 30px;
    font-size: 1.2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 20px;
    &:hover { background: #2563eb; }
  }

  .start-screen, .result-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .icon { font-size: 4rem; margin-bottom: 10px; }
    h2 { font-size: 2rem; margin-bottom: 10px; }
    .score { font-size: 4rem; font-weight: bold; color: #3b82f6; }
  }
  
  .game-area {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.2);
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: crosshair;
    
    .stats {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 1.2rem;
      pointer-events: none;
    }
    
    .target {
      position: absolute;
      width: 60px;
      height: 60px;
      cursor: pointer;
      svg { width: 100%; height: 100%; }
    }
  }
}
</style>
