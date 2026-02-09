<template>
  <div class="chimp-test">
    <div v-if="!gameStarted && !gameOver" class="start-screen">
      <div class="icon">🐒</div>
      <h2>黑猩猩测试</h2>
      <p>按照数字顺序点击方块</p>
      <button @click="startGame">开始</button>
    </div>
    
    <div v-if="gameStarted" class="game-area">
      <div class="info">等级: {{ level }} ({{ numCount }} 个数字)</div>
      <div class="grid" :style="{ width: '320px', height: '200px' }">
        <div 
          v-for="item in items" 
          :key="item.id"
          class="block"
          :class="{ hidden: item.hidden, covered: item.covered }"
          :style="{ top: item.top + 'px', left: item.left + 'px' }"
          @click="handleClick(item)"
        >
          <span v-if="!item.covered">{{ item.val }}</span>
          <div v-else class="cover"></div>
        </div>
      </div>
    </div>
    
    <div v-if="gameOver" class="result-screen">
      <div class="icon">📈</div>
      <div class="label">你的成绩</div>
      <div class="score">{{ level }}</div>
      <button @click="startGame">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const gameStarted = ref(false);
const gameOver = ref(false);
const level = ref(1);
const numCount = ref(4);
const items = ref([]);
let nextNum = 1;
const isCovered = ref(false);

const startGame = () => {
  level.value = 1;
  numCount.value = 4;
  gameStarted.value = true;
  gameOver.value = false;
  nextLevel();
};

const nextLevel = () => {
  nextNum = 1;
  isCovered.value = false;
  items.value = [];
  
  // Generate distinct positions
  // Assuming grid area 320x200, block size 50x50, gap 10
  // Simplification: just random coords avoiding overlap
  const positions = [];
  const blockSize = 50;
  
  for (let i = 1; i <= numCount.value; i++) {
    let pos;
    let attempts = 0;
    do {
      pos = {
        top: Math.floor(Math.random() * (200 - blockSize)),
        left: Math.floor(Math.random() * (320 - blockSize))
      };
      attempts++;
    } while (isOverlapping(pos, positions) && attempts < 100);
    
    positions.push(pos);
    items.value.push({
      id: i,
      val: i,
      top: pos.top,
      left: pos.left,
      hidden: false, // clicked/removed
      covered: false // hidden by cover
    });
  }
};

const isOverlapping = (pos, existing) => {
  const size = 50 + 5; // size + margin
  for (const p of existing) {
    const dist = Math.max(Math.abs(pos.top - p.top), Math.abs(pos.left - p.left));
    if (dist < size) return true;
  }
  return false;
};

const handleClick = (item) => {
  if (item.hidden) return;
  
  if (item.val === nextNum) {
    item.hidden = true;
    
    // Cover others on first click
    if (nextNum === 1) {
      isCovered.value = true;
      items.value.forEach(it => {
        if (!it.hidden) it.covered = true;
      });
    }
    
    nextNum++;
    
    if (nextNum > numCount.value) {
      // Level complete
      level.value++;
      if (numCount.value < 20) numCount.value++;
      setTimeout(nextLevel, 500);
    }
  } else {
    // Fail
    gameOver.value = true;
    gameStarted.value = false;
    saveScore('chimp', level.value);
  }
};
</script>

<style lang="scss" scoped>
.chimp-test {
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
    font-weight: bold;
    margin-top: 20px;
    &:hover { background: #2563eb; }
  }

  .start-screen, .result-screen {
    text-align: center;
    .icon { font-size: 4rem; margin-bottom: 10px; }
    .score { font-size: 3rem; font-weight: bold; }
    .label { opacity: 0.7; }
  }
  
  .game-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .info { margin-bottom: 20px; font-size: 1.2rem; }
    
    .grid {
      position: relative;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
    
    .block {
      position: absolute;
      width: 50px;
      height: 50px;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      transition: opacity 0.2s;
      
      &.hidden { opacity: 0; pointer-events: none; }
      
      .cover {
        width: 100%;
        height: 100%;
        background: white;
        border-radius: 4px;
      }
    }
  }
}
</style>
