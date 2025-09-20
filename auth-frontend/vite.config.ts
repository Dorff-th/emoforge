import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true,         // 0.0.0.0 바인딩 (nip.io 접근 가능)
    port: 5173,
    allowedHosts: [     // ✅ nip.io 도메인 허용
      "app1.127.0.0.1.nip.io"
    ],
    proxy: {
      '/api': {
        target: 'http://auth.127.0.0.1.nip.io:8081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
     // ✅ 캐시 무효화 헤더 추가 (개발서버만)
    headers: {
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@store': path.resolve(__dirname, 'src/store'),
    },
  },
})
