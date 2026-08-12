import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  RefreshIcon,
  TruckIcon,
} from '../components/Icons';
import { getOrders } from '../api/orders';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TABS } from '../constants/orderStatus';
import { formatProductPrice } from '../utils/productDisplay';
import './Orders.css';

function formatOrderDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatRange(start, end) {
  const fmt = (d) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${fmt(start)}~${end.getDate()}일`;
}

function getStatusMeta(status) {
  if (status === 'shipping' || status === 'shipping_start') {
    return {
      group: 'shipping',
      badge: ORDER_STATUS_LABEL[status] || '배송중',
      Icon: TruckIcon,
      message: (order) => {
        const base = order.paidAt || order.createdAt;
        const from = addDays(base, 2);
        const to = addDays(base, 5);
        if (status === 'shipping_start') {
          return `배송이 시작되었습니다. 예상 도착일: ${formatRange(from, to)}`;
        }
        return `상품이 배송 중입니다. 예상 도착일: ${formatRange(from, to)}`;
      },
    };
  }

  if (status === 'delivered') {
    return {
      group: 'completed',
      badge: '배송완료',
      Icon: CheckCircleIcon,
      message: () => '배송이 완료되었습니다. 이용해 주셔서 감사합니다.',
    };
  }

  if (status === 'cancelled') {
    return {
      group: 'cancelled',
      badge: '주문취소',
      Icon: ClockIcon,
      message: () => '주문이 취소되었습니다.',
    };
  }

  return {
    group: 'processing',
    badge: ORDER_STATUS_LABEL[status] || '처리중',
    Icon: ClockIcon,
    message: (order) => {
      const base = order.paidAt || order.createdAt;
      const from = addDays(base, 3);
      const to = addDays(base, 5);
      return `주문이 처리 중입니다. 예상 배송일: ${formatRange(from, to)}`;
    },
  };
}

/**
 * 내 주문 목록
 * /orders — 상태 탭으로 필터
 */
function Orders() {
  const [tab, setTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getOrders({ scope: 'mine' });
        if (!cancelled) setOrders(res.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '주문 목록을 불러오지 못했습니다.');
          setOrders([]);
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

  const filtered = useMemo(() => {
    const active = ORDER_STATUS_TABS.find((t) => t.id === tab) || ORDER_STATUS_TABS[0];
    if (!active.statuses) return orders;
    return orders.filter((o) => active.statuses.includes(o.status));
  }, [orders, tab]);

  return (
    <ShopLayout mainClassName="orders-layout">
      <div className="orders">
        <header className="orders__head">
          <h1>주문 내역</h1>
          <p>나의 주문 상태를 확인하고 관리하세요.</p>
        </header>

        <div className="orders__tabs" role="tablist" aria-label="주문 상태">
          {ORDER_STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`orders__tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="orders__status">불러오는 중…</p>}
        {!loading && error && (
          <p className="orders__status orders__status--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="orders__status">해당 주문이 없습니다.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="orders__list">
            {filtered.map((order) => {
              const meta = getStatusMeta(order.status);
              const StatusIcon = meta.Icon;

              return (
                <li key={order._id} className="order-card">
                  <div className="order-card__top">
                    <div className="order-card__identity">
                      <span
                        className={`order-card__status-icon order-card__status-icon--${meta.group}`}
                        aria-hidden="true"
                      >
                        <StatusIcon size={18} />
                      </span>
                      <div>
                        <strong>주문번호 {order.orderNumber}</strong>
                        <span>주문일: {formatOrderDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="order-card__summary">
                      <span
                        className={`order-card__badge order-card__badge--${meta.group}`}
                      >
                        {meta.badge}
                      </span>
                      <em>{formatProductPrice(order.finalAmount)}</em>
                    </div>
                  </div>

                  <ul className="order-card__items">
                    {(order.items || []).map((item) => (
                      <li key={item._id || `${item.product}-${item.name}`}>
                        <div className="order-card__thumb">
                          {item.image ? (
                            <img src={item.image} alt="" />
                          ) : (
                            <span />
                          )}
                        </div>
                        <div className="order-card__item-body">
                          <strong>{item.name}</strong>
                          <span>수량: {item.quantity}</span>
                          <em>{formatProductPrice(item.price)}</em>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`order-card__shipping order-card__shipping--${meta.group}`}
                  >
                    <StatusIcon size={16} />
                    <p>{meta.message(order)}</p>
                  </div>

                  <div className="order-card__actions">
                    <Link
                      to={`/orders/${order._id}`}
                      className="order-card__btn"
                    >
                      <EyeIcon open size={16} />
                      주문 상세보기
                    </Link>

                    {meta.group === 'shipping' && (
                      <button
                        type="button"
                        className="order-card__btn order-card__btn--accent"
                        onClick={() =>
                          window.alert(meta.message(order))
                        }
                      >
                        <TruckIcon size={16} />
                        배송 추적
                      </button>
                    )}

                    {meta.group === 'completed' && (
                      <Link
                        to="/products"
                        className="order-card__btn order-card__btn--accent"
                      >
                        <RefreshIcon size={16} />
                        다시 주문하기
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="orders__footer">
          <Link to="/products" className="orders__shop-btn">
            계속해서 쇼핑하기
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}

export default Orders;
