import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { CheckCircleIcon } from '../components/Icons';
import { getOrderById } from '../api/orders';
import { formatProductPrice } from '../utils/productDisplay';
import './OrderComplete.css';

const PAYMENT_LABEL = {
  card: '신용/직불 카드',
  kakao: '카카오페이',
  naver: '네이버페이',
  transfer: '계좌이체',
};

/**
 * 주문 완료 페이지
 * /checkout/complete/:id
 */
function OrderComplete() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
      return undefined;
    }

    if (!id) {
      setError('주문 정보가 없습니다.');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        if (!cancelled) setOrder(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || '주문을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  return (
    <ShopLayout mainClassName="order-complete-layout">
      <div className="order-complete">
        {loading && <p className="order-complete__status">불러오는 중…</p>}

        {!loading && error && (
          <div className="order-complete__card">
            <p className="order-complete__error">{error}</p>
            <Link to="/cart" className="order-complete__btn order-complete__btn--ghost">
              장바구니로
            </Link>
          </div>
        )}

        {!loading && order && (
          <div className="order-complete__card">
            <div className="order-complete__icon" aria-hidden="true">
              <CheckCircleIcon size={56} />
            </div>
            <h1>주문이 완료되었습니다</h1>
            <p className="order-complete__lead">
              주문해 주셔서 감사합니다. 확인 메일을 보내드렸습니다.
            </p>

            <div className="order-complete__number">
              <span>주문번호</span>
              <strong>{order.orderNumber}</strong>
            </div>

            <dl className="order-complete__meta">
              <div>
                <dt>수령인</dt>
                <dd>{order.receiverName}</dd>
              </div>
              <div>
                <dt>연락처</dt>
                <dd>{order.receiverPhone}</dd>
              </div>
              <div>
                <dt>배송지</dt>
                <dd>{order.shippingAddress}</dd>
              </div>
              <div>
                <dt>결제 수단</dt>
                <dd>
                  {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                </dd>
              </div>
            </dl>

            <ul className="order-complete__items">
              {(order.items || []).map((item) => (
                <li key={item._id || `${item.product}-${item.name}`}>
                  <div className="order-complete__thumb">
                    {item.image ? <img src={item.image} alt="" /> : <span />}
                  </div>
                  <div className="order-complete__item-body">
                    <strong>{item.name}</strong>
                    <span>
                      {formatProductPrice(item.price)} × {item.quantity}
                    </span>
                  </div>
                  <em>{formatProductPrice(item.price * item.quantity)}</em>
                </li>
              ))}
            </ul>

            <div className="order-complete__totals">
              <div>
                <span>상품 합계</span>
                <strong>{formatProductPrice(order.totalAmount)}</strong>
              </div>
              <div>
                <span>배송비</span>
                <strong>
                  {order.shippingFee === 0
                    ? '무료'
                    : formatProductPrice(order.shippingFee)}
                </strong>
              </div>
              <div className="order-complete__totals-final">
                <span>총 결제 금액</span>
                <strong>{formatProductPrice(order.finalAmount)}</strong>
              </div>
            </div>

            <div className="order-complete__actions">
              <Link
                to="/orders"
                className="order-complete__btn order-complete__btn--primary"
              >
                주문 목록 보기
              </Link>
              <Link
                to="/products"
                className="order-complete__btn order-complete__btn--ghost"
              >
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

export default OrderComplete;
