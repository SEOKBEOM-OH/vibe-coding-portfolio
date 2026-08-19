/** API(_id) / 데모(id) 상품 식별자 */
export function getProductId(product) {
  return product?._id ?? product?.id;
}

/** 재고가 없거나 없으면 품절 */
export function isSoldOut(product) {
  return Number(product?.stock) <= 0;
}

/** 숫자 가격 → ₩ 포맷, 이미 문자열이면 그대로 */
export function formatProductPrice(price) {
  if (price == null || price === '') return '';
  if (typeof price === 'number') {
    return `₩${price.toLocaleString('ko-KR')}`;
  }
  return String(price);
}
