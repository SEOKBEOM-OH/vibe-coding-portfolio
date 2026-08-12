import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { getOrderById } from '../api/orders';
import { formatProductPrice } from '../utils/productDisplay';
import './OrderComplete.css';

const STATUS_LABEL = {
  pending: '대기',
  paid: '결제완료',
  processing: '처리중',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨',
};

/**
 * 주문 상세
 * /orders/:id
 */
function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, [id]);

  return (
    <ShopLayout mainClassName="order-complete-layout">
      <div className="order-complete">
        {loading && <p className="order-complete__status">불러오는 중…</p>}

        {!loading && error && (
          <div className="order-complete__card">
            <p className="order-complete__error">{error}</p>
            <Link to="/orders" className="order-complete__btn order-complete__btn--ghost">
              주문 목록으로
            </Link>
          </div>
        )}

        {!loading && order && (
          <div className="order-complete__card">
            <h1>주문 상세</h1>
            <p className="order-complete__lead">
              상태: {STATUS_LABEL[order.status] || order.status}
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
              <div className="order-complete__totals-final">
                <span>총 결제 금액</span>
                <strong>{formatProductPrice(order.finalAmount)}</strong>
              </div>
            </div>

            <div className="order-complete__actions">
              <Link to="/orders" className="order-complete__btn order-complete__btn--primary">
                주문 목록으로
              </Link>
              <Link to="/products" className="order-complete__btn order-complete__btn--ghost">
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

export default OrderDetail;
