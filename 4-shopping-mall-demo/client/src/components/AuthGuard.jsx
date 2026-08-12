import { Link } from 'react-router-dom';
import ShopLayout from './ShopLayout';
import './AuthGuard.css';

/**
 * 라우트 가드 공통 UI
 * - 토큰/권한 확인 중 로딩
 * - 권한 부족 안내
 */

export function AuthChecking({ message = '로그인 상태 확인 중...' }) {
  return (
    <ShopLayout showFooter={false}>
      <div className="auth-guard">
        <p>{message}</p>
      </div>
    </ShopLayout>
  );
}

export function AccessDenied({
  title = '접근 권한이 없습니다',
  description = '이 페이지를 볼 수 있는 권한이 없습니다.',
}) {
  return (
    <ShopLayout showFooter={false}>
      <div className="auth-guard auth-guard--center">
        <h1>{title}</h1>
        <p>{description}</p>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    </ShopLayout>
  );
}
