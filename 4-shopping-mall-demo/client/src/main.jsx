import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/form.css';
import App from './App.jsx';

/**
 * 프론트 진입점 (index.html #root 에 React 부착)
 * 흐름: index.html → main.jsx → App.jsx(라우터) → pages/*
 * JSP와 달리 서버는 HTML을 안 만들고, 이 JS가 브라우저에서 화면을 그린다.
 */

createRoot(document.getElementById('root')).render(
  // StrictMode: 개발 중 잠재 문제를 더 잘 잡아줌 (프로덕션에는 영향 없음)
  <StrictMode>
    <App />
  </StrictMode>
);
