import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthChecking } from './AuthGuard';

/**
 * 비로그인(게스트) 전용 라우트
 * 로그인 / 회원가입처럼 "이미 로그인한 사람은 볼 필요 없는" 페이지에 사용
 *
 * 사용 예:
 *   <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
 *
 * 흐름:
 *  1) loading → 확인 중
 *  2) 이미 로그인 → 홈(/) 으로 이동
 *  3) 비로그인 → children(로그인 폼 등)
 */
function GuestRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <AuthChecking />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestRoute;
