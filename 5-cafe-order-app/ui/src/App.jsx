import { useState } from 'react'
import OrderScreen from './screens/OrderScreen'
import AdminScreen from './screens/AdminScreen'
import { initialMenuItems } from './data/menuItems'
import { NEXT_STATUS, ORDER_STATUS, canCancelOrder } from './constants/orderStatus'

export default function App() {
  const [screen, setScreen] = useState('order')
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])

  function handlePlaceOrder() {
    if (cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const newOrder = {
      id: Date.now(),
      items: cart,
      total,
      status: ORDER_STATUS.RECEIVED,
      createdAt: new Date(),
    }

    setOrders((prev) => [newOrder, ...prev])
    setCart([])
  }

  function handleAdvanceOrder(orderId) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const nextStatus = NEXT_STATUS[order.status]
        return nextStatus ? { ...order, status: nextStatus } : order
      }),
    )
  }

  function handleCancelOrder(orderId) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !canCancelOrder(order.status)) return order
        return { ...order, status: ORDER_STATUS.CANCELLED }
      }),
    )
  }

  function handleUpdateStock(menuId, delta) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === menuId ? { ...item, stock: Math.max(0, item.stock + delta) } : item,
      ),
    )
  }

  return (
    <div className="app">
      {screen === 'order' ? (
        <OrderScreen
          menuItems={menuItems}
          cart={cart}
          setCart={setCart}
          onPlaceOrder={handlePlaceOrder}
          onNavigateAdmin={() => setScreen('admin')}
        />
      ) : (
        <AdminScreen
          menuItems={menuItems}
          orders={orders}
          onUpdateStock={handleUpdateStock}
          onAdvanceOrder={handleAdvanceOrder}
          onCancelOrder={handleCancelOrder}
          onNavigateOrder={() => setScreen('order')}
        />
      )}
    </div>
  )
}
