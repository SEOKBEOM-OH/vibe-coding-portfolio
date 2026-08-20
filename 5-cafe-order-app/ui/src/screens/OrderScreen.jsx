import { useEffect, useState } from 'react'
import Header from '../components/Header'
import MenuCard from '../components/MenuCard'
import { formatPrice, optionKey, optionLabel } from '../utils/format'

export default function OrderScreen({
  menuItems,
  cart,
  setCart,
  onPlaceOrder,
  onNavigateAdmin,
}) {
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(false), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function handleAddToCart(item, options) {
    const unitPrice = item.price + options.reduce((sum, option) => sum + option.price, 0)

    setCart((prev) => {
      const key = optionKey(options)
      const existIndex = prev.findIndex(
        (cartItem) =>
          cartItem.menuId === item.id && optionKey(cartItem.selectedOptions) === key,
      )

      if (existIndex >= 0) {
        return prev.map((cartItem, index) =>
          index === existIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [
        ...prev,
        {
          menuId: item.id,
          menuName: item.name,
          selectedOptions: options,
          unitPrice,
          quantity: 1,
        },
      ]
    })
  }

  function handleChangeQuantity(index, delta) {
    setCart((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: item.quantity + delta } : item,
      ).filter((item) => item.quantity > 0),
    )
  }

  function handleRemoveItem(index) {
    setCart((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  async function handleOrder() {
    if (cart.length === 0) return
    const ok = await onPlaceOrder()
    if (ok) setToast(true)
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div className="screen">
      <Header
        activeScreen="order"
        onNavigateOrder={() => {}}
        onNavigateAdmin={onNavigateAdmin}
      />

      <div className="screen__body">
        <div className="page">
          <div className="page__intro">
            <h2 className="page__title">메뉴</h2>
            {/* <p className="page__subtitle">원하는 옵션을 선택한 뒤 담기를 눌러 장바구니에 추가하세요.</p> */}
          </div>

          {menuItems.length === 0 ? (
            <div className="empty">
              <span className="empty__icon" aria-hidden="true">
                ☕
              </span>
              <p>등록된 메뉴가 없습니다.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="cart">
        <div className="page">
          <div className="cart__head">
            <h2 className="page__title">장바구니</h2>
          </div>

          <div className="cart__body">
            <div className="cart__items">
              {cart.length === 0 ? (
                <p className="muted">담은 메뉴가 없습니다.</p>
              ) : (
                <ul className="cart__list">
                  {cart.map((item, index) => (
                    <li key={`${item.menuId}-${optionKey(item.selectedOptions)}-${index}`}>
                      <div className="cart__item-info">
                        <span className="cart__item-name">
                          {item.menuName}
                          <span className="muted">{optionLabel(item.selectedOptions)}</span>
                        </span>
                        <span className="cart__item-price">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                      <div className="cart__item-controls">
                        <div className="cart__qty">
                          <button
                            type="button"
                            className="cart__qty-btn"
                            onClick={() => handleChangeQuantity(index, -1)}
                            aria-label="수량 줄이기"
                          >
                            −
                          </button>
                          <span className="cart__qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart__qty-btn"
                            onClick={() => handleChangeQuantity(index, 1)}
                            aria-label="수량 늘리기"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart__remove"
                          onClick={() => handleRemoveItem(index)}
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cart__divider" />

            <div className="cart__summary">
              <div className="cart__total">
                <span className="muted">총 금액</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button
                type="button"
                className="cart__order"
                onClick={handleOrder}
                disabled={cart.length === 0}
              >
                주문하기
              </button>
            </div>
          </div>
        </div>
      </aside>

      {toast && (
        <div className="order-alert" role="status" aria-live="polite">
          <div className="order-alert__card">
            <p className="order-alert__title">주문이 접수되었습니다</p>
            <p className="order-alert__desc">주문 현황은 관리자 화면에서 확인할 수 있습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}
