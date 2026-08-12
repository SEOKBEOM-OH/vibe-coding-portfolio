/**
 * 폼 유효성 검사 규칙 / 헬퍼
 * Login · Register 등에서 공통 사용
 */

/** 간단한 이메일 형식 (로컬@도메인.TLD) */
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 비밀번호 규칙
 * - 8자 이상
 * - 영문, 숫자, 특수문자 각각 1개 이상
 */
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/** UI에 보여줄 비밀번호 안내 문구 */
export const PASSWORD_HINT = '8자 이상, 영문, 숫자, 특수문자 포함';

export function isValidEmail(email) {
  return EMAIL_RULE.test(String(email ?? '').trim());
}

export function isValidPassword(password) {
  return PASSWORD_RULE.test(String(password ?? ''));
}
