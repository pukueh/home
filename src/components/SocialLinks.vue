<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <template v-for="item in socialLinks" :key="item.name">
        <!-- 微信特殊处理：点击弹出二维码 -->
        <a
          v-if="item.name === 'WeChat'"
          @click="showWeChatQR = true"
          @mouseenter="socialTip = item.tip"
          @mouseleave="socialTip = '通过这里联系我吧'"
        >
          <Icon size="24" class="icon">
            <Wechat theme="filled" fill="#fff" />
          </Icon>
        </a>
        <!-- 普通链接 -->
        <a
          v-else
          :href="item.url"
          :target="item.url.startsWith('mailto:') ? '_self' : '_blank'"
          @mouseenter="socialTip = item.tip"
          @mouseleave="socialTip = '通过这里联系我吧'"
        >
          <img class="icon" :src="item.icon" height="24" />
        </a>
      </template>
      <!-- 游戏中心入口 -->
      <a
        @click="store.gameOpenState = true"
        @mouseenter="socialTip = '累了吗，来玩会儿游戏吧'"
        @mouseleave="socialTip = '通过这里联系我吧'"
      >
        <Icon size="24" class="icon">
          <Gamepad theme="filled" fill="#fff" />
        </Icon>
      </a>
    </div>
    <span class="tip">{{ socialTip }}</span>
    
    <!-- 微信二维码弹窗 -->
    <div v-if="showWeChatQR" class="wechat-modal" @click="showWeChatQR = false">
      <div class="modal-content" @click.stop>
        <h3>扫码添加微信</h3>
        <img src="/images/wechat-qr.webp" alt="微信二维码" />
        <p>请使用微信扫一扫</p>
        <button @click="showWeChatQR = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import socialLinks from "@/assets/socialLinks.json";
import { mainStore } from "@/store";
import { Gamepad, Wechat } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";

const store = mainStore();

// 社交链接提示
const socialTip = ref("通过这里联系我吧");

// 微信二维码弹窗状态
const showWeChatQR = ref(false);
</script>

<style lang="scss" scoped>
.social {
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
  
  // 微信二维码弹窗样式
  .wechat-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    
    .modal-content {
      background: #1a1a2e;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      
      h3 {
        margin: 0 0 20px;
        font-size: 1.2rem;
      }
      
      img {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        background: white;
        padding: 10px;
      }
      
      p {
        margin: 15px 0;
        opacity: 0.7;
        font-size: 0.9rem;
      }
      
      button {
        padding: 8px 24px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        &:hover {
          background: #2563eb;
        }
      }
    }
  }
}
</style>
