import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, LockIcon, MailIcon } from '../components/Icons';
import { isValidEmail } from '../utils/validation';
import { SITE_NAME } from '../constants/site';
import './Login.css';

function GoogleIcon() {
  return (
    <span className="login__social-icon login__social-icon--google">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    </span>
  );
}

// FaceBook / Apple — 미사용
// function FacebookIcon() {
//   return (
//     <span className="login__social-icon login__social-icon--facebook">
//       <svg width="10" height="18" viewBox="0 0 10 18" aria-hidden="true">
//         <path
//           fill="#fff"
//           d="M6.5 18V9.8h2.8l.4-3.2H6.5V4.9c0-.9.3-1.5 1.6-1.5H9.8V.1C9.4.1 8.1 0 6.8 0 4 0 2.1 1.7 2.1 4.9v1.7H0v3.2h2.1V18h4.4z"
//         />
//       </svg>
//     </span>
//   );
// }

// function AppleIcon() {
//   return (
//     <span className="login__social-icon login__social-icon--apple">
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
//         <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
//       </svg>
//     </span>
//   );
// }

function KakaoIcon() {
  return (
    <span className="login__social-icon login__social-icon--kakao">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#3C1E1E"
          d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.88 5.33 4.68 6.73-.15.56-.96 3.55-1.11 3.99-.19.54.2.53.42.39.18-.11 2.86-1.95 3.3-2.25.88.13 1.79.2 2.71.2 5.52 0 10-3.58 10-8S17.52 3 12 3z"
        />
      </svg>
    </span>
  );
}

function NaverIcon() {
  return (
    <span className="login__social-icon login__social-icon--naver">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M16.273 12.845 7.376 0H0v24h7.726V11.155L16.624 24H24V0h-7.727v12.845z"
        />
      </svg>
    </span>
  );
}

/**
 * 로그인 페이지
 * POST /api/users/login → token 저장 → AuthContext.login()
 * 이미 로그인이면 GuestRoute가 / 로 보냄
 */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true); // true → localStorage에 토큰 저장
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  /**
   * 로그인 제출 흐름
   * 1) 이메일/비밀번호 유효성 검사
   * 2) POST /api/users/login → 서버가 JWT + 유저정보 반환
   * 3) login(token, data, remember) → AuthContext + storage 저장
   * 4) navigate('/') → 홈으로 이동 (Header가 user를 보고 환영 메시지 표시)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!result.success || !result.token) {
        throw new Error(result.message || '로그인에 실패했습니다.');
      }

      // 전역 상태에 반영 (Header 등 다른 화면도 즉시 로그인 UI로 바뀜)
      login(result.token, result.data, remember);
      navigate('/');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} 로그인은 준비 중입니다.`);
  };

  return (
    <main className="login">
      <Link to="/" className="login__brand">
        {SITE_NAME}
      </Link>

      <form className="login__card" onSubmit={handleSubmit} noValidate>
        <header className="login__header">
          <h1>로그인</h1>
          <p>계정에 로그인하여 쇼핑을 시작하세요</p>
        </header>

        <div className="login__field">
          <label htmlFor="email">이메일</label>
          <div className="login__input">
            <span className="login__icon" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="login__field">
          <label htmlFor="password">비밀번호</label>
          <div className="login__input">
            <span className="login__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div className="login__options">
          <label className="login__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>로그인 상태 유지</span>
          </label>
          <button
            type="button"
            className="login__forgot"
            onClick={() => alert('비밀번호 찾기는 준비 중입니다.')}
          >
            비밀번호 찾기
          </button>
        </div>

        {error && <p className="login__error">{error}</p>}

        <button type="submit" className="login__submit" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>

        <div className="login__divider" role="separator">
          <span>또는</span>
        </div>

        <div className="login__social">
          <button type="button" className="login__social-btn" onClick={() => handleSocialLogin('Google')}>
            <GoogleIcon />
            Google로 로그인
          </button>
          {/* FaceBook / Apple — 미사용
          <button type="button" className="login__social-btn" onClick={() => handleSocialLogin('FaceBook')}>
            <FacebookIcon />
            FaceBook으로 로그인
          </button>
          <button type="button" className="login__social-btn" onClick={() => handleSocialLogin('Apple')}>
            <AppleIcon />
            Apple로 로그인
          </button>
          */}
          <button type="button" className="login__social-btn" onClick={() => handleSocialLogin('카카오톡')}>
            <KakaoIcon />
            카카오톡으로 로그인
          </button>
          <button type="button" className="login__social-btn" onClick={() => handleSocialLogin('네이버')}>
            <NaverIcon />
            네이버로 로그인
          </button>
        </div>

        <p className="login__register">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
