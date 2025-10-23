import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
   base: "./", // ✅ 요거 추가!
  plugins: [react()],
   server: {
    host: true,         // 0.0.0.0 바인딩 (nip.io 접근 가능)
    port: 5175,
    allowedHosts: [     // ✅ nip.io 도메인 허용
      "app3.127.0.0.1.nip.io"
    ],
    proxy: {
      '/api': {
        target: 'http://diary.127.0.0.1.nip.io:8084', // 실제 API 서버 주소
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),  // 여기서 '@/'를 src로 지정
    } ,
  },
});