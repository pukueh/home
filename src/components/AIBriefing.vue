<template>
  <div
    class="ai-briefing cards"
    v-show="!store.musicOpenState"
    @mouseenter="openMusicShow = true"
    @mouseleave="openMusicShow = false"
    @click.stop
  >
    <!-- 打开音乐面板 -->
    <Transition name="el-fade-in-linear">
      <div
        class="open-music"
        v-show="openMusicShow && store.musicIsOk"
        @click="store.musicOpenState = true"
      >
        <music-menu theme="filled" size="18" fill="#efefef" />
        <span>打开音乐播放器</span>
      </div>
    </Transition>
    
    <!-- 简报预览 - 点击展开 -->
    <div class="preview" @click="showModal = true">
      <div class="title">
        <span class="icon">📰</span>
        <span>每日 AI 简报</span>
      </div>
      <div class="subtitle">
        GitHub 热门 · ArXiv 论文
      </div>
      <div class="hint">点击查看详情 →</div>
    </div>
  </div>
  
  <!-- 弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="briefing-modal" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>📰 每日 AI 简报</h3>
            <span class="close" @click="showModal = false">✕</span>
          </div>
          
          <!-- 标签切换 -->
          <div class="tabs">
            <span 
              :class="{ active: activeTab === 'github' }" 
              @click="activeTab = 'github'"
            >🔥 GitHub 热门</span>
            <span 
              :class="{ active: activeTab === 'arxiv' }" 
              @click="activeTab = 'arxiv'"
            >📄 ArXiv 论文</span>
          </div>
          
          <!-- 内容区 -->
          <div class="list-area">
            <div v-if="loading" class="loading">加载中...</div>
            
            <template v-else>
              <!-- GitHub Trending -->
              <div v-if="activeTab === 'github'" class="list">
                <a 
                  v-for="(item, index) in githubData" 
                  :key="item.id"
                  :href="item.html_url"
                  target="_blank"
                  class="item"
                >
                  <span class="rank">{{ index + 1 }}</span>
                  <div class="info">
                    <div class="name">{{ item.full_name }}</div>
                    <div class="desc">{{ item.description?.slice(0, 80) || '暂无描述' }}</div>
                  </div>
                  <span class="stars">⭐ {{ formatNumber(item.stargazers_count) }}</span>
                </a>
              </div>
              
              <!-- ArXiv Papers -->
              <div v-if="activeTab === 'arxiv'" class="list">
                <a 
                  v-for="(item, index) in arxivData" 
                  :key="item.id"
                  :href="item.link"
                  target="_blank"
                  class="item"
                >
                  <span class="rank">{{ index + 1 }}</span>
                  <div class="info">
                    <div class="name">{{ item.title }}</div>
                    <div class="desc">{{ item.authors?.join(', ') || 'Unknown' }}</div>
                  </div>
                </a>
              </div>
            </template>
          </div>
          
          <div class="modal-footer">
            <span class="refresh" @click="refresh">🔄 刷新数据</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { MusicMenu } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();

const openMusicShow = ref(false);
const showModal = ref(false);
const activeTab = ref('github');
const loading = ref(true);
const githubData = ref([]);
const arxivData = ref([]);

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 获取 GitHub Trending (使用 Search API 模拟)
const fetchGitHub = async () => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateStr = date.toISOString().split('T')[0];
    
    const res = await fetch(
      `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=10`
    );
    const data = await res.json();
    githubData.value = data.items || [];
  } catch (error) {
    console.error('GitHub API Error:', error);
    githubData.value = [];
  }
};

// 获取 ArXiv 最新 AI 论文
const fetchArxiv = async () => {
  try {
    const res = await fetch(
      '/api/arxiv/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10'
    );
    const text = await res.text();
    
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const entries = xml.querySelectorAll('entry');
    
    arxivData.value = Array.from(entries).map(entry => ({
      id: entry.querySelector('id')?.textContent,
      title: entry.querySelector('title')?.textContent?.replace(/\n/g, ' ').trim(),
      link: entry.querySelector('id')?.textContent,
      authors: Array.from(entry.querySelectorAll('author name')).map(a => a.textContent)
    }));
  } catch (error) {
    console.error('ArXiv API Error:', error);
    arxivData.value = [];
  }
};

// 刷新数据
const refresh = async () => {
  loading.value = true;
  await Promise.all([fetchGitHub(), fetchArxiv()]);
  loading.value = false;
};

onMounted(() => {
  refresh();
});
</script>

<style lang="scss" scoped>
.ai-briefing {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: fade 0.5s;
  position: relative;
  
  .open-music {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00000026;
    padding: 4px 0;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
      margin-right: 8px;
    }
    span {
      font-size: 0.9rem;
    }
  }
  
  .preview {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.02);
    }
    
    .title {
      font-size: 1.2rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .icon {
        font-size: 1.4rem;
      }
    }
    
    .subtitle {
      margin-top: 8px;
      font-size: 0.9rem;
      opacity: 0.7;
    }
    
    .hint {
      margin-top: 12px;
      font-size: 0.8rem;
      opacity: 0.5;
    }
  }
}

// 弹窗样式
.briefing-modal {
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
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      h3 {
        margin: 0;
        font-size: 1.2rem;
      }
      
      .close {
        cursor: pointer;
        opacity: 0.6;
        font-size: 1.2rem;
        &:hover { opacity: 1; }
      }
    }
    
    .tabs {
      display: flex;
      gap: 10px;
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      span {
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        opacity: 0.6;
        transition: all 0.2s;
        
        &.active {
          opacity: 1;
          background: rgba(255, 255, 255, 0.15);
        }
        
        &:hover {
          opacity: 0.9;
        }
      }
    }
    
    .list-area {
      flex: 1;
      overflow-y: auto;
      padding: 15px 20px;
      
      .loading {
        text-align: center;
        padding: 30px;
        opacity: 0.7;
      }
      
      .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        
        .item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          text-decoration: none;
          color: inherit;
          transition: background 0.2s;
          
          &:hover {
            background: rgba(255, 255, 255, 0.12);
          }
          
          .rank {
            font-size: 0.85rem;
            font-weight: bold;
            opacity: 0.4;
            min-width: 24px;
            text-align: center;
          }
          
          .info {
            flex: 1;
            min-width: 0;
            
            .name {
              font-size: 0.95rem;
              font-weight: 500;
              line-height: 1.4;
            }
            
            .desc {
              font-size: 0.8rem;
              opacity: 0.6;
              margin-top: 4px;
              line-height: 1.3;
            }
          }
          
          .stars {
            font-size: 0.8rem;
            opacity: 0.8;
            white-space: nowrap;
          }
        }
      }
    }
    
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      
      .refresh {
        cursor: pointer;
        font-size: 0.9rem;
        opacity: 0.6;
        &:hover { opacity: 1; }
      }
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
