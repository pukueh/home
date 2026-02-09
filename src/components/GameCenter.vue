<template>
  <Transition name="fade">
    <div class="game-center" v-if="store.gameOpenState">
      <div class="game-modal">
        <div class="modal-header">
          <div class="header-left">
            <icon v-if="activeGame" class="back-btn" size="24" @click="activeGame = null">
              <Left theme="filled" fill="#ffffff" />
            </icon>
            <div class="title">{{ activeGame ? getGameName(activeGame) : "游戏中心" }}</div>
          </div>
          <icon class="close-btn" size="24" @click="closeGameCenter">
            <CloseOne theme="filled" fill="#ffffff" />
          </icon>
        </div>
        
        <div class="game-content">
          <!-- 游戏菜单 -->
           <div v-if="!activeGame" class="game-menu">
            <div 
              v-for="game in games" 
              :key="game.id" 
              class="game-card"
              @click="activeGame = game.id"
            >
              <img :src="game.icon" class="game-icon" />
              <div class="game-name">{{ game.name }}</div>
            </div>
            
            <!-- 排行榜入口 -->
            <div class="game-card" @click="activeGame = 'leaderboard'">
               <Ranking theme="filled" fill="#fbbf24" size="50" class="game-icon" style="padding: 0;" />
               <div class="game-name">排行榜</div>
            </div>
           </div>

           <!-- 游戏界面 (懒加载) -->
           <Suspense>
             <template #default>
               <component :is="currentGameComponent" v-if="activeGame" @close="activeGame = null" />
             </template>
             <template #fallback>
               <div class="loading">加载中...</div>
             </template>
           </Suspense>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed, defineAsyncComponent } from "vue";
import { mainStore } from "@/store";
import { Icon } from "@vicons/utils";
import { CloseOne, Left, Ranking } from "@icon-park/vue-next";

// 懒加载游戏组件
const SnakeGame = defineAsyncComponent(() => import("@/components/SnakeGame.vue"));
const Game2048 = defineAsyncComponent(() => import("@/components/Game2048.vue"));
const Minesweeper = defineAsyncComponent(() => import("@/components/Minesweeper.vue"));
const TicTacToe = defineAsyncComponent(() => import("@/components/TicTacToe.vue"));
const Tetris = defineAsyncComponent(() => import("@/components/Tetris.vue"));
const Breakout = defineAsyncComponent(() => import("@/components/Breakout.vue"));
const SequenceMemory = defineAsyncComponent(() => import("@/components/SequenceMemory.vue"));
const NumberMemory = defineAsyncComponent(() => import("@/components/NumberMemory.vue"));
const ChimpTest = defineAsyncComponent(() => import("@/components/ChimpTest.vue"));
const Leaderboard = defineAsyncComponent(() => import("@/components/Leaderboard.vue"));

// 导入图标
import snakeIcon from "@/assets/icons/snake.svg";
import icon2048 from "@/assets/icons/2048.svg";
import minesweeperIcon from "@/assets/icons/minesweeper.svg";
import tictactoeIcon from "@/assets/icons/tictactoe.svg";
import tetrisIcon from "@/assets/icons/tetris.svg";
import breakoutIcon from "@/assets/icons/breakout.svg";
import sequenceIcon from "@/assets/icons/sequence.svg";
import numberIcon from "@/assets/icons/number.svg";
import chimpIcon from "@/assets/icons/chimp.svg";

const store = mainStore();
const activeGame = ref(null);

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

// 游戏组件映射
const gameComponents = {
  snake: SnakeGame,
  '2048': Game2048,
  minesweeper: Minesweeper,
  tictactoe: TicTacToe,
  tetris: Tetris,
  breakout: Breakout,
  sequence: SequenceMemory,
  number: NumberMemory,
  chimp: ChimpTest,
  leaderboard: Leaderboard
};

const currentGameComponent = computed(() => {
  return activeGame.value ? gameComponents[activeGame.value] : null;
});

const getGameName = (id) => {
  if (id === 'leaderboard') return '排行榜';
  const game = games.find(g => g.id === id);
  return game ? game.name : "";
};

const closeGameCenter = () => {
    store.gameOpenState = false;
    activeGame.value = null; // Reset to menu on close
}

// 监听 store.activeGameId 变化 (如果有外部触发)
watch(() => store.activeGameId, (newId) => {
    if(newId) activeGame.value = newId;
});

</script>

<style lang="scss" scoped>
.game-center {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .game-modal {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          
          .back-btn {
              cursor: pointer;
              opacity: 0.8;
              &:hover { opacity: 1; }
          }
      }
      
      .title {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
      }
      
      .close-btn {
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
      }
    }

    .game-content {
      width: 100%;
      min-height: 400px;
      display: flex;
      justify-content: center;
      
      .loading {
        color: white;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .game-menu {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 20px;
          width: 100%;
          justify-items: center;
          align-content: start;
          padding-top: 20px;
          
          .game-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transition: transform 0.2s;
              background: rgba(255,255,255,0.1);
              padding: 15px;
              border-radius: 10px;
              width: 100px;
              
              &:hover {
                  transform: scale(1.05);
                  background: rgba(255,255,255,0.2);
              }
              
              .game-icon {
                  width: 50px;
                  height: 50px;
                  margin-bottom: 10px;
              }
              
              .game-name {
                  color: white;
                  font-weight: bold;
              }
          }
      }
    }
  }
}
</style>
