import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 설정: React(JSX) 플러그인만 사용
export default defineConfig({
  plugins: [react()],
})
