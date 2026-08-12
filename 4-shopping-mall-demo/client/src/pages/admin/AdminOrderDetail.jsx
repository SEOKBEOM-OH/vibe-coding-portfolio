import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById, updateOrder } from '../../api/orders';
import { SITE_NAME } from '../../constants/site';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_OPTIONS,
  toOrderStatusSelectValue,
} from '../../constants/orderStatus';
import { formatProductPrice } from '../../utils/productDisplay';
import { ArrowLeftIcon } from '../../components/Icons';
import './Admin.css';
import './AdminOrders.css';
import '../OrderComplete.css';

/**
 * 관리자 주문 상세
 * /admin/orders/:id
 */
function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        if (!cancelled) setOrder(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '주문을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const patchStatus = async (status) => {
    if (!order) return;
    setBusy(true);
    setError('');
    try {
      const res = await updateOrder(order._id, { status });
      setOrder(res.data);
    } catch (err) {
      setError(err.message || '상태 변경에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = (nextStatus) => {
    if (!order) return;
    const current = toOrderStatusSelectValue(order.status);
    if (current === nextStatus) return;

    const label =
      ORDER_STATUS_OPTIONS.find((o) => o.value === nextStatus)?.label ||
      nextStatus;

    if (nextStatus === 'cancelled') {
      if (!window.confirm('이 주문을 취소할까요? 재고가 복구됩니다.')) return;
    } else if (!window.confirm(`주문 상태를 "${label}"(으)로 변경할까요?`)) {
      return;
    }

    patchStatus(nextStatus);
  };

  return (
    <div className="admin-dash">
      <header className="admin-dash__topbar">
        <div className="admin-dash__brand">
          <Link to="/" className="admin-dash__logo">
            {SITE_NAME}
          </Link>
          <span className="admin-dash__badge">ADMIN</span>
        </div>
        <Link to="/" className="admin-dash__back">
          쇼핑몰로 돌아가기
        </Link>
      </header>

      <main className="admin-dash__main admin-orders-page">
        <div className="admin-orders-page__title-row">
          <Link
            to="/admin/orders"
            className="admin-orders-page__back"
            aria-label="주문 목록으로"
          >
            <ArrowLeftIcon size={20} />
          </Link>
          <h1>주문 상세</h1>
        </div>

        {loading && <p className="admin-orders-page__status">불러오는 중…</p>}
        {!loading && error && (
          <p className="admin-orders-page__status admin-orders-page__status--error">
            {error}
          </p>
        )}

        {!loading && order && (
          <div className="order-complete__card" style={{ textAlign: 'left', maxWidth: 640 }}>
            <div className="order-complete__number">
              <span>주문번호</span>
              <strong>{order.orderNumber}</strong>
            </div>

            <dl className="order-complete__meta">
              <div>
                <dt>상태</dt>
                <dd>{ORDER_STATUS_LABEL[order.status] || order.status}</dd>
              </div>
              <div>
                <dt>고객</dt>
                <dd>
                  {order.user?.name || order.receiverName}
                  {order.user?.email ? ` (${order.user.email})` : ''}
                </dd>
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
                <dt>결제 금액</dt>
                <dd>{formatProductPrice(order.finalAmount)}</dd>
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

            <div className="admin-order-card__actions" style={{ marginBottom: 16 }}>
              <label className="admin-order-card__status-label">
                주문상태
                <select
                  className="admin-order-card__status-select"
                  value={toOrderStatusSelectValue(order.status)}
                  disabled={busy}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="order-complete__actions">
              <Link
                to="/admin/orders"
                className="order-complete__btn order-complete__btn--primary"
              >
                목록으로
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrderDetail;
