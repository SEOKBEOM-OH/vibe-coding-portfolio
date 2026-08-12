import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/products';
import { SITE_NAME } from '../../constants/site';
import {
  ADMIN_DEMO_ORDERS,
  ADMIN_DEMO_STATS,
  ORDER_STATUS_LABEL,
} from '../../data/adminDashboard';
import {
  BagIcon,
  BarChartIcon,
  ChartIcon,
  EyeIcon,
  PackageIcon,
  PlusIcon,
  UsersIcon,
} from '../../components/Icons';
import './Admin.css';

function formatNumber(n) {
  return Number(n).toLocaleString('ko-KR');
}

function formatWon(n) {
  return `₩${formatNumber(n)}`;
}

/**
 * 관리자 대시보드
 * /admin — AdminRoute 통과 후에만 렌더
 */
function Admin() {
  const [productCount, setProductCount] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getProducts({ is_active: 'all' })
      .then((res) => {
        if (!cancelled) setProductCount(res.count ?? res.data?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setProductCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      key: 'orders',
      label: '총 주문',
      value: formatNumber(ADMIN_DEMO_STATS.orders.value),
      change: ADMIN_DEMO_STATS.orders.change,
      icon: BagIcon,
      tone: 'blue',
    },
    {
      key: 'products',
      label: '총 상품',
      value: productCount == null ? '—' : formatNumber(productCount),
      change: ADMIN_DEMO_STATS.productsChange,
      icon: PackageIcon,
      tone: 'green',
    },
    {
      key: 'customers',
      label: '총 고객',
      value: formatNumber(ADMIN_DEMO_STATS.customers.value),
      change: ADMIN_DEMO_STATS.customers.change,
      icon: UsersIcon,
      tone: 'slate',
    },
    {
      key: 'sales',
      label: '총 매출',
      value: formatWon(ADMIN_DEMO_STATS.sales.value),
      change: ADMIN_DEMO_STATS.sales.change,
      icon: ChartIcon,
      tone: 'amber',
    },
  ];

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

      <main className="admin-dash__main">
        <div className="admin-dash__intro">
          <h1>관리자 대시보드</h1>
          <p>{SITE_NAME} 쇼핑몰 관리 시스템에 오신 것을 환영합니다.</p>
        </div>

        <section className="admin-dash__stats" aria-label="주요 지표">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.key} className="admin-stat">
                <div className="admin-stat__top">
                  <span className="admin-stat__label">{stat.label}</span>
                  <span className={`admin-stat__icon admin-stat__icon--${stat.tone}`}>
                    <Icon size={18} />
                  </span>
                </div>
                <p className="admin-stat__value">{stat.value}</p>
                <p className="admin-stat__change">{stat.change} from last month</p>
              </article>
            );
          })}
        </section>

        <section className="admin-dash__mid">
          <div className="admin-panel">
            <h2 className="admin-panel__title">빠른 작업</h2>
            <div className="admin-actions">
              <Link to="/admin/products/new" className="admin-action admin-action--primary">
                <PlusIcon size={18} />
                새 상품 등록
              </Link>
              <Link to="/admin/orders" className="admin-action">
                <EyeIcon size={18} />
                주문 관리
              </Link>
              <button type="button" className="admin-action" disabled>
                <BarChartIcon size={18} />
                매출 분석
              </button>
              <button type="button" className="admin-action" disabled>
                <UsersIcon size={18} />
                고객 관리
              </button>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-panel__title">최근 주문</h2>
              <Link to="/admin/orders" className="admin-panel__link">
                전체보기
              </Link>
            </div>
            <ul className="admin-orders">
              {ADMIN_DEMO_ORDERS.map((order) => (
                <li key={order.id} className="admin-order">
                  <div className="admin-order__main">
                    <span className="admin-order__id">{order.id}</span>
                    <span className="admin-order__meta">
                      {order.customer} · {order.date}
                    </span>
                  </div>
                  <div className="admin-order__side">
                    <span className="admin-order__amount">{formatWon(order.amount)}</span>
                    <span
                      className={`admin-order__status admin-order__status--${order.status}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="admin-dash__nav-cards" aria-label="관리 메뉴">
          <Link to="/admin/products" className="admin-nav-card">
            <span className="admin-nav-card__icon admin-nav-card__icon--blue">
              <PackageIcon size={28} />
            </span>
            <h3>상품 관리</h3>
            <p>상품 등록, 수정, 삭제 및 재고 관리</p>
          </Link>
          <Link to="/admin/orders" className="admin-nav-card">
            <span className="admin-nav-card__icon admin-nav-card__icon--green">
              <BagIcon size={28} />
            </span>
            <h3>주문 관리</h3>
            <p>주문 조회, 상태 변경 및 배송 관리</p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Admin;
