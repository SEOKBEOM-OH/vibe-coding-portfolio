import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import ProductGrid from '../components/ProductGrid';
import { getProductById, getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ArrowLeftIcon,
  BagIcon,
  HeartIcon,
  RefreshIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from '../components/Icons';
import {
  formatProductPrice,
  getProductId,
} from '../utils/productDisplay';
import './ProductDetail.css';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const FEATURES = [
  'Premium quality materials',
  'Comfortable fit',
  'Easy care instructions',
  'Sustainable production',
];

function isNewProduct(product) {
  if (!product?.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  const days30 = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created < days30;
}

/**
 * 상품 상세 페이지
 * /products/:id — GET /api/products/:id
 * Quantity / ADD TO BAG → CartContext
 */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bagMessage, setBagMessage] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const [wishlist, setWishlist] = useState(() => new Set());
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      setBagMessage('');
      setActiveImage(0);
      setQuantity(1);
      setTab('description');

      try {
        const res = await getProductById(id);
        const data = res.data;
        if (cancelled) return;

        setProduct(data);
        setSelectedSize((data.sizes && data.sizes[0]) || DEFAULT_SIZES[2]);
        setSelectedColor((data.colors && data.colors[0]) || '');

        const listRes = await getProducts();
        if (cancelled) return;
        const cats = Array.isArray(data.category)
          ? data.category
          : data.category
            ? [data.category]
            : [];
        const others = (listRes.data || [])
          .filter((p) => getProductId(p) !== getProductId(data))
          .filter((p) => {
            if (!cats.length) return true;
            const pc = Array.isArray(p.category)
              ? p.category
              : p.category
                ? [p.category]
                : [];
            return cats.some((c) => pc.includes(c));
          })
          .slice(0, 4);
        // 같은 카테고리가 부족하면 다른 상품으로 채움
        const fill =
          others.length < 4
            ? (listRes.data || [])
                .filter((p) => getProductId(p) !== getProductId(data))
                .filter((p) => !others.some((o) => getProductId(o) === getProductId(p)))
                .slice(0, 4 - others.length)
            : [];
        setRelated([...others, ...fill].slice(0, 4));
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
          setError(err.message || '상품을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || [])].filter(Boolean);
    return [...new Set(list)];
  }, [product]);

  const sizes =
    product?.sizes?.length > 0 ? product.sizes : DEFAULT_SIZES;
  const colors = product?.colors || [];

  const hasSale =
    product &&
    product.sale_price != null &&
    product.sale_price < product.price;
  const unitPrice = hasSale ? product.sale_price : product?.price;
  const discountPct = hasSale
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  // 등록 시 stock 0인 기존 상품도 담을 수 있도록 데모용 상한 적용
  const maxQty = product?.stock > 0 ? product.stock : 10;
  const canPurchase = maxQty > 0;

  const toggleWish = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const changeQty = (delta) => {
    if (!canPurchase) return;
    setQuantity((q) => Math.min(maxQty, Math.max(1, q + delta)));
  };

  const handleAddToBag = async () => {
    if (!product || !canPurchase) return;

    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (!selectedSize) {
      setBagMessage('사이즈를 선택해 주세요.');
      return;
    }

    try {
      await addToCart({
        productId: getProductId(product),
        quantity,
      });
      setBagMessage(`장바구니에 ${quantity}개 담았습니다.`);
    } catch (err) {
      setBagMessage(err.message || '장바구니에 담지 못했습니다.');
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <p className="product-detail__status">상품을 불러오는 중…</p>
      </ShopLayout>
    );
  }

  if (error || !product) {
    return (
      <ShopLayout>
        <div className="product-detail__status-wrap">
          <p className="product-detail__status product-detail__status--error">
            {error || '상품을 찾을 수 없습니다.'}
          </p>
          <Link to="/products" className="product-detail__back-link">
            상품 목록으로
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout mainClassName="product-detail-layout">
      <div className="product-detail">
        <div className="product-detail__top">
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img
                src={gallery[activeImage] || product.image}
                alt={product.name}
              />
            </div>
            {gallery.length > 1 && (
              <div className="product-detail__thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    className={`product-detail__thumb${activeImage === i ? ' is-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail__info">
            <div className="product-detail__badges">
              {isNewProduct(product) && (
                <span className="product-detail__badge product-detail__badge--new">
                  NEW
                </span>
              )}
              {(hasSale ||
                (Array.isArray(product.category)
                  ? product.category.includes('sale')
                  : product.category === 'sale')) && (
                <span className="product-detail__badge product-detail__badge--sale">
                  SALE
                </span>
              )}
            </div>

            <h1 className="product-detail__title">{product.name}</h1>

            <div className="product-detail__rating">
              <StarIcon size={16} />
              <span>4.8 (124 reviews)</span>
            </div>

            <div className="product-detail__pricing">
              <span className="product-detail__price">
                {formatProductPrice(unitPrice)}
              </span>
              {hasSale && (
                <>
                  <span className="product-detail__price-origin">
                    {formatProductPrice(product.price)}
                  </span>
                  <span className="product-detail__off">{discountPct}% OFF</span>
                </>
              )}
            </div>

            <div className="product-detail__option">
              <span className="product-detail__option-label">Size</span>
              <div className="product-detail__sizes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`product-detail__size${selectedSize === size ? ' is-active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {colors.length > 0 && (
              <div className="product-detail__option">
                <span className="product-detail__option-label">
                  색상: <em>{selectedColor}</em>
                </span>
                <div className="product-detail__colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`product-detail__color${selectedColor === color ? ' is-active' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail__option">
              <span className="product-detail__option-label">Quantity</span>
              <div className="product-detail__qty-row">
                <div className="product-detail__qty">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    aria-label="감소"
                    disabled={!canPurchase || quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    aria-label="증가"
                    disabled={!canPurchase || quantity >= maxQty}
                  >
                    +
                  </button>
                </div>
                <span className="product-detail__stock">
                  {product.stock > 0
                    ? `Only ${product.stock} left in stock`
                    : `Up to ${maxQty} available`}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="product-detail__bag"
              onClick={handleAddToBag}
              disabled={!canPurchase}
            >
              <BagIcon size={18} />
              장바구니 담기 — {formatProductPrice((unitPrice || 0) * quantity)}
            </button>

            {bagMessage && (
              <p className="product-detail__bag-msg">{bagMessage}</p>
            )}

            <button
              type="button"
              className={`product-detail__wish-btn${liked ? ' is-active' : ''}`}
              onClick={() => setLiked((v) => !v)}
            >
              <HeartIcon size={18} filled={liked} />
              {liked ? 'ADDED TO WISHLIST' : 'ADD TO WISHLIST'}
            </button>

            <div className="product-detail__perks">
              <div className="product-detail__perk">
                <TruckIcon size={20} />
                <div>
                <strong>무료 배송</strong>
                <span>3만원 이상 주문 시</span>
                </div>
              </div>
              <div className="product-detail__perk">
                <RefreshIcon size={20} />
                <div>
                  <strong>간편한 반품</strong>
                  <span>30일 반품 정책</span>
                </div>
              </div>
              <div className="product-detail__perk">
                <ShieldIcon size={20} />
                <div>
                  <strong>안전한 결제</strong>
                  <span>SSL 암호화</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-detail__subnav">
          <button
            type="button"
            className="product-detail__subnav-back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <span className="product-detail__subnav-title">{product.name}</span>
          <div className="product-detail__subnav-actions">
            <button
              type="button"
              className={`product-detail__icon-btn${liked ? ' is-active' : ''}`}
              onClick={() => setLiked((v) => !v)}
              aria-label="위시리스트"
            >
              <HeartIcon size={18} filled={liked} />
            </button>
          </div>
        </div>

        <div className="product-detail__tabs" role="tablist">
          {[
            { id: 'description', label: 'Description' },
            { id: 'reviews', label: 'Reviews (124)' },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`product-detail__tab${tab === item.id ? ' is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="product-detail__tab-panel">
          {tab === 'description' && (
            <>
              <p>
                {product.description?.trim() ||
                  `${product.name} — thoughtfully designed for everyday wear with a clean, contemporary silhouette.`}
              </p>
              <h3>Features:</h3>
              <ul>
                {FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {product.sku && (
                <p className="product-detail__sku">SKU: {product.sku}</p>
              )}
            </>
          )}
          {tab === 'reviews' && (
            <p className="product-detail__muted">
              리뷰 기능은 준비 중입니다. (데모 평점 4.8 · 124 reviews)
            </p>
          )}
          {tab === 'shipping' && (
            <ul>
              <li>3만원 이상 주문 시 무료 배송</li>
              <li>미사용 제품에 대한 30일 반품 정책</li>
              <li>SSL 암호화를 통한 안전한 결제</li>
            </ul>
          )}
        </div>

        {related.length > 0 && (
          <section className="product-detail__related">
            <h2>이것도 좋아하실 수 있습니다</h2>
            <ProductGrid
              products={related}
              wishlist={wishlist}
              onToggleWish={toggleWish}
            />
          </section>
        )}
      </div>
    </ShopLayout>
  );
}

export default ProductDetail;
