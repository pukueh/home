<template>
  <!-- 游戏链接 -->
  <div class="game-links">
    <div class="link">
      <a
        v-for="game in games"
        :key="game.id"
        @click="openGame(game.id)"
        @mouseenter="gameTip = game.name"
        @mouseleave="gameTip = '来玩个小游戏吧'"
      >
        <img class="icon" :src="game.icon" height="24" />
      </a>
    </div>
    <span class="tip">{{ gameTip }}</span>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { mainStore } from "@/store";

// 导入本地图标
import snakeIcon from "@/assets/icons/snake.svg";
import icon2048 from "@/assets/icons/2048.svg";

const store = mainStore();

// 游戏提示
const gameTip = ref("来玩个小游戏吧");

// 游戏列表
const games = [
  { id: "snake", name: "贪吃蛇", icon: snakeIcon },
  { id: "2048", name: "2048", icon: icon2048 }
];

// 打开游戏
const openGame = (gameId) => {
  store.activeGameId = gameId;
  store.gameOpenState = true;
};
</script>

<style lang="scss" scoped>
.game-links {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 460px;
  width: 100%;
  height: 42px;
  background-color: transparent;
  border-radius: 6px;
  backdrop-filter: blur(0);
  animation: fade 0.5s;
  transition:
    background-color 0.3s,
    backdrop-filter 0.3s;
  @media (max-width: 840px) {
    max-width: 100%;
    justify-content: center;
    .link {
      justify-content: space-evenly !important;
      width: 90%;
    }
    .tip {
      display: none !important;
    }
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    a {
      display: inherit;
      cursor: pointer;
      .icon {
        margin: 0 12px;
        transition: transform 0.3s;
        &:hover {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(1);
        }
      }
    }
  }
  .tip {
    display: none;
    margin-right: 12px;
    animation: fade 0.5s;
  }
  @media (min-width: 768px) {
    &:hover {
      background-color: #00000040;
      backdrop-filter: blur(5px);
      .tip {
        display: block;
      }
    }
  }
}
</style>
