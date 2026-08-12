/**
 * 상품 카테고리 (Product 스키마 enum과 동일, 다중 선택 가능)
 * 헤더 NAV의 매거진은 콘텐츠용이라 상품 카테고리에서 제외
 */
export const PRODUCT_CATEGORIES = [
  { value: 'women', label: '여성' },
  { value: 'men', label: '남성' },
  { value: 'kids', label: '키즈' },
  { value: 'accessories', label: '액세서리' },
  { value: 'sale', label: '세일' },
];

/** 상품이 해당 카테고리를 포함하는지 (문자열·배열 모두 지원) */
export function productHasCategory(product, category) {
  if (!product || !category) return false;
  const raw = product.category;
  if (Array.isArray(raw)) return raw.includes(category);
  return raw === category;
}

/** 표시용 카테고리 라벨 (쉼표 구분) */
export function formatProductCategories(product) {
  const raw = product?.category;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values
    .map((v) => PRODUCT_CATEGORIES.find((c) => c.value === v)?.label || v)
    .join(', ');
}
