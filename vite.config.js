/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/, // js / css 静态资源缓存
              handler: "CacheFirst",
              options: {
                cacheName: "js-css-cache",
              },
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/, // 图片缓存
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
              },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            {
              src: "/images/icon/48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "/images/icon/72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "/images/icon/96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "/images/icon/128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "/images/icon/144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "/images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "3001",
      open: true,
      proxy: {
        "/api/oioweather": {
          target: "https://api.oioweb.cn",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/oioweather/, ""),
        },
        "/api/meting": {
          target: "https://api.i-meto.com/meting",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/meting/, ""),
        },
        "/api/amap": {
          target: "https://restapi.amap.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/amap/, ""),
        },
        "/api/qqmap": {
          target: "https://apis.map.qq.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/qqmap/, ""),
        },
        "/api/freeip": {
          target: "https://freeipapi.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/freeip/, ""),
        },
        "/api/openmeteo": {
          target: "https://api.open-meteo.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openmeteo/, ""),
        },
        "/api/arxiv": {
          target: "https://export.arxiv.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/arxiv/, ""),
        },
        "/api/7timer": {
          target: "https://www.7timer.info",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/7timer/, ""),
        },
      },
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          additionalData: `@import "./src/style/global.scss";`,
        },
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'pinia', 'pinia-plugin-persistedstate', 'dayjs'],
            'element-plus': ['element-plus'],
            'icons': ['@icon-park/vue-next', '@vicons/utils', '@vicons/fa'],
            'aplayer': ['@worstone/vue-aplayer', 'aplayer'],
            'swiper': ['swiper'],
          }
        }
      }
    },
  });
