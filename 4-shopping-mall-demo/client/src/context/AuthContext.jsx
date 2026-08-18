import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/apiClient';
import { clearAuth, getStoredUser, getToken, saveAuth } from '../utils/authStorage';
import { USER_TYPES } from '../constants/userTypes';

/**
 * 전역 로그인 상태 (HttpSession 대신 JWT + React Context)
 *
 * 앱 시작: 저장된 토큰이 있으면 GET /api/users/me 로 유저 복원
 * 로그인: login() → storage + state
 * 사용: const { user, isAdmin, logout } = useAuth()
 */

// Context 그릇 (실제 값은 Provider가 채워 줌)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 현재 로그인한 유저 (없으면 null)
  const [user, setUser] = useState(null);

  // 앱 켜자마자 "토큰 검사 중"인지
  // 토큰이 있으면 true로 시작 → /me 응답 오기 전에 잘못된 UI가 깜빡이지 않게
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  /** 로그아웃: 브라우저 저장소 + React state 둘 다 비움 */
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  /**
   * 로그인 성공 직후 호출
   * - storage에 token/user 저장
   * - React state의 user도 바로 갱신 (다음 화면에서 환영 메시지 등 표시)
   */
  const login = useCallback((token, userData, remember = true) => {
    saveAuth(token, userData, remember);
    setUser(userData);
  }, []);

  /**
   * 토큰으로 최신 유저 정보 다시 가져오기
   * - 새로고침 후 복원
   * - 토큰이 만료/위조되면 서버가 401 → catch에서 clearAuth
   */
  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      // Authorization: Bearer <token> 은 apiFetch가 자동으로 붙임
      const result = await apiFetch('/api/users/me');
      const nextUser = result?.data || null;
      setUser(nextUser);

      // storage의 user 스냅샷도 서버 최신값으로 맞춤
      // localStorage에 token이 있으면 "로그인 유지"로 간주
      const remember = Boolean(localStorage.getItem('token'));
      if (nextUser) {
        saveAuth(token, nextUser, remember);
      }

      return nextUser;
    } catch {
      // 토큰 무효 → 깨끗이 로그아웃 상태로
      clearAuth();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 앱(또는 Provider)이 처음 뜰 때 1회: 저장된 토큰으로 로그인 복원 시도
  useEffect(() => {
    let cancelled = false; // 언마운트 후 setState 방지용 플래그

    const bootstrap = async () => {
      if (!getToken()) {
        // 토큰은 없는데 user만 남아 있는 찌꺼기 정리
        if (getStoredUser()) clearAuth();
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        await refreshUser();
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  // Provider로 내려줄 값 (하위 컴포넌트가 useAuth로 사용)
  const value = useMemo(
    () => ({
      user, // 유저 객체 { _id, name, email, user_type, ... }
      loading, // 초기 /me 확인 중이면 true
      isAuthenticated: Boolean(user), // 로그인 여부
      isAdmin: user?.user_type === USER_TYPES.ADMIN, // 관리자 여부
      login, // 로그인 성공 시 호출
      logout, // 로그아웃
      refreshUser, // 필요 시 수동으로 유저 다시 불러오기
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 하위 컴포넌트에서 인증 상태/함수를 꺼내 쓰는 훅
 * 예: const { user, logout, isAdmin } = useAuth();
 *
 * AuthProvider 밖에서 쓰면 에러 → App.jsx에서 Provider로 감쌌는지 확인
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
