import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../api/products';
import { LANDING_CATEGORIES } from '../data/landingCategories';
import {
  LANDING_HERO_CTA,
  LANDING_HERO_SUB,
  LANDING_HERO_TITLE,
  LANDING_NEWSLETTER_SUB,
  LANDING_NEWSLETTER_TITLE,
  LANDING_TRENDING_SUB,
  LANDING_TRENDING_TITLE,
} from '../constants/site';
import './Home.css';

/**
 * 쇼핑몰 랜딩(메인) 페이지
 * GET /api/products 로 전체 상품 로드
 * SHOP NOW → /products
 */
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(() => new Set());
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // 판매 중 상품 전체
        const res = await getProducts();
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
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <ShopLayout mainClassName="home-landing">
      
      <section className="landing-hero">
        <h1>{LANDING_HERO_TITLE}</h1>
        <p>{LANDING_HERO_SUB}</p>
        <Link to="/products" className="landing-hero__cta">
          {LANDING_HERO_CTA}
        </Link>
      </section>

      <section className="landing-categories" aria-label="카테고리">
        {LANDING_CATEGORIES.map((cat) => (
          <Link key={cat.id} to={`/products?category=${cat.id}`} className="landing-category">
            <div className="landing-category__media">
              <img src={cat.image} alt={cat.label} loading="lazy" />
            </div>
            <span className="landing-category__label">{cat.label}</span>
          </Link>
        ))}
      </section>

      <section className="landing-trending">
        <header className="landing-trending__head">
          <h2>{LANDING_TRENDING_TITLE}</h2>
          <p>{LANDING_TRENDING_SUB}</p>
        </header>

        {loading && <p className="landing-trending__status">상품을 불러오는 중…</p>}
        {error && <p className="landing-trending__status landing-trending__status--error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="landing-trending__status">등록된 상품이 없습니다.</p>
        )}
        {!loading && products.length > 0 && (
          <ProductGrid products={products} wishlist={wishlist} onToggleWish={toggleWishlist} />
        )}

        <div className="landing-trending__more">
          <Link to="/products" className="landing-trending__link">
            전체 상품 보기
            <span className="landing-trending__link-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      <section className="landing-newsletter">
        <h2>{LANDING_NEWSLETTER_TITLE}</h2>
        <p>{LANDING_NEWSLETTER_SUB}</p>
        <form className="landing-newsletter__form" onSubmit={handleSubscribe}>
          <input type="email" name="email" placeholder="Enter your email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required aria-label="이메일"/>
          <button type="submit">구독</button>
        </form>
      </section>

    </ShopLayout>
  );
}

export default Home;
