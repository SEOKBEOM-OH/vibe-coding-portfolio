import { apiFetch } from './apiClient';

/**
 * 주문 API (JWT 필수)
 * createOrder: 결제 성공 후 impUid/merchantUid 포함해서 POST
 * getOrders: 고객은 scope=mine, 관리자는 scope=all
 */

/** POST /api/orders — 장바구니 기반 주문 생성 */
export function createOrder(payload) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** GET /api/orders — scope: 'mine'(기본) | 'all'(admin 전체) */
export function getOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.user) qs.set('user', params.user);
  if (params.scope) qs.set('scope', params.scope);
  const query = qs.toString();
  return apiFetch(`/api/orders${query ? `?${query}` : ''}`);
}

/** GET /api/orders/:id */
export function getOrderById(id) {
  return apiFetch(`/api/orders/${id}`);
}

/** PUT /api/orders/:id — 주문 수정 (상태 변경 등) */
export function updateOrder(id, payload) {
  return apiFetch(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
