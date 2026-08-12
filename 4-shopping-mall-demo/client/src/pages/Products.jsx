import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../api/products';
import { NAV_CATEGORIES } from '../data/navCategories';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';
import { HOME_COLLECTION_TITLE } from '../constants/site';
import './Products.css';

const PRODUCT_CATEGORY_IDS = new Set(PRODUCT_CATEGORIES.map((c) => c.value));

function categoryTitle(category) {
  if (!category) return HOME_COLLECTION_TITLE;
  const fromNav = NAV_CATEGORIES.find((c) => c.id === category);
  if (fromNav) return fromNav.label;
  return HOME_COLLECTION_TITLE;
}

/**
 * 상품 목록 페이지
 * /products?category=women|men|kids|accessories|sale|magazine
 */
function Products() {
  const [searchParams] = useSearchParams();
  const category = (searchParams.get('category') || '').toLowerCase();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // magazine 등 상품 enum 밖이면 API 호출 없이 빈 목록
        if (category && !PRODUCT_CATEGORY_IDS.has(category)) {
          if (!cancelled) setProducts([]);
          return;
        }

        const res = await getProducts(
          category ? { category } : undefined
        );
        if (!cancelled) setProducts(res.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '상품을 불러오지 못했습니다.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const title = categoryTitle(category);
  const isMagazine = category === 'magazine';

  return (
    <ShopLayout>
      <header className="shop__heading">
        <h1>{title}</h1>
        <p>
          {loading
            ? 'Loading…'
            : isMagazine
              ? '매거진 콘텐츠 준비 중'
              : `${products.length} products`}
        </p>
      </header>

      {error && <p className="shop__status shop__status--error">{error}</p>}
      {loading && <p className="shop__status">상품을 불러오는 중…</p>}
      {!loading && !error && products.length === 0 && (
        <p className="shop__status">
          {isMagazine
            ? '곧 매거진 콘텐츠가 업데이트됩니다.'
            : '등록된 상품이 없습니다.'}
        </p>
      )}
      {!loading && products.length > 0 && (
        <ProductGrid
          products={products}
          wishlist={wishlist}
          onToggleWish={toggleWishlist}
        />
      )}
    </ShopLayout>
  );
}

export default Products;
