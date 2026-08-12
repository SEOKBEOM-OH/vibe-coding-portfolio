/**
 * 유저 유형 (서버 User 스키마 user_type 과 동일)
 * customer | admin | seller
 */
export const USER_TYPES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SELLER: 'seller',
};

/** 회원가입 시 기본값 */
export const DEFAULT_USER_TYPE = USER_TYPES.CUSTOMER;
