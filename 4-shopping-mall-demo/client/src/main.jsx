import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/form.css';
import App from './App.jsx';

/**
 * React 앱 진입점 (index.html 의 #root 에 마운트)
 *
 * 흐름:
 *   index.html → main.jsx → App.jsx(라우터) → pages/Home.jsx 등
 */
createRoot(document.getElementById('root')).render(
  // StrictMode: 개발 중 잠재 문제를 더 잘 잡아줌 (프로덕션에는 영향 없음)
  <StrictMode>
    <App />
  </StrictMode>
);
