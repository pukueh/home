<template>
  <div class="sequence-memory">
    <div class="level">等级: {{ level }}</div>
    
    <div class="grid">
      <div 
        v-for="i in 9" 
        :key="i" 
        class="cell"
        :class="{ active: activeIndex === i - 1 }"
        @click="handleInput(i - 1)"
      ></div>
    </div>
    
    <div class="message" v-if="gameOver">
      <div>游戏结束</div>
      <div class="sub">得分: {{ level - 1 }}</div>
      <button @click="startGame">重试</button>
    </div>
    
    <button v-if="!gameStarted && !gameOver" class="start-btn" @click="startGame">开始游戏</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const sequence = ref([]);
const userSequence = ref([]);
const level = ref(1);
const gameStarted = ref(false);
const gameOver = ref(false);
const activeIndex = ref(-1); // -1 means none
const isShowing = ref(false);

const startGame = () => {
  sequence.value = [];
  userSequence.value = [];
  level.value = 1;
  gameOver.value = false;
  gameStarted.value = true;
  nextLevel();
};

const nextLevel = async () => {
  userSequence.value = [];
  const next = Math.floor(Math.random() * 9);
  sequence.value.push(next);
  
  await showSequence();
};

const showSequence = async () => {
  isShowing.value = true;
  for (const index of sequence.value) {
    await new Promise(resolve => setTimeout(resolve, 500));
    activeIndex.value = index;
    await new Promise(resolve => setTimeout(resolve, 500));
    activeIndex.value = -1;
  }
  isShowing.value = false;
};

import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const handleInput = (index) => {
  if (!gameStarted.value || gameOver.value || isShowing.value) return;
  
  // Flash effect on click
  const originalActive = activeIndex.value;
  activeIndex.value = index;
  setTimeout(() => activeIndex.value = originalActive, 200);

  userSequence.value.push(index);
  
  const currentStep = userSequence.value.length - 1;
  if (userSequence.value[currentStep] !== sequence.value[currentStep]) {
    gameOver.value = true;
    gameStarted.value = false;
    saveScore('sequence', level.value - 1);
    return;
  }
  
  if (userSequence.value.length === sequence.value.length) {
    level.value++;
    setTimeout(nextLevel, 1000);
  }
};
</script>

<style lang="scss" scoped>
.sequence-memory {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  
  .level {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    gap: 15px;
    margin-bottom: 30px;
    
    .cell {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      
      &.active, &:active {
        background: white;
        box-shadow: 0 0 15px white;
      }
    }
  }
  
  .message {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    .sub { font-size: 1.2rem; margin-bottom: 10px; }
  }
  
  button {
    padding: 10px 30px;
    font-size: 1.2rem;
    background: white;
    color: black;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    &:hover { background: #eee; }
  }
}
</style>
