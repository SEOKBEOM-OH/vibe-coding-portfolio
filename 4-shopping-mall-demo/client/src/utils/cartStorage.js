/**
 * 예전 로컬 장바구니 키 (지금은 서버 Cart 사용)
 * 로그인 시 잔여 로컬 데이터를 지우기 위해 유지
 */
const CART_KEY = 'cos_cart';

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCartStorage() {
  localStorage.removeItem(CART_KEY);
}
