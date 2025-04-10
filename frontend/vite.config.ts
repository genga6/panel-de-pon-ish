import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ← ココ！外部アクセス許可
    port: 5173,       // ← 5174でもOK
    strictPort: false,
  },
})
