import { getToken } from '../utils/authStorage';

// .env 의 VITE_API_URL (예: http://localhost:5000)
// 비어 있으면 상대경로로 요청 → vite.config.js 의 /api 프록시가 서버로 전달
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * API 공통 호출 (RestTemplate / axios 한곳)
 *
 * 1) localStorage 의 JWT 를 Authorization 헤더에 붙임
 * 2) VITE_API_URL + path 로 fetch
 * 3) 4xx/5xx 면 throw → 화면 catch 에서 에러 표시
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
