<template>
  <div class="game-2048-container">
    <div class="header">
      <div class="title">2048</div>
      <div class="scores">
        <div class="score-box">
          <span class="label">SCORE</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="score-box">
          <span class="label">BEST</span>
          <span class="value">{{ bestScore }}</span>
        </div>
      </div>
      <button @click="initGame" class="new-game-btn">New Game</button>
    </div>

    <div class="game-board" ref="gameBoard" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <div v-for="(row, rIndex) in grid" :key="rIndex" class="grid-row">
        <div v-for="(cell, cIndex) in row" :key="cIndex" class="grid-cell">
          <div v-if="cell" :class="['tile', `tile-${cell}`, { 'tile-new': cell.isNew, 'tile-merged': cell.isMerged }]">
            {{ cell }}
          </div>
        </div>
      </div>
      
      <div v-if="gameOver" class="game-over">
        <p>Game Over!</p>
        <button @click="initGame">Try Again</button>
      </div>
       <div v-if="gameWon" class="game-won">
        <p>You Win!</p>
        <button @click="continueGame">Continue</button>
      </div>
    </div>
    <div class="tips">Use arrow keys or swipe to play</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const gridSize = 4;
const grid = ref([]);
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const gameWon = ref(false);
const keepPlaying = ref(false);

// Initialize game
const initGame = () => {
  grid.value = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
  score.value = 0;
  gameOver.value = false;
  gameWon.value = false;
  keepPlaying.value = false;
  bestScore.value = localStorage.getItem('2048-best-score') || 0;
  addNewTile();
  addNewTile();
};

// Ensure reactivity for grid updates
const updateGrid = (newGrid) => {
  grid.value = newGrid;
};

const addNewTile = () => {
  const emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid.value[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
};

const move = (direction) => {
  if (gameOver.value || (gameWon.value && !keepPlaying.value)) return;

  let moved = false;
  let newGrid = JSON.parse(JSON.stringify(grid.value));
  let newScore = score.value;

  const rotateGrid = (g) => g[0].map((_, i) => g.map(row => row[i]).reverse());
  const rotateGridCounter = (g) => g[0].map((_, i) => g.map(row => row[g.length - 1 - i]));

  // Standardize to "slide left" logic
  if (direction === 'RIGHT') newGrid = newGrid.map(row => row.reverse());
  if (direction === 'UP') newGrid = rotateGridCounter(newGrid);
  if (direction === 'DOWN') newGrid = rotateGrid(newGrid);

  // Process slide left
  newGrid.forEach(row => {
    // 1. Remove zeros
    let filteredRow = row.filter(val => val !== 0);
    // 2. Merge
    for (let i = 0; i < filteredRow.length - 1; i++) {
      if (filteredRow[i] === filteredRow[i + 1]) {
        filteredRow[i] *= 2;
        newScore += filteredRow[i];
        filteredRow[i + 1] = 0;
      }
    }
    // 3. Remove zeros again (after merge) and pad
    filteredRow = filteredRow.filter(val => val !== 0);
    while (filteredRow.length < gridSize) filteredRow.push(0);
    
    // Check if row changed
    if (JSON.stringify(row) !== JSON.stringify(filteredRow)) moved = true;
    
    // Update row in place
    for(let i=0; i<gridSize; i++) row[i] = filteredRow[i];
  });

  // Restore orientation
  if (direction === 'RIGHT') newGrid = newGrid.map(row => row.reverse());
  if (direction === 'UP') newGrid = rotateGrid(newGrid);
  if (direction === 'DOWN') newGrid = rotateGridCounter(newGrid);

  if (moved) {
    grid.value = newGrid;
    score.value = newScore;
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      localStorage.setItem('2048-best-score', bestScore.value);
    }
    
    addNewTile();
    
    if (checkWin() && !keepPlaying.value) {
       gameWon.value = true;
       saveScore('2048', score.value);
    } else if (checkGameOver()) {
       gameOver.value = true;
       saveScore('2048', score.value);
    }
  }
};

