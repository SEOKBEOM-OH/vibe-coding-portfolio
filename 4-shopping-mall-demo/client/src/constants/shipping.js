/**
 * 배송비 정책 (장바구니 · 체크아웃 · 서버와 동일하게 유지)
 * FREE_SHIPPING_MIN = 0 → 모든 주문 일반 배송 무료
 */
export const FREE_SHIPPING_MIN = 0;
export const STANDARD_SHIPPING_FEE = 3000;
export const EXPRESS_SHIPPING_FEE = 15000;
export const NEXT_DAY_SHIPPING_FEE = 25000;

/** 일반 배송비 — 무료 배송 기준 이상이면 0 */
export function getStandardShippingFee(subtotal) {
  const amount = Number(subtotal) || 0;
  return amount >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING_FEE;
}
