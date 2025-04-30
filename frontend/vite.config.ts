import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
  ],
  server: {
    host: '0.0.0.0',      // コンテナ外からアクセス可
    port: 5173,           // 好きなポートで OK（docker-compose と合わせる）
    strictPort: true,     // 5173 が塞がれていたら起動エラーにする
    watch: {
      usePolling: true,   // ホスト ↔︎ コンテナ間のファイル通知をポーリングに
      interval: 100,      // 変更検知間隔（ms）―体感で十分速い値に
    },
  },
})
