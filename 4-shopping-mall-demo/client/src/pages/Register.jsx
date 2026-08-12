import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { EyeIcon } from '../components/Icons';
import { apiFetch } from '../api/apiClient';
import { DEFAULT_USER_TYPE } from '../constants/userTypes';
import { isValidEmail, isValidPassword, PASSWORD_HINT } from '../utils/validation';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = agreements.terms && agreements.privacy && agreements.marketing;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAgreeAll = (checked) => {
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreeOne = (key, checked) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }));
  };

  /**
   * 회원가입 제출 흐름:
   * 1) 이 폼에서 POST /api/users
   * 2) server/src/index.js → app.js → routes/user.js (router.post)
   * 3) controllers/userController.js 의 createUser → MongoDB User 저장
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('이름, 이메일, 비밀번호는 필수입니다.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('올바른 이메일 형식을 입력해 주세요.\n(예: user@example.com)');
      return;
    }

    if (!isValidPassword(form.password)) {
      setError('비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      setError('필수 약관에 동의해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      // User 스키마 필드에 맞춰 서버로 전송
      const result = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          user_type: DEFAULT_USER_TYPE,
        }),
      });

      if (!result.success) {
        throw new Error(result.message || '회원가입에 실패했습니다.');
      }

      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout showFooter={false} mainClassName="register">
        <form className="register__card" onSubmit={handleSubmit} noValidate>
          <header className="register__header">
            <h1>회원가입</h1>
            <p>새로운 계정을 만들어 쇼핑을 시작하세요</p>
          </header>

          <div className="register__field">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="이름"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="register__field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="register__field">
            <label htmlFor="password">비밀번호</label>
            <div className="register__password">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register__eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <EyeIcon open={showPassword} size={20} />
              </button>
            </div>
          </div>

          <div className="register__field">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <div className="register__password">
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={form.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register__eye"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <EyeIcon open={showPasswordConfirm} size={20} />
              </button>
            </div>
            <p className="register__hint">{PASSWORD_HINT}</p>
          </div>

          <div className="register__agreements">
            <label className="register__check">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => handleAgreeAll(e.target.checked)}
              />
              <span>전체 동의</span>
            </label>

            <label className="register__check register__check--row">
              <span className="register__check-left">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={(e) => handleAgreeOne('terms', e.target.checked)}
                />
                <span>이용약관 동의 (필수)</span>
              </span>
              <button type="button" className="register__view">보기</button>
            </label>

            <label className="register__check register__check--row">
              <span className="register__check-left">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => handleAgreeOne('privacy', e.target.checked)}
                />
                <span>개인정보처리방침 동의 (필수)</span>
              </span>
              <button type="button" className="register__view">보기</button>
            </label>

            <label className="register__check">
              <input
                type="checkbox"
                checked={agreements.marketing}
                onChange={(e) => handleAgreeOne('marketing', e.target.checked)}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>

          {error && <p className="register__error">{error}</p>}

          <button type="submit" className="register__submit" disabled={submitting}>
            {submitting ? '가입 중...' : '회원가입'}
          </button>

          <p className="register__login">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
    </ShopLayout>
  );
}

export default Register;
