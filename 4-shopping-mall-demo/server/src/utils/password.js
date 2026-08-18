/** 회원가입·비밀번호 변경 공통 규칙 (클라이언트 validation.js 와 동일) */
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const PASSWORD_HINT = '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.';

const isValidPassword = (password) => PASSWORD_RULE.test(String(password ?? ''));

module.exports = {
  PASSWORD_RULE,
  PASSWORD_HINT,
  isValidPassword,
};
