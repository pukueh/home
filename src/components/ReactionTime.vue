<template>
  <div 
    class="reaction-time" 
    :class="state"
    @click="handleClick"
  >
    <div class="content">
      <div class="icon" v-if="state !== 'waiting'">
        <span v-if="state === 'ready'">...</span>
        <span v-if="state === 'now'">!!!</span>
        <span v-if="state === 'finished'">⏱️</span>
      </div>
      <div class="message">{{ message }}</div>
      <div class="score" v-if="state === 'finished'">{{ score }} ms</div>
      <div class="sub-message" v-if="state === 'waiting'">点击任意位置开始</div>
      <div class="sub-message" v-if="state === 'finished'">点击继续测试</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const state = ref('waiting'); // waiting, ready, now, finished, too-early
const startTime = ref(0);
const score = ref(0);
let timeout = null;

const message = computed(() => {
  switch (state.value) {
    case 'waiting': return '反应时间测试';
    case 'ready': return '等待变绿...';
    case 'now': return '点击!';
    case 'finished': return '测试结果';
    case 'too-early': return '太快了!';
    default: return '';
  }
});

const handleClick = () => {
  if (state.value === 'waiting' || state.value === 'finished' || state.value === 'too-early') {
    startTest();
  } else if (state.value === 'ready') {
    tooEarly();
  } else if (state.value === 'now') {
    finishTest();
  }
};

const startTest = () => {
  state.value = 'ready';
  const delay = 2000 + Math.random() * 3000;
  timeout = setTimeout(() => {
    state.value = 'now';
    startTime.value = Date.now();
  }, delay);
};

const tooEarly = () => {
  state.value = 'too-early';
  clearTimeout(timeout);
};

const finishTest = () => {
  const endTime = Date.now();
  score.value = endTime - startTime.value;
  state.value = 'finished';
};
</script>

<style lang="scss" scoped>
.reaction-time {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border-radius: 12px;
  transition: background-color 0.2s;
  color: white;
  
  &.waiting { background-color: #2b87d1; }
  &.ready { background-color: #ce2636; }
  &.now { background-color: #4bdb6a; }
  &.finished { background-color: #2b87d1; }
  &.too-early { background-color: #2b87d1; }
  
  .content {
    text-align: center;
    pointer-events: none;
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .message {
      font-size: 3rem;
      font-weight: bold;
    }
    
    .score {
      font-size: 4rem;
      font-weight: bold;
      margin: 20px 0;
    }
    
    .sub-message {
      font-size: 1.5rem;
      opacity: 0.8;
      margin-top: 10px;
    }
  }
}
</style>
