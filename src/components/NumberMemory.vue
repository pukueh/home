<template>
  <div class="number-memory">
    <div v-if="!gameStarted && !gameOver" class="start-screen">
      <div class="icon">🔢</div>
      <h2>数字记忆</h2>
      <p>记住显示的数字</p>
      <button @click="startGame">开始</button>
    </div>

    <div v-if="gameStarted">
      <div class="game-phase" v-if="phase === 'show'">
        <div class="number">{{ currentNumber }}</div>
        <div class="progress-bar">
           <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      
      <div class="input-phase" v-if="phase === 'input'">
        <div class="label">输入刚才的数字</div>
        <input 
          ref="inputRef"
          v-model="userInput" 
          type="number" 
          @keyup.enter="submit"
          placeholder="输入数字"
          autofocus
        />
        <button @click="submit">提交</button>
      </div>
    </div>
    
    <div v-if="gameOver" class="result-screen">
      <div class="label">数字</div>
      <div class="correct">{{ currentNumber }}</div>
      <div class="label">你的回答</div>
      <div class="wrong">{{ userInput }}</div>
      
      <div class="level-label">等级</div>
      <div class="level-score">{{ level }}</div>
      
      <button @click="startGame">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const level = ref(1);
const gameStarted = ref(false);
const gameOver = ref(false);
const phase = ref('show'); // show, input
const currentNumber = ref('');
const userInput = ref('');
const progress = ref(100);
const inputRef = ref(null);

const startGame = () => {
  level.value = 1;
  gameStarted.value = true;
  gameOver.value = false;
  nextLevel();
};

const nextLevel = () => {
  phase.value = 'show';
  userInput.value = '';
  progress.value = 100;
  
  // Generate number: length = level
  let num = '';
  for (let i = 0; i < level.value; i++) {
    num += Math.floor(Math.random() * 10);
  }
  currentNumber.value = num;
  
  // Display timer
  const displayTime = Math.max(1000, level.value * 600); // More time for longer numbers
  const startTime = Date.now();
  
  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    progress.value = 100 - (elapsed / displayTime) * 100;
    
    if (elapsed >= displayTime) {
      clearInterval(timer);
      phase.value = 'input';
      nextTick(() => {
          if(inputRef.value) inputRef.value.focus();
      });
    }
  }, 16);
};

import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const submit = () => {
  if (String(userInput.value) === currentNumber.value) {
    level.value++;
    nextLevel();
  } else {
    gameOver.value = true;
    gameStarted.value = false;
    saveScore('number', level.value);
  }
};
</script>

<style lang="scss" scoped>
.number-memory {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  
  button {
    padding: 10px 30px;
    font-size: 1.2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 20px;
    &:hover { background: #2563eb; }
  }

  .start-screen, .result-screen {
    text-align: center;
    .icon { font-size: 4rem; margin-bottom: 10px; }
    .correct { font-size: 2rem; color: #4ade80; }
    .wrong { font-size: 2rem; color: #f87171; text-decoration: line-through; }
    .level-score { font-size: 3rem; font-weight: bold; }
    .label { opacity: 0.7; margin-top: 10px; font-size: 0.9rem; }
  }
  
  .game-phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    .number { font-size: 4rem; font-weight: bold; margin-bottom: 20px; }
    .progress-bar {
      width: 200px;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      overflow: hidden;
      .fill { height: 100%; background: white; }
    }
  }
  
  .input-phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    input {
      background: transparent;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 10px;
      color: white;
      font-size: 2rem;
      text-align: center;
      width: 300px;
      margin-top: 10px;
      &:focus { border-color: #3b82f6; outline: none; }
    }
  }
}
</style>
