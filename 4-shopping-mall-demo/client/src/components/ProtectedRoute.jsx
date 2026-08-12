import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthChecking } from './AuthGuard';

/**
 * 로그인 필수 라우트
 *
 * 사용 예:
 *   <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
 *
 * 흐름:
 *  1) AuthProvider loading 중 → 확인 중 화면
 *  2) 비로그인 → /login 으로 이동
 *  3) 로그인됨 → children(실제 페이지) 렌더
 */
function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <AuthChecking />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
