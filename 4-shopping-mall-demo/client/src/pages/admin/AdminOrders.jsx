import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrder } from '../../api/orders';
import { SITE_NAME } from '../../constants/site';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TABS,
  isShippingLike,
  toOrderStatusSelectValue,
} from '../../constants/orderStatus';
import { formatProductPrice } from '../../utils/productDisplay';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  FilterIcon,
  SearchIcon,
  TruckIcon,
} from '../../components/Icons';
import './Admin.css';
import './AdminOrders.css';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getStatusMeta(status) {
  if (status === 'shipping' || status === 'shipping_start') {
    return {
      group: 'shipping',
      badge: ORDER_STATUS_LABEL[status] || '배송중',
      Icon: TruckIcon,
    };
  }
  if (status === 'delivered') {
    return {
      group: 'completed',
      badge: '배송완료',
      Icon: CheckCircleIcon,
    };
  }
  if (status === 'cancelled') {
    return {
      group: 'cancelled',
      badge: '주문취소',
      Icon: ClockIcon,
    };
  }
  return {
    group: 'processing',
    badge: ORDER_STATUS_LABEL[status] || '처리중',
    Icon: ClockIcon,
  };
}

function customerName(order) {
  return order.user?.name || order.receiverName || '고객';
}

function customerEmail(order) {
  return order.user?.email || '-';
}

/**
 * 관리자 주문 관리
 * /admin/orders — AdminRoute 전용
 */
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOrders({ scope: 'all' });
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || '주문 목록을 불러오지 못했습니다.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of ORDER_STATUS_TABS) {
      if (!t.statuses) {
        counts[t.id] = orders.length;
      } else {
        counts[t.id] = orders.filter((o) => t.statuses.includes(o.status)).length;
      }
    }
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const active = ORDER_STATUS_TABS.find((t) => t.id === tab) || ORDER_STATUS_TABS[0];
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (active.statuses && !active.statuses.includes(order.status)) {
        return false;
      }
      if (!q) return true;

      const hay = [
        order.orderNumber,
        order.receiverName,
        order.user?.name,
        order.user?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }, [orders, tab, search]);

  const patchStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const res = await updateOrder(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data : o))
      );
    } catch (err) {
      setError(err.message || '주문 상태 변경에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = (order, nextStatus) => {
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

    patchStatus(order._id, nextStatus);
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
          <Link to="/admin" className="admin-orders-page__back" aria-label="대시보드로">
            <ArrowLeftIcon size={20} />
          </Link>
          <h1>주문 관리</h1>
        </div>

        <div className="admin-orders-page__toolbar">
          <label className="admin-orders-page__search">
            <SearchIcon size={18} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="주문번호 또는 고객명으로 검색..."
            />
          </label>
          <button type="button" className="admin-orders-page__filter" aria-label="필터">
            <FilterIcon size={16} />
          </button>
        </div>

        <div className="admin-orders-page__tabs" role="tablist" aria-label="주문 상태">
          {ORDER_STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`admin-orders-page__tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="admin-orders-page__tab-count">
                {tabCounts[t.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {loading && <p className="admin-orders-page__status">불러오는 중…</p>}
        {!loading && error && (
          <p className="admin-orders-page__status admin-orders-page__status--error">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="admin-orders-page__status">해당 주문이 없습니다.</p>
        )}

        {!loading && filtered.length > 0 && (
          <ul className="admin-order-cards">
            {filtered.map((order) => {
              const meta = getStatusMeta(order.status);
              const StatusIcon = meta.Icon;
              const busy = updatingId === order._id;
              const itemCount =
                order.totalQuantity ||
                (order.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

              return (
                <li key={order._id} className="admin-order-card">
                  <div className="admin-order-card__top">
                    <div className="admin-order-card__identity">
                      <span
                        className={`admin-order-card__icon admin-order-card__icon--${meta.group}`}
                        aria-hidden="true"
                      >
                        <StatusIcon size={18} />
                      </span>
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <span>
                          {customerName(order)} · {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-order-card__side">
                      <span
                        className={`admin-order-card__badge admin-order-card__badge--${meta.group}`}
                      >
                        {meta.badge}
                      </span>
                      <em>{formatProductPrice(order.finalAmount)}</em>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="admin-order-card__detail-btn"
                      >
                        <EyeIcon open size={16} />
                        상세보기
                      </Link>
                    </div>
                  </div>

                  <div className="admin-order-card__grid">
                    <div>
                      <h3>고객 정보</h3>
                      <p>{customerEmail(order)}</p>
                      <p>{order.receiverPhone || '-'}</p>

                      <div className="admin-order-card__actions">
                        <label className="admin-order-card__status-label">
                          주문상태
                          <select
                            className="admin-order-card__status-select"
                            value={toOrderStatusSelectValue(order.status)}
                            disabled={busy}
                            onChange={(e) =>
                              handleStatusChange(order, e.target.value)
                            }
                          >
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3>주문상품</h3>
                      <p>{itemCount}개 상품</p>
                    </div>

                    <div>
                      <h3>주소</h3>
                      <p>{order.shippingAddress || '-'}</p>
                    </div>
                  </div>

                  {isShippingLike(order.status) && (
                    <div className="admin-order-card__tracking">
                      추적번호: {order.merchantUid || order.impUid || order.orderNumber}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
