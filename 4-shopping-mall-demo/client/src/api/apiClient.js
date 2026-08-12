import { getToken } from '../utils/authStorage';

// .env 의 VITE_API_URL (예: http://localhost:5000)
// 비어 있으면 상대경로로 요청 → vite.config.js 의 /api 프록시가 서버로 전달
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * ============================================================
 * apiClient.js — 백엔드 API 공통 호출
 * ============================================================
 *
 * [인증과의 연결]
 * 1) authStorage.getToken() 으로 JWT를 꺼낸다
 * 2) 토큰이 있으면 헤더에 넣는다:
 *      Authorization: Bearer <token>
 * 3) 서버의 authenticateToken 미들웨어가 이 헤더를 보고 "누구의 요청인지" 판별한다
 *
 * [사용 예]
 *  - 로그인:   apiFetch('/api/users/login', { method: 'POST', body: ... })
 *  - 내 정보:  apiFetch('/api/users/me')  ← 토큰 필요
 *  - 회원가입: apiFetch('/api/users', { method: 'POST', body: ... })
 */
export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;

  // 로그인 후에만 값이 있음. 없으면 헤더에 Authorization을 안 붙임
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      // 토큰이 있을 때만 Bearer 헤더 추가 (보호된 API용)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // 4xx/5xx 이면 throw → 호출한 쪽의 catch / AuthContext.refreshUser catch 로 전달
  if (!response.ok) {
    throw new Error(
      (data && (data.message || data.error)) || 'API request failed'
    );
  }

  return data;
}
