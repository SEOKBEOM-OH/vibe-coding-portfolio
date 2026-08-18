import { apiFetch } from './apiClient';

/**
 * 장바구니 API (JWT 필수) — CartContext가 주로 호출
 */

/** GET /api/cart */
export function getCart() {
  return apiFetch('/api/cart');
}

/** POST /api/cart/items — { productId, quantity } */
export function addCartItem(payload) {
  return apiFetch('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** PUT /api/cart/items/:itemId — { quantity } */
export function updateCartItem(itemId, quantity) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

/** DELETE /api/cart/items/:itemId */
export function removeCartItem(itemId) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

/** DELETE /api/cart */
export function clearCartApi() {
  return apiFetch('/api/cart', {
    method: 'DELETE',
  });
}
