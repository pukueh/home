<template>
  <div class="tic-tac-toe">
    <div class="status">{{ status }}</div>
    <div class="board">
      <div 
        v-for="(cell, index) in board" 
        :key="index" 
        class="cell"
        :class="{ winner: winningLines.includes(index) }"
        @click="makeMove(index)"
      >
        <span v-if="cell" :class="cell">{{ cell }}</span>
      </div>
    </div>
    <button class="reset-btn" @click="resetGame">重置游戏</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const board = ref(Array(9).fill(null));
const xIsNext = ref(true);
const winner = ref(null);
const winningLines = ref([]);

const status = computed(() => {
  if (winner.value) return `玩家 ${winner.value} 获胜!`;
  if (!board.value.includes(null)) return '平局!';
  return `轮到玩家: ${xIsNext.value ? 'X' : 'O'}`;
});

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
};

const makeMove = (index) => {
  if (board.value[index] || winner.value) return;
  
  board.value[index] = xIsNext.value ? 'X' : 'O';
  const winResult = calculateWinner(board.value);
  
  if (winResult) {
    winner.value = winResult.winner;
    winningLines.value = winResult.line;
  } else {
    xIsNext.value = !xIsNext.value;
  }
};

const resetGame = () => {
  board.value = Array(9).fill(null);
  xIsNext.value = true;
  winner.value = null;
  winningLines.value = [];
};
</script>

<style lang="scss" scoped>
.tic-tac-toe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: white;
  
  .status {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .board {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 5px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 10px;
    
    @media (max-width: 400px) {
        grid-template-columns: repeat(3, 80px);
        grid-template-rows: repeat(3, 80px);
    }
    
    .cell {
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 5px;
      transition: background 0.3s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &.winner {
        background: rgba(74, 222, 128, 0.5);
      }
      
      .X { color: #f87171; }
      .O { color: #60a5fa; }
    }
  }
  
  .reset-btn {
    padding: 10px 20px;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
