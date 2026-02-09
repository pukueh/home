<template>
  <div class="tetris-game" tabindex="0" @keydown="handleKeydown" ref="gameContainer">
    <div v-if="!gameStarted && !gameOver" class="start-screen">
      <div class="icon">🧱</div>
      <h2>俄罗斯方块</h2>
      <button @click="startGame">开始游戏</button>
      <div class="controls">
        <p>← → : 移动</p>
        <p>↑ : 旋转</p>
        <p>↓ : 加速</p>
      </div>
    </div>

    <div v-if="gameStarted || gameOver" class="game-container">
      <div class="score-board">
        <div>得分: {{ score }}</div>
        <div>消除: {{ lines }}</div>
      </div>
      
      <div class="grid">
        <div v-for="(row, r) in displayGrid" :key="r" class="row">
          <div 
            v-for="(cell, c) in row" 
            :key="c" 
            class="cell"
            :class="cell ? `type-${cell}` : ''"
          ></div>
        </div>
      </div>

      <div v-if="gameOver" class="game-over">
        <h3>游戏结束</h3>
        <button @click="startGame">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue';
import { useLeaderboard } from "@/composables/useLeaderboard";

const ROWS = 20;
const COLS = 10;
const SHAPES = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};
const COLORS = {
  I: 'cyan', J: 'blue', L: 'orange', O: 'yellow', S: 'green', T: 'purple', Z: 'red'
};

const grid = ref([]);
const score = ref(0);
const lines = ref(0);
const gameOver = ref(false);
const gameStarted = ref(false);
const gameContainer = ref(null);
const { saveScore } = useLeaderboard();

let currentPiece = null;
let currentPos = { r: 0, c: 0 };
let dropInterval = null;
let dropRate = 1000;

const initGrid = () => {
  grid.value = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
};

const spawnPiece = () => {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const shape = SHAPES[type];
  currentPiece = { type, shape };
  currentPos = { r: 0, c: Math.floor((COLS - shape[0].length) / 2) };


  if (checkCollision(currentPos.r, currentPos.c, currentPiece.shape)) {
    gameOver.value = true;
    clearInterval(dropInterval);
    saveScore('tetris', score.value);
  }
};

const checkCollision = (r, c, shape) => {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const newR = r + i;
        const newC = c + j;
        if (newR >= ROWS || newC < 0 || newC >= COLS || (newR >= 0 && grid.value[newR][newC])) {
          return true;
        }
      }
    }
  }
  return false;
};

const rotate = () => {
  const newShape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
  if (!checkCollision(currentPos.r, currentPos.c, newShape)) {
    currentPiece.shape = newShape;
  }
};

const move = (dr, dc) => {
  if (!checkCollision(currentPos.r + dr, currentPos.c + dc, currentPiece.shape)) {
    currentPos.r += dr;
    currentPos.c += dc;
    return true;
  }
  return false;
};

const drop = () => {
  if (!move(1, 0)) {
    lockPiece();
    clearLines();
    spawnPiece();
  }
};

const lockPiece = () => {
  for (let i = 0; i < currentPiece.shape.length; i++) {
    for (let j = 0; j < currentPiece.shape[i].length; j++) {
      if (currentPiece.shape[i][j]) {
        const r = currentPos.r + i;
        const c = currentPos.c + j;
        if (r >= 0) grid.value[r][c] = currentPiece.type;
      }
    }
  }
};

const clearLines = () => {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid.value[r].every(cell => cell !== 0)) {
      grid.value.splice(r, 1);
      grid.value.unshift(Array(COLS).fill(0));
      cleared++;
      r++; // Check same row again
    }
  }
  if (cleared > 0) {
    lines.value += cleared;
    score.value += [0, 100, 300, 500, 800][cleared];
    dropRate = Math.max(100, 1000 - lines.value * 50);
    clearInterval(dropInterval);
    dropInterval = setInterval(drop, dropRate);
  }
};

const displayGrid = computed(() => {
  const display = grid.value.map(row => [...row]);
  if (currentPiece && !gameOver.value) {
    for (let i = 0; i < currentPiece.shape.length; i++) {
      for (let j = 0; j < currentPiece.shape[i].length; j++) {
        if (currentPiece.shape[i][j]) {
          const r = currentPos.r + i;
          const c = currentPos.c + j;
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            display[r][c] = currentPiece.type;
          }
        }
      }
    }
  }
  return display;
});

const startGame = () => {
  initGrid();
  score.value = 0;
  lines.value = 0;
  gameOver.value = false;
  gameStarted.value = true;
  dropRate = 1000;
  spawnPiece();
  if (dropInterval) clearInterval(dropInterval);
  dropInterval = setInterval(drop, dropRate);
  nextTick(() => gameContainer.value?.focus());
};

const handleKeydown = (e) => {
  if (!gameStarted.value || gameOver.value) return;
  
  if (e.key === 'ArrowLeft') move(0, -1);
  else if (e.key === 'ArrowRight') move(0, 1);
  else if (e.key === 'ArrowDown') drop();
  else if (e.key === 'ArrowUp') rotate();
};

onUnmounted(() => {
  clearInterval(dropInterval);
});
</script>

<style lang="scss" scoped>
.tetris-game {
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  
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

  .start-screen {
    text-align: center;
    .icon { font-size: 4rem; margin-bottom: 10px; }
    .controls {
      margin-top: 20px;
      text-align: left;
      background: rgba(255,255,255,0.1);
      padding: 15px;
      border-radius: 8px;
    }
  }

  .game-container {
    position: relative;
    .score-board {
      display: flex;
      justify-content: space-between;
      width: 250px;
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .grid {
      display: grid;
      grid-template-rows: repeat(20, 20px);
      gap: 1px;
      background: #333;
      border: 2px solid #555;
      
      .row {
        display: grid;
        grid-template-columns: repeat(10, 20px);
        gap: 1px;
      }
      
      .cell {
        width: 20px;
        height: 20px;
        background: #111;
        &.type-I { background: cyan; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-J { background: blue; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-L { background: orange; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-O { background: yellow; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-S { background: green; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-T { background: purple; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
        &.type-Z { background: red; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
      }
    }
    
    .game-over {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      h3 { font-size: 2rem; margin-bottom: 20px; color: #f87171; }
    }
  }
}
</style>
