<template>
  <div class="minesweeper-game">
    <div class="header">
      <div class="score-board">
        <span>💣 {{ minesLeft }}</span>
        <button class="reset-btn" @click="resetGame">{{ feedback }}</button>
        <span>⏱️ {{ time }}</span>
      </div>
    </div>
    
    <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
      <div 
        v-for="(cell, index) in board" 
        :key="index"
        class="cell"
        :class="{ 
          revealed: cell.revealed, 
          mine: cell.revealed && cell.isMine,
          flagged: cell.flagged,
          pressed: cell.revealed && !cell.isMine
        }"
        @click="reveal(index)"
        @contextmenu.prevent="toggleFlag(index)"
      >
        <span v-if="cell.flagged">🚩</span>
        <span v-else-if="cell.revealed && cell.isMine">💣</span>
        <span v-else-if="cell.revealed && cell.neighborMines > 0" :class="`num-${cell.neighborMines}`">
          {{ cell.neighborMines }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

const rows = 9;
const cols = 9;
const totalMines = 10;

const board = ref([]);
const gameOver = ref(false);
const won = ref(false);
const time = ref(0);
let timerInterval = null;
const gameStarted = ref(false);

const minesLeft = computed(() => {
  const flaggedCount = board.value.filter(c => c.flagged).length;
  return Math.max(0, totalMines - flaggedCount);
});

const feedback = computed(() => {
  if (won.value) return '😎';
  if (gameOver.value) return '😵';
  return '🙂';
});

const initBoard = () => {
  board.value = Array(rows * cols).fill(null).map((_, i) => ({
    id: i,
    isMine: false,
    revealed: false,
    flagged: false,
    neighborMines: 0
  }));
  
  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < totalMines) {
    const idx = Math.floor(Math.random() * (rows * cols));
    if (!board.value[idx].isMine) {
      board.value[idx].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors
  board.value.forEach((cell, idx) => {
    if (!cell.isMine) {
      cell.neighborMines = getNeighbors(idx).filter(n => board.value[n].isMine).length;
    }
  });
};

const getNeighbors = (idx) => {
  const neighbors = [];
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push(nr * cols + nc);
      }
    }
  }
  return neighbors;
};

const startTimer = () => {
  if (!gameStarted.value) {
    gameStarted.value = true;
    timerInterval = setInterval(() => {
      time.value++;
    }, 1000);
  }
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

const reveal = (idx) => {
  if (gameOver.value || board.value[idx].flagged) return;
  
  startTimer();
  
  const cell = board.value[idx];
  if (cell.isMine) {
    gameOver.value = true;
    revealAllMines();
    stopTimer();
    return;
  }
  
  if (!cell.revealed) {
    cell.revealed = true;
    if (cell.neighborMines === 0) {
      // Flood fill
      const neighbors = getNeighbors(idx);
      neighbors.forEach(n => {
        if (!board.value[n].revealed) reveal(n);
      });
    }
    checkWin();
  }
};

const toggleFlag = (idx) => {
  if (gameOver.value || board.value[idx].revealed) return;
  startTimer();
  board.value[idx].flagged = !board.value[idx].flagged;
};

const revealAllMines = () => {
  board.value.forEach(cell => {
    if (cell.isMine) cell.revealed = true;
  });
};

import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const checkWin = () => {
  const revealedCount = board.value.filter(c => c.revealed).length;
  if (revealedCount === rows * cols - totalMines) {
    won.value = true;
    gameOver.value = true;
    stopTimer();
    saveScore('minesweeper', time.value);
  }
};

const resetGame = () => {
  stopTimer();
  time.value = 0;
  gameOver.value = false;
  won.value = false;
  gameStarted.value = false;
  initBoard();
};

initBoard();

onUnmounted(() => {
  stopTimer();
});
</script>

<style lang="scss" scoped>
.minesweeper-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  background: #c0c0c0;
  padding: 10px;
  border: 4px solid #fff;
  border-right-color: #808080;
  border-bottom-color: #808080;
  
  .header {
    background: #c0c0c0;
    border: 3px solid #808080;
    border-right-color: #fff;
    border-bottom-color: #fff;
    width: 100%;
    margin-bottom: 10px;
    padding: 5px;
    
    .score-board {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      font-size: 20px;
      font-weight: bold;
      color: red;
      background: black;
      padding: 2px 5px;
      
      .reset-btn {
        width: 30px;
        height: 30px;
        font-size: 20px;
        cursor: pointer;
        border: 2px solid #fff;
        border-right-color: #808080;
        border-bottom-color: #808080;
        background: #c0c0c0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        &:active {
           border: 2px solid #808080;
           border-right-color: #fff;
           border-bottom-color: #fff;
        }
      }
    }
  }

  .grid {
    display: grid;
    gap: 0;
    border: 4px solid #808080;
    border-right-color: #fff;
    border-bottom-color: #fff;
    
    .cell {
      width: 30px;
      height: 30px;
      background: #c0c0c0;
      border: 3px solid #fff;
      border-right-color: #808080;
      border-bottom-color: #808080;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      cursor: pointer;
      font-size: 18px;
      
      &.pressed, &.revealed {
        border: 1px solid #808080;
        background: #d6d6d6;
      }
      
      &.mine {
        background: red;
      }
      
      .num-1 { color: blue; }
      .num-2 { color: green; }
      .num-3 { color: red; }
      .num-4 { color: darkblue; }
      .num-5 { color: darkred; }
      .num-6 { color: teal; }
      .num-7 { color: black; }
      .num-8 { color: gray; }
    }
  }
}
</style>
