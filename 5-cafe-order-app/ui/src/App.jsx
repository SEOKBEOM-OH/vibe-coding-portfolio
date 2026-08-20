import { useEffect, useState } from 'react'
import OrderScreen from './screens/OrderScreen'
import AdminScreen from './screens/AdminScreen'
import {
  cancelOrderItem,
  createOrder,
  getMenus,
  getOrders,
  updateMenuStock,
  updateOrderStatus,
} from './api/cafe'
import { NEXT_STATUS, ORDER_STATUS } from './constants/orderStatus'

export default function App() {
  const [screen, setScreen] = useState('order')
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [error, setError] = useState('')

  async function loadMenus() {
    const menus = await getMenus()
    setMenuItems(menus)
  }

  async function loadOrders() {
    const nextOrders = await getOrders()
    setOrders(nextOrders)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setError('')
        await loadMenus()
        if (screen === 'admin') {
          await loadOrders()
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [screen])

  async function handlePlaceOrder() {
    if (cart.length === 0) return
    await createOrder(cart)
    setCart([])
    await loadMenus()
  }

  async function handleAdvanceOrder(orderId) {
    const order = orders.find((item) => item.id === orderId)
    const nextStatus = NEXT_STATUS[order?.status]
    if (!nextStatus) return
    const updated = await updateOrderStatus(orderId, nextStatus)
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  async function handleCancelOrder(orderId) {
    const updated = await updateOrderStatus(orderId, ORDER_STATUS.CANCELLED)
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    await loadMenus()
  }

  async function handleCancelOrderItem(orderId, itemId) {
    const updated = await cancelOrderItem(orderId, itemId)
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    await loadMenus()
  }

  async function handleUpdateStock(menuId, delta) {
    const updated = await updateMenuStock(menuId, delta)
    setMenuItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  async function wrapped(action) {
    try {
      setError('')
      await action()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return (
    <div className="app">
      {error && <div className="app__error">{error}</div>}
      {screen === 'order' ? (
        <OrderScreen
          menuItems={menuItems}
          cart={cart}
          setCart={setCart}
          onPlaceOrder={() => wrapped(handlePlaceOrder)}
          onNavigateAdmin={() => setScreen('admin')}
        />
      ) : (
        <AdminScreen
          menuItems={menuItems}
          orders={orders}
          onUpdateStock={(menuId, delta) => wrapped(() => handleUpdateStock(menuId, delta))}
          onAdvanceOrder={(orderId) => wrapped(() => handleAdvanceOrder(orderId))}
          onCancelOrder={(orderId) => wrapped(() => handleCancelOrder(orderId))}
          onCancelOrderItem={(orderId, itemId) => wrapped(() => handleCancelOrderItem(orderId, itemId))}
          onNavigateOrder={() => setScreen('order')}
        />
      )}
    </div>
  )
}
