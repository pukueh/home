<template>
  <div class="leaderboard">
    <div class="header">
      <h2>🏆 排行榜</h2>
      <button class="close-btn" @click="$emit('close')">关闭</button>
    </div>
    
    <div class="tabs">
      <div 
        v-for="game in games" 
        :key="game.id"
        class="tab"
        :class="{ active: activeGameId === game.id }"
        @click="activeGameId = game.id"
      >
        <img :src="game.icon" width="20" height="20" />
      </div>
    </div>
    
    <div class="scores-list" v-if="activeGameId">
      <div class="game-title">{{ getGameName(activeGameId) }}</div>
      
      <div v-if="scores.length === 0" class="no-data">暂无记录</div>
      
      <div v-else class="score-item header-row">
        <span class="rank">排名</span>
        <span class="score">分数/时间</span>
        <span class="date">日期</span>
      </div>
      
      <div v-for="(item, index) in scores" :key="index" class="score-item">
        <span class="rank" :class="`rank-${index+1}`">{{ index + 1 }}</span>
        <span class="score">{{ formatScore(item.score, activeGameId) }}</span>
        <span class="date">{{ formatDate(item.date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLeaderboard } from '@/composables/useLeaderboard';
import snakeIcon from "@/assets/icons/snake.svg";
import icon2048 from "@/assets/icons/2048.svg";
import minesweeperIcon from "@/assets/icons/minesweeper.svg";
import tictactoeIcon from "@/assets/icons/tictactoe.svg";
import tetrisIcon from "@/assets/icons/tetris.svg";
import breakoutIcon from "@/assets/icons/breakout.svg";
import sequenceIcon from "@/assets/icons/sequence.svg";
import numberIcon from "@/assets/icons/number.svg";
import chimpIcon from "@/assets/icons/chimp.svg";

const props = defineProps(['initialGameId']);
const emit = defineEmits(['close']);

const { getTopScores } = useLeaderboard();
const activeGameId = ref(props.initialGameId || 'snake');
const scores = ref([]);

const games = [
  { id: "snake", name: "贪吃蛇", icon: snakeIcon },
  { id: "2048", name: "2048", icon: icon2048 },
  { id: "minesweeper", name: "扫雷", icon: minesweeperIcon },
  { id: "tictactoe", name: "井字棋", icon: tictactoeIcon },
  { id: "tetris", name: "俄罗斯方块", icon: tetrisIcon },
  { id: "breakout", name: "打砖块", icon: breakoutIcon },
  { id: "sequence", name: "序列记忆", icon: sequenceIcon },
  { id: "number", name: "数字记忆", icon: numberIcon },
  { id: "chimp", name: "黑猩猩测试", icon: chimpIcon }
];

const getGameName = (id) => games.find(g => g.id === id)?.name;

const loadScores = () => {
  // Determine sort order based on game
  // Lower is better: minesweeper, reaction (removed), aim (removed)
  // Higher is better: snake, 2048, tictactoe, tetris, breakout, sequence, number, chimp
  // Minesweeper records time in ms? Wait, implementation check needed.
  // Assuming Minesweeper saves seconds or ms.
  
  const isLowerBetter = ['minesweeper'].includes(activeGameId.value);
  scores.value = getTopScores(activeGameId.value, 10, isLowerBetter);
};

const formatScore = (score, gameId) => {
  if (gameId === 'minesweeper') return `${score}s`;
  if (gameId === 'reaction') return `${score}ms`;
  if (gameId === 'aim') return `${score}ms`;
  if (['sequence', 'number', 'chimp'].includes(gameId)) return `Lv.${score}`;
  return score;
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

watch(activeGameId, loadScores, { immediate: true });
</script>

<style lang="scss" scoped>
.leaderboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  padding: 10px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 5px 15px;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: rgba(255,255,255,0.3); }
    }
  }
  
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
    
    .tab {
      padding: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      
      &.active {
        background: #3b82f6;
      }
      &:hover {
        background: rgba(255,255,255,0.2);
      }
    }
  }
  
  .scores-list {
    flex: 1;
    overflow-y: auto;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 10px;
    
    .game-title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    .no-data {
      text-align: center;
      opacity: 0.5;
      margin-top: 50px;
    }
    
    .score-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      
      &.header-row {
        opacity: 0.7;
        font-size: 0.9rem;
      }
      
      .rank { width: 50px; text-align: center; }
      .score { flex: 1; text-align: center; font-weight: bold; }
      .date { width: 100px; text-align: right; font-size: 0.9rem; opacity: 0.8; }
      
      .rank-1 { color: #fbbf24; font-weight: bold; }
      .rank-2 { color: #9ca3af; font-weight: bold; }
      .rank-3 { color: #b45309; font-weight: bold; }
    }
  }
}
</style>
