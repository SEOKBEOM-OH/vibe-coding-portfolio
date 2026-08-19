import Header from '../components/Header'
import { NEXT_STATUS, NEXT_STATUS_HINT, ORDER_STATUS, canCancelOrder } from '../constants/orderStatus'
import { formatDate, formatPrice, optionLabel } from '../utils/format'

function statusClassName(status) {
  if (status === ORDER_STATUS.RECEIVED) return 'is-received'
  if (status === ORDER_STATUS.MAKING) return 'is-making'
  if (status === ORDER_STATUS.DONE) return 'is-done'
  return 'is-cancelled'
}

function stockStatus(stock) {
  if (stock === 0) return { label: '품절', className: 'is-soldout' }
  if (stock < 5) return { label: '주의', className: 'is-warning' }
  return { label: '정상', className: 'is-ok' }
}

export default function AdminScreen({
  menuItems,
  orders,
  onUpdateStock,
  onAdvanceOrder,
  onCancelOrder,
  onNavigateOrder,
}) {
  const total = orders.length
  const received = orders.filter((order) => order.status === ORDER_STATUS.RECEIVED).length
  const making = orders.filter((order) => order.status === ORDER_STATUS.MAKING).length
  const done = orders.filter((order) => order.status === ORDER_STATUS.DONE).length
  const cancelled = orders.filter((order) => order.status === ORDER_STATUS.CANCELLED).length

  const stats = [
    { label: '총 주문', value: total },
    { label: '주문 접수', value: received },
    { label: '제조 중', value: making },
    { label: '제조 완료', value: done },
    { label: '주문 취소', value: cancelled },
  ]

  function handleAdvanceClick(order) {
    const nextStatus = NEXT_STATUS[order.status]
    if (!nextStatus) return
    const confirmed = window.confirm(`주문 상태를 '${nextStatus}'로 변경할까요?`)
    if (confirmed) onAdvanceOrder(order.id)
  }

  function handleCancelClick(order) {
    const confirmed = window.confirm('이 주문을 취소할까요?')
    if (confirmed) onCancelOrder(order.id)
  }

  return (
    <div className="screen">
      <Header
        activeScreen="admin"
        onNavigateOrder={onNavigateOrder}
        onNavigateAdmin={() => {}}
      />

      <main className="screen__body screen__body--admin">
        <div className="page page--stack">
          <section className="panel">
            <h2 className="panel__title">관리자 대시보드</h2>
            <div className="dashboard">
              {stats.map((stat) => (
                <div key={stat.label} className="dashboard__stat">
                  <span className="dashboard__value">{stat.value}</span>
                  <span className="muted">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">재고 현황</h2>
            {menuItems.length === 0 ? (
              <p className="muted">등록된 메뉴가 없습니다.</p>
            ) : (
              <div className="stock-grid">
                {menuItems.map((item) => {
                  const status = stockStatus(item.stock)
                  return (
                  <div key={item.id} className="stock-card">
                    <span className="stock-card__name">{item.name}</span>
                    <div className="stock-card__meta">
                      <span className={`stock-card__count${item.stock === 0 ? ' is-empty' : ''}`}>
                        {item.stock}개
                      </span>
                      <span className={`stock-card__status ${status.className}`}>{status.label}</span>
                      <div className="stock-card__actions">
                        <button
                          type="button"
                          className="stock-card__btn stock-card__btn--minus"
                          onClick={() => onUpdateStock(item.id, -1)}
                          disabled={item.stock === 0}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="stock-card__btn stock-card__btn--plus"
                          onClick={() => onUpdateStock(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title">주문 현황</h2>
            {orders.length === 0 ? (
              <p className="muted">접수된 주문이 없습니다.</p>
            ) : (
              <div className="order-list">
                {orders.map((order) => {
                  const canAdvance = Boolean(NEXT_STATUS[order.status])
                  const showCancel = canCancelOrder(order.status)
                  const nextHint = NEXT_STATUS_HINT[order.status]

                  return (
                    <div key={order.id} className="order-row">
                      <div className="order-row__date">{formatDate(order.createdAt)}</div>
                      <div className="order-row__items">
                        {order.items.map((item, index) => (
                          <span key={`${order.id}-${item.menuId}-${index}`}>
                            {item.menuName}
                            <span className="muted">{optionLabel(item.selectedOptions)}</span>
                            {` X ${item.quantity}`}
                          </span>
                        ))}
                      </div>
                      <div className="order-row__price">{formatPrice(order.total)}</div>
                      <div className="order-row__actions">
                        <button
                          type="button"
                          className={`order-row__btn ${statusClassName(order.status)}`}
                          onClick={() => handleAdvanceClick(order)}
                          disabled={!canAdvance}
                        >
                          {order.status}
                        </button>
                        {nextHint && <span className="order-row__hint">→ {nextHint}</span>}
                        {showCancel && (
                          <button
                            type="button"
                            className="order-row__cancel"
                            onClick={() => handleCancelClick(order)}
                          >
                            주문 취소
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
