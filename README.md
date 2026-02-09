<div align="center">
<img src="/public/images/icon/logo.png" alt="Logo" width="100" />

# Pukueh's Home Page

一个简洁、美观、功能强大的个人主页

![License](https://img.shields.io/github/license/pukueh/home?style=flat-square)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite)
</div>

## 📖 简介

本项目基于 [imsyy/home](https://github.com/imsyy/home) 二次开发，保留了原项目的优秀设计，并进行了深度的功能扩展和性能优化。新增了 **AI 简报**、**游戏中心**、**本地排行榜** 等功能，旨在打造一个既好看又好用的引导页。

## 🎉 特色功能

### 🌟 核心增强
- **📰 AI 每日简报**: 实时聚合 **GitHub Trending** (热门开源项目) 和 **ArXiv** (最新 AI 论文)，替代传统的"一言"，让您时刻掌握技术前沿。
- **🎮 游戏中心**: 内置 9 款经典小游戏（贪吃蛇、2048、扫雷、俄罗斯方块等），支持 **本地排行榜** 记录高分，工作之余放松心情。
- **🚀 极致性能**: 图片全量 **WebP** 化，组件懒加载 (Code Splitting)，首屏加载速度提升 50%+。


### 基础功能 (继承自原项目)
- 载入动画
- 日期及时间显示
- 实时天气 (高德/教书先生 API)
- 时光进度条
- 音乐播放器 (支持网易云/QQ音乐歌单)
- 移动端适配 (PWA 支持)

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/)
- **构建工具**: [Vite 4](https://vitejs.dev/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) + 持久化插件
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **图标库**: [IconPark](https://iconpark.bytedance.com/) + [xicons](https://www.xicons.org/)
- **样式预处理**: SCSS

## ⚙️ 自动构建 (GitHub Actions)

本项目已配置 GitHub Actions 自动构建工作流。

1. **Fork 本仓库** 到您的 GitHub账号。
2. 在您的仓库中 **启用 Actions** (Settings -> Actions -> General -> Allow all actions / 或在 Actions 页面点击启用)。
3. **修改任意文件** 并提交推送 (Push) 到 `main`, `master` 或 `dev` 分支。
4. GitHub Actions 会自动触发构建。
5. 构建完成后，在 Actions 页面对应的 workflow 运行记录下方，可以下载 `dist` 压缩包 (Artifacts)。
6. 将解压后的 `dist` 文件夹内容上传至您的服务器即可。

## 🚀 快速开始

### 环境要求
- Node.js > 16.0
- pnpm > 8.0 (推荐)

### 安装
```bash
# 克隆项目
git clone https://github.com/pukueh/home.git

# 进入目录
cd home

# 安装依赖
pnpm install
```

### 运行
```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build
```

### Docker 部署
```bash
# 构建镜像
docker build -t my-home .

# 运行容器
docker run -p 3000:3000 -d my-home
```

## ⚙️ 配置说明

复制 `.env.example` 为 `.env` 并按照以下说明修改配置：

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_SITE_NAME` | 站点名称 | "Pukuehの主页" |
| `VITE_SITE_AUTHOR` | 作者名称 | "Pukueh" |
| `VITE_WEATHER_KEY` | 高德地图 Web 服务 Key | "your_amap_key" |
| `VITE_SONG_SERVER` | 音乐平台 (netease/tencent) | "netease" |
| `VITE_SONG_ID` | 歌单 ID | "123456" |

### 社交链接配置
修改 `src/assets/socialLinks.json`：
```json
[
  {
    "name": "WeChat",
    "icon": "wechat",
    "tip": "加个微信吧",
    "url": "#wechat-qr" 
  },
  // ... 其他链接
]
```
*注：WeChat 类型会自动触发二维码弹窗，请确保 `public/images/wechat-qr.webp` 存在。*

## � 目录结构

```
home/
├── public/          # 静态资源 (favicon, robots.txt)
├── src/
│   ├── api/         # API 接口封装
│   ├── assets/      # 静态资源 (图片, JSON 配置)
│   ├── components/  # Vue 组件
│   │   ├── AIBriefing.vue  # AI 简报组件
│   │   ├── GameCenter.vue  # 游戏中心
│   │   ├── SocialLinks.vue # 社交链接
│   │   └── ...
│   ├── store/       # Pinia 状态管理
│   ├── style/       # 全局样式 (SCSS)
│   ├── utils/       # 工具函数
│   ├── views/       # 页面视图
│   └── App.vue      # 根组件
└── vite.config.js   # Vite 配置 (含代理与优化)
```

## 🤝 致谢

感谢 [imsyy](https://github.com/imsyy) 提供的优秀开源项目 [home](https://github.com/imsyy/home)。

## 📄 License

[MIT](./LICENSE)
