import { apiFetch } from './apiClient';

/**
 * 상품 API
 *
 * 등록 흐름:
 *   client → POST /api/products
 *   → app.js (productRoutes)
 *   → routes/product.js (authenticateToken + authorize)
 *   → controllers/productController.createProduct
 *   → models/Product.js → MongoDB 저장
 */

/** POST /api/products — 상품 등록 (admin / seller, JWT 필수) */
export function createProduct(payload) {
  return apiFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
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
