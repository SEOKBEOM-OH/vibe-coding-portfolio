import ProductCard from './ProductCard';
import { getProductId } from '../utils/productDisplay';
import './ProductGrid.css';

/**
 * 상품 그리드
 * products 배열을 ProductCard 로 렌더링
 */
function ProductGrid({ products, wishlist, onToggleWish }) {
  return (
    <section className="product-grid" aria-label="상품 목록">
      {products.map((product, index) => {
        const id = getProductId(product);
        return (
          <ProductCard
            key={id}
            product={product}
            index={index}
            liked={wishlist.has(id)}
            onToggleWish={onToggleWish}
          />
        );
      })}
    </section>
  );
}

export default ProductGrid;
