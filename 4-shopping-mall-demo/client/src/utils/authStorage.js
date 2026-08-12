/**
 * ============================================================
 * 인증 정보 저장소 헬퍼 (authStorage)
 * ============================================================
 *
 * [왜 필요한가?]
 * 로그인 성공 시 서버가 JWT(token)를 내려준다.
 * 새로고침 해도 로그인 상태를 유지하려면 브라우저에 저장해야 한다.
 *
 * [어디에 저장하나?]
 * - localStorage  : 탭을 닫아도 유지 (로그인 상태 유지 ON)
 * - sessionStorage: 탭을 닫으면 삭제 (로그인 상태 유지 OFF)
 *
 * [전체 인증 흐름에서의 위치]
 *  Login 성공 → saveAuth()로 저장
 *  API 요청   → getToken()으로 꺼내 Authorization 헤더에 첨부
 *  로그아웃   → clearAuth()로 삭제
 */

/** 저장된 JWT 토큰 읽기 (local → session 순서로 찾음) */
export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * 저장된 유저 JSON 읽기
 * - 화면을 빠르게 그리기 위한 스냅샷용
 * - 진짜 신뢰할 유저 정보는 AuthContext가 /api/users/me 로 다시 확인한다
 */
export function getStoredUser() {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // 깨진 JSON이면 없는 것으로 취급
    return null;
  }
}

/**
 * 로그인 성공 후 토큰 + 유저 정보 저장
 * @param {string} token   - 서버가 발급한 JWT
 * @param {object} user    - 비밀번호 제외된 유저 객체
 * @param {boolean} remember - true면 localStorage, false면 sessionStorage
 *
 * 한쪽 storage에만 넣기 위해, 반대쪽 storage의 이전 값은 지운다.
 * (예: 예전에 session에 있던 토큰이 남아 충돌하지 않게)
 */
export function saveAuth(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
  other.removeItem('token');
  other.removeItem('user');
}

/** 로그아웃 / 토큰 만료 시 — 양쪽 storage 모두 비움 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}
