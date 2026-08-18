import { apiFetch } from './apiClient';

/**
 * 상품 API 래퍼 (페이지는 이 함수만 호출)
 * 실제 HTTP는 apiClient.js → Express /api/products
 */

/** POST /api/products — 상품 등록 (admin / seller, JWT 필수) */
export function createProduct(payload) {
  return apiFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** POST /api/products/bulk — 여러 상품 한 번에 등록 */
export function createProductsBulk(products) {
  return apiFetch('/api/products/bulk', {
    method: 'POST',
    body: JSON.stringify({ products }),
  });
}

/** GET /api/products — 상품 목록 */
export function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = query ? `/api/products?${query}` : '/api/products';
  return apiFetch(path);
}

/** GET /api/products/:id — 상품 상세 */
export function getProductById(id) {
  return apiFetch(`/api/products/${id}`);
}

/** DELETE /api/products/:id — 상품 삭제 (admin / seller) */
export function deleteProduct(id) {
  return apiFetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
}
