import { useState } from 'react';
import { Link } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { apiFetch } from '../api/apiClient';
import { EyeIcon, LockIcon } from '../components/Icons';
import { isValidPassword, PASSWORD_HINT } from '../utils/validation';
import '../pages/Login.css';
import './ChangePassword.css';

/**
 * 비밀번호 변경 (로그인 필수)
 * PUT /api/users/me/password — 현재 비밀번호 확인 후 저장
 */
function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword || !form.newPasswordConfirm) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    if (!isValidPassword(form.newPassword)) {
      setError(PASSWORD_HINT);
      return;
    }

    if (form.newPassword !== form.newPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch('/api/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      if (!result.success) {
        throw new Error(result.message || '비밀번호 변경에 실패했습니다.');
      }

      setSuccess(result.message || '비밀번호가 변경되었습니다.');
      setForm({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout showFooter={false} mainClassName="login change-password">
      <form className="login__card" onSubmit={handleSubmit} noValidate>
        <header className="login__header">
          <h1>비밀번호 변경</h1>
          <p>현재 비밀번호 확인 후 새 비밀번호로 바꿉니다</p>
        </header>

        <div className="login__field">
          <label htmlFor="currentPassword">현재 비밀번호</label>
          <div className="login__input">
            <span className="login__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              placeholder="현재 비밀번호"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={showCurrent ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeIcon open={showCurrent} />
            </button>
          </div>
        </div>

        <div className="login__field">
          <label htmlFor="newPassword">새 비밀번호</label>
          <div className="login__input">
            <span className="login__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? 'text' : 'password'}
              placeholder={PASSWORD_HINT}
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeIcon open={showNew} />
            </button>
          </div>
        </div>

        <div className="login__field">
          <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
          <div className="login__input">
            <span className="login__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              type={showNew ? 'text' : 'password'}
              placeholder="새 비밀번호 다시 입력"
              value={form.newPasswordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="login__error">{error}</p>}
        {success && <p className="change-password__success">{success}</p>}

        <button type="submit" className="login__submit" disabled={submitting}>
          {submitting ? '변경 중...' : '비밀번호 변경'}
        </button>

        <p className="login__register">
          <Link to="/">홈으로</Link>
        </p>
      </form>
    </ShopLayout>
  );
}

export default ChangePassword;
