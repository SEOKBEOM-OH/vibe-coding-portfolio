import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 개발 서버 설정
 *
 * - port 3000: React 앱 주소 (서버 CORS CLIENT_URL 과 동일)
 * - proxy /api: 브라우저가 /api 로 요청하면 localhost:5000 으로 대신 전달
 *   → CORS 이슈를 줄이고, 프론트에서 '/api' 상대경로로 호출 가능
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
