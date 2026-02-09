<template>
  <div class="snake-game-container">
    <div class="header">
      <span class="title">贪吃蛇</span>
      <span class="score">分数: {{ score }}</span>
    </div>
    <div class="game-area" ref="gameArea">
      <canvas ref="canvas" :width="canvasSize" :height="canvasSize"></canvas>
      <div v-if="!isPlaying" class="overlay">
        <div class="message">
          <p v-if="gameOver">游戏结束!</p>
          <p v-else>准备好了吗?</p>
          <button @click="startGame" class="start-btn">
            {{ gameOver ? "重新开始" : "开始游戏" }}
          </button>
        </div>
      </div>
    </div>
    <div class="controls">
      <div class="row">
        <button @click="changeDirection('UP')" class="control-btn">↑</button>
      </div>
      <div class="row">
        <button @click="changeDirection('LEFT')" class="control-btn">←</button>
        <button @click="changeDirection('DOWN')" class="control-btn">↓</button>
        <button @click="changeDirection('RIGHT')" class="control-btn">→</button>
      </div>
    </div>
    <div class="tips">电脑端可使用方向键控制</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const canvas = ref(null);
const gameArea = ref(null);
const ctx = ref(null);
const score = ref(0);
const isPlaying = ref(false);
const gameOver = ref(false);

// Game configs
const gridSize = 20; // Size of one grid cell
const tileCount = 15; // Number of tiles per row/col
const canvasSize = computed(() => gridSize * tileCount); // Total canvas size

// Game state
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let gameInterval = null;
const speed = 150; // ms per frame

// Initialize game
onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d');
    resetGame();
    drawGame(); // Draw initial state
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  stopGame();
  window.removeEventListener('keydown', handleKeydown);
});

const resetGame = () => {
  snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]; // Tail down
  food = getRandomPosition();
  dx = 0;
  dy = -1; // Moving up initially
  score.value = 0;
  gameOver.value = false;
};

const startGame = () => {
  resetGame();
  isPlaying.value = true;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
};

const stopGame = () => {
  isPlaying.value = false;
  if (gameInterval) clearInterval(gameInterval);
};

const getRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
};

const gameLoop = () => {
  if (!isPlaying.value) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check collision with walls
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    handleGameOver();
    return;
  }

  // Check collision with self
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      handleGameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check collision with food
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    food = getRandomPosition();
    // Don't spawn food on snake
    while (isPositionOnSnake(food)) {
      food = getRandomPosition();
    }
  } else {
    snake.pop(); // Remove tail
  }

  drawGame();
};

import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const isPositionOnSnake = (pos) => {
  return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
};

const handleGameOver = () => {
  gameOver.value = true;
  saveScore('snake', score.value);
  stopGame();
};

const drawGame = () => {
  if (!ctx.value) return;
  
  // Clear canvas
  ctx.value.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent background
  ctx.value.clearRect(0, 0, canvasSize.value, canvasSize.value);

  // Draw Snake
  ctx.value.fillStyle = '#4ade80'; // Green-400
  snake.forEach((segment, index) => {
    // Head color slightly different
    if (index === 0) ctx.value.fillStyle = '#22c55e'; // Green-500
    else ctx.value.fillStyle = '#4ade80';
    
    ctx.value.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // Draw Food
  ctx.value.fillStyle = '#f87171'; // Red-400
  ctx.value.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
};

const handleKeydown = (e) => {
  if (!isPlaying.value) return;
  switch (e.key) {
    case 'ArrowUp': changeDirection('UP'); break;
    case 'ArrowDown': changeDirection('DOWN'); break;
    case 'ArrowLeft': changeDirection('LEFT'); break;
    case 'ArrowRight': changeDirection('RIGHT'); break;
  }
};

const changeDirection = (dir) => {
  if (!isPlaying.value && !gameOver.value) return; // Prevent moving if not playing
  
  const goingUp = dy === -1;
  const goingDown = dy === 1;
  const goingRight = dx === 1;
  const goingLeft = dx === -1;

  if (dir === 'UP' && !goingDown) { dx = 0; dy = -1; }
  if (dir === 'DOWN' && !goingUp) { dx = 0; dy = 1; }
  if (dir === 'LEFT' && !goingRight) { dx = -1; dy = 0; }
  if (dir === 'RIGHT' && !goingLeft) { dx = 1; dy = 0; }
};
</script>

<style scoped lang="scss">
.snake-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: #fff;
  font-family: 'Rubik', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}

.game-area {
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  width: 300px; /* 15 * 20 */
  height: 300px;
  
  canvas {
    display: block;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;

  .message {
    text-align: center;
    p {
      margin-bottom: 15px;
      font-size: 1.2rem;
    }
  }
}

.start-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
}

.controls {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  
  .row {
    display: flex;
    gap: 5px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &:active {
      background: rgba(255, 255, 255, 0.3);
    }
    
    @media (min-width: 768px) {
      display: none; // Hide on desktop if preferred, or keep for consistency
    }
  }
}

.tips {
  margin-top: 10px;
  font-size: 0.8rem;
  opacity: 0.7;
  @media (max-width: 768px) {
    display: none;
  }
}
</style>
