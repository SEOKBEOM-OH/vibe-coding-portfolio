import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDenied, AuthChecking } from './AuthGuard';

/**
 * 관리자(admin) 전용 라우트
 *
 * 사용 예:
 *   <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
 *
 * 흐름:
 *  1) loading → 권한 확인 중
 *  2) 비로그인 → /login
 *  3) 로그인이지만 admin 아님 → AccessDenied
 *  4) admin → children
 *
 * 서버 API에도 authorize('admin')이 있지만,
 * 프론트에서 먼저 막아 불필요한 화면 진입을 줄인다.
 */

function AdminRoute({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <AuthChecking message="권한 확인 중..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <AccessDenied title="접근 권한이 없습니다" description="어드민 계정으로만 이용할 수 있습니다."/>
    );
  }

  return children;
}

export default AdminRoute;
