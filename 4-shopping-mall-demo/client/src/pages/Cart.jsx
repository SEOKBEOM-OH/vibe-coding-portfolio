import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { getProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import {
  ArrowLeftIcon,
  HeartIcon,
  TrashIcon,
} from '../components/Icons';
import {
  formatProductPrice,
  getProductId,
} from '../utils/productDisplay';
import {
  FREE_SHIPPING_MIN,
  STANDARD_SHIPPING_FEE,
  getStandardShippingFee,
} from '../constants/shipping';
import './Cart.css';

/**
 * 장바구니 페이지
 * 왼쪽: 상품 목록 / 오른쪽: 주문 요약 (총수량·총금액)
 */
function Cart() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    totalAmount,
    loading,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [related, setRelated] = useState([]);
  const [saved, setSaved] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((res) => {
        if (cancelled) return;
        const cartIds = new Set(items.map((i) => String(i.productId)));
        const list = (res.data || [])
          .filter((p) => !cartIds.has(String(getProductId(p))))
          .slice(0, 4);
        setRelated(list);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const shippingFee = getStandardShippingFee(totalAmount);
  const freeShipping = shippingFee === 0;
  const shippingLabel =
    items.length === 0
      ? '—'
      : freeShipping
        ? '무료'
        : formatProductPrice(STANDARD_SHIPPING_FEE);

  const handleQty = async (itemId, nextQty) => {
    try {
      if (nextQty < 1) {
        await removeFromCart(itemId);
        return;
      }
      await updateQuantity(itemId, nextQty);
    } catch (err) {
      window.alert(err.message || '수량 변경에 실패했습니다.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      window.alert(err.message || '삭제에 실패했습니다.');
    }
  };

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ShopLayout mainClassName="cart-layout">
      <div className="cart-page">
        <header className="cart-page__topbar">
          <button
            type="button"
            className="cart-page__back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1>
            장바구니
            {!loading && itemCount > 0 && (
              <span className="cart-page__count"> ({itemCount})</span>
            )}
          </h1>
          <span className="cart-page__topbar-spacer" aria-hidden="true" />
        </header>

        {loading && <p className="cart-page__status">불러오는 중…</p>}

        {!loading && items.length === 0 && (
          <div className="cart-page__empty">
            <p>장바구니가 비어 있습니다.</p>
            <Link to="/products" className="cart-page__btn cart-page__btn--primary">
              쇼핑 계속하기
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="cart-page__grid">
            <div className="cart-page__main">
              <ul className="cart-page__list">
                {items.map((item) => {
                  const isSaved = saved.has(item._id);
                  const soldOut = Number(item.stock) <= 0;
                  return (
                    <li key={item._id} className={`cart-card${soldOut ? ' is-sold-out' : ''}`}>
                      <button
                        type="button"
                        className="cart-card__trash"
                        aria-label="삭제"
                        onClick={() => handleRemove(item._id)}
                      >
                        <TrashIcon size={16} />
                      </button>

                      <Link
                        to={`/products/${item.productId}`}
                        className="cart-card__thumb"
                      >
                        {item.image ? (
                          <img src={item.image} alt="" />
                        ) : (
                          <span className="cart-card__thumb-empty" />
                        )}
                      </Link>

                      <div className="cart-card__body">
                        <Link
                          to={`/products/${item.productId}`}
                          className="cart-card__name"
                        >
                          {item.name}
                        </Link>

                        {(item.size || item.color) && (
                          <p className="cart-card__meta">
                            {item.size ? `사이즈: ${item.size}` : null}
                            {item.size && item.color ? ' · ' : null}
                            {item.color ? `컬러: ${item.color}` : null}
                          </p>
                        )}

                        <p className="cart-card__price">
                          {formatProductPrice(item.price)}
                        </p>

                        <div className="cart-card__footer">
                          <div className="cart-card__qty-block">
                            <div className="cart-card__qty">
                              <button
                                type="button"
                                aria-label="감소"
                                onClick={() =>
                                  handleQty(item._id, item.quantity - 1)
                                }
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="증가"
                                disabled={soldOut}
                                onClick={() =>
                                  handleQty(item._id, item.quantity + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                            <span className={`cart-card__stock${soldOut ? ' is-sold-out' : ''}`}>
                              <span className="cart-card__stock-dot" />
                              {soldOut ? '품절' : '재고 있음'}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`cart-card__save${isSaved ? ' is-active' : ''}`}
                            onClick={() => toggleSave(item._id)}
                          >
                            <HeartIcon size={16} filled={isSaved} />
                            나중에 구매
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {related.length > 0 && (
                <section className="cart-related">
                  <h2>이런 상품은 어때요?</h2>
                  <div className="cart-related__grid">
                    {related.map((product) => {
                      const id = getProductId(product);
                      const price =
                        product.sale_price != null &&
                        product.sale_price < product.price
                          ? product.sale_price
                          : product.price;
                      return (
                        <Link
                          key={id}
                          to={`/products/${id}`}
                          className="cart-related__card"
                        >
                          <div className="cart-related__media">
                            <img src={product.image} alt="" loading="lazy" />
                          </div>
                          <span className="cart-related__name">{product.name}</span>
                          <span className="cart-related__price">
                            {formatProductPrice(price)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            <aside className="cart-summary">
              <h2>주문 요약</h2>

              <div className="cart-summary__row">
                <span>총 상품 금액 ({itemCount}개)</span>
                <strong>{formatProductPrice(totalAmount)}</strong>
              </div>

              <div className="cart-summary__row">
                <span>배송비</span>
                <strong className={freeShipping ? 'is-free' : ''}>
                  {shippingLabel}
                </strong>
              </div>

              {freeShipping ? (
                <p className="cart-summary__hint cart-summary__hint--ok">
                  무료 배송 조건을 충족했습니다!
                </p>
              ) : (
                <p className="cart-summary__hint">
                  {formatProductPrice(FREE_SHIPPING_MIN)} 이상 무료 배송
                </p>
              )}

              <div className="cart-summary__divider" />

              <div className="cart-summary__row cart-summary__row--total">
                <span>총 결제 예정 금액</span>
                <strong>
                  {formatProductPrice(
                    totalAmount + shippingFee
                  )}
                </strong>
              </div>

              <Link
                to="/checkout"
                className="cart-page__btn cart-page__btn--primary"
              >
                주문하기
              </Link>
              <Link to="/products" className="cart-page__btn cart-page__btn--ghost">
                쇼핑 계속하기
              </Link>

              <div className="cart-summary__pay">
                <span>결제 수단:</span>
                <div className="cart-summary__badges">
                  <span>VISA</span>
                  <span>MC</span>
                  <span>AMEX</span>
                  <span>PAYPAL</span>
                </div>
              </div>
              <p className="cart-summary__secure">
                SSL 암호화로 안전하게 결제됩니다
              </p>
            </aside>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

export default Cart;
