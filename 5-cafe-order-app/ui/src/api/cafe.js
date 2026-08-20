const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || '요청에 실패했습니다.')
  }
  return data
}

function mapMenu(menu) {
  return {
    id: menu.id,
    name: menu.name,
    description: menu.description,
    price: menu.price,
    image: menu.image,
    stock: menu.stock,
    options: (menu.options || []).map((option) => ({
      id: option.id,
      label: option.name,
      price: option.price,
    })),
  }
}

function mapOrder(order) {
  return {
    id: order.id,
    createdAt: new Date(order.createdAt),
    status: order.status,
    total: order.totalAmount,
    items: (order.items || []).map((item) => ({
      id: item.id,
      menuId: item.menuId,
      menuName: item.name,
      quantity: item.quantity,
      cancelled: Boolean(item.cancelled),
      selectedOptions: (item.options || []).map((option) => ({
        label: option.name,
        price: option.price,
      })),
      unitPrice: item.quantity ? item.amount / item.quantity : 0,
    })),
  }
}

export async function getMenus() {
  const menus = await request('/menus')
  return menus.map(mapMenu)
}

export async function updateMenuStock(menuId, delta) {
  const menu = await request(`/menus/${menuId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  })
  return mapMenu(menu)
}

export async function getOrders() {
  const orders = await request('/orders')
  return orders.map(mapOrder)
}

export function getOrder(orderId) {
  return request(`/orders/${orderId}`).then(mapOrder)
}

export async function createOrder(cart) {
  const payload = {
    items: cart.map((item) => ({
      menuId: item.menuId,
      quantity: item.quantity,
      optionIds: (item.selectedOptions || [])
        .map((option) => option.id)
        .filter((id) => id != null),
    })),
  }
  const order = await request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return mapOrder(order)
}

export async function updateOrderStatus(orderId, status) {
  const order = await request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return mapOrder(order)
}

export async function cancelOrderItem(orderId, itemId) {
  const order = await request(`/orders/${orderId}/items/${itemId}/cancel`, {
    method: 'PATCH',
  })
  return mapOrder(order)
}
