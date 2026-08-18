import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 설정 (로컬 개발 서버 ≈ 내장 톰캣 + 리버스 프록시)
 *
 * port 3000 = 화면 주소
 * /api 프록시 → localhost:5000 (개발 중에 CORS를 피하려고 서버가 대신 호출)
 * 배포(Vercel)에는 이 프록시가 없음 → VITE_API_URL 에 Cloudtype 주소를 넣어야 함
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