const checkWin = () => {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] === 2048) return true;
    }
  }
  return false;
};

const continueGame = () => {
    keepPlaying.value = true;
    gameWon.value = false;
}

const checkGameOver = () => {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] === 0) return false;
      if (c < gridSize - 1 && grid.value[r][c] === grid.value[r][c + 1]) return false;
      if (r < gridSize - 1 && grid.value[r][c] === grid.value[r + 1][c]) return false;
    }
  }
  return true;
};

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowUp': e.preventDefault(); move('UP'); break;
    case 'ArrowDown': e.preventDefault(); move('DOWN'); break;
    case 'ArrowLeft': e.preventDefault(); move('LEFT'); break;
    case 'ArrowRight': e.preventDefault(); move('RIGHT'); break;
  }
};

// Touch handling
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  if (!touchStartX || !touchStartY) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) { // Threshold
        if (dx > 0) move('RIGHT');
        else move('LEFT');
    }
  } else {
    if (Math.abs(dy) > 30) {
        if (dy > 0) move('DOWN');
        else move('UP');
    }
  }

  touchStartX = 0;
  touchStartY = 0;
};

onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<style scoped lang="scss">
.game-2048-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  color: #776e65;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 300px;
  margin-bottom: 20px;

  .title {
    font-size: 40px;
    font-weight: bold;
    color: #eee4da;
  }

  .scores {
    display: flex;
    gap: 5px;
    .score-box {
        background: #bbada0;
        padding: 5px 10px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 50px;
        
        .label {
            font-size: 10px;
            color: #eee4da;
            font-weight: bold;
        }
        .value {
            font-size: 18px;
            color: #fff;
            font-weight: bold;
        }
    }
  }

  .new-game-btn {
    background: #8f7a66;
    color: #f9f6f2;
    border: none;
    border-radius: 3px;
    padding: 0 10px;
    height: 40px;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        background: #9f8b77;
    }
  }
}

.game-board {
  position: relative;
  width: 300px;
  height: 300px;
  background: #bbada0;
  border-radius: 6px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-row {
  display: flex;
  justify-content: space-between;
  height: 65px; // (300 - 20 - 15)/4 approx
}

.grid-cell {
  width: 65px;
  height: 65px;
  background: rgba(238, 228, 218, 0.35);
  border-radius: 3px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  font-weight: bold;
}

.tile {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background: #eee4da;
  color: #776e65;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: appear 0.2s ease-in-out;
  
  &.tile-2 { background: #eee4da; }
  &.tile-4 { background: #ede0c8; }
  &.tile-8 { background: #f2b179; color: #f9f6f2; }
  &.tile-16 { background: #f59563; color: #f9f6f2; }
  &.tile-32 { background: #f67c5f; color: #f9f6f2; }
  &.tile-64 { background: #f65e3b; color: #f9f6f2; }
  &.tile-128 { background: #edcf72; color: #f9f6f2; font-size: 24px;}
  &.tile-256 { background: #edcc61; color: #f9f6f2; font-size: 24px;}
  &.tile-512 { background: #edc850; color: #f9f6f2; font-size: 24px;}
  &.tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 18px;}
  &.tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 18px;}

  &.tile-merged {
      animation: pop 0.2s ease-in-out;
  }
}

.game-over, .game-won {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(238, 228, 218, 0.73);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 6px;
  
  p {
    font-size: 40px;
    font-weight: bold;
    color: #776e65;
    margin-bottom: 20px;
  }
  
  button {
    background: #8f7a66;
    color: #f9f6f2;
    border: none;
    border-radius: 3px;
    padding: 10px 20px;
    font-weight: bold;
    cursor: pointer;
  }
}

.tips {
    margin-top: 15px;
    color: #eee4da;
    font-size: 14px;
}

@keyframes appear {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
