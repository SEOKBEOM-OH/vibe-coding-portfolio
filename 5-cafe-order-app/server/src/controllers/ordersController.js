const { getPool } = require('../config/db')

const STATUS = {
  RECEIVED: '주문 접수',
  MAKING: '제조 중',
  DONE: '제조 완료',
  CANCELLED: '주문 취소',
}

const NEXT_STATUS = {
  [STATUS.RECEIVED]: STATUS.MAKING,
  [STATUS.MAKING]: STATUS.DONE,
}

function canCancel(status) {
  return status === STATUS.RECEIVED || status === STATUS.MAKING
}

function mapOrder(orderRow, itemRows) {
  return {
    id: orderRow.id,
    createdAt: orderRow.created_at,
    status: orderRow.status,
    totalAmount: orderRow.total_amount,
    items: itemRows.map((item) => ({
      id: item.id,
      menuId: item.menu_id,
      name: item.name,
      quantity: item.quantity,
      options: item.options || [],
      amount: item.amount,
      cancelled: Boolean(item.cancelled),
    })),
  }
}

async function restoreItemStock(client, item) {
  if (!item.menu_id) return
  await client.query('UPDATE menus SET stock = stock + $1 WHERE id = $2', [item.quantity, item.menu_id])
}

async function getOrderBundle(client, orderId) {
  const orderResult = await client.query(
    'SELECT id, created_at, status, total_amount FROM orders WHERE id = $1',
    [orderId],
  )
  if (orderResult.rowCount === 0) return null
  const itemsResult = await client.query(
    `SELECT id, menu_id, name, quantity, options, amount, cancelled
     FROM order_items
     WHERE order_id = $1
     ORDER BY id`,
    [orderId],
  )
  return mapOrder(orderResult.rows[0], itemsResult.rows)
}

async function listOrders(_req, res) {
  const pool = getPool()
  try {
    const orders = await pool.query(
      'SELECT id, created_at, status, total_amount FROM orders ORDER BY created_at DESC, id DESC',
    )
    const items = await pool.query(
      `SELECT id, order_id, menu_id, name, quantity, options, amount, cancelled
       FROM order_items
       ORDER BY id`,
    )
    const itemsByOrder = new Map()
    for (const item of items.rows) {
      const list = itemsByOrder.get(item.order_id) || []
      list.push(item)
      itemsByOrder.set(item.order_id, list)
    }
    res.json(orders.rows.map((order) => mapOrder(order, itemsByOrder.get(order.id) || [])))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '주문 목록을 불러오지 못했습니다.' })
  }
}

async function getOrder(req, res) {
  const orderId = Number(req.params.id)
  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: '주문 ID가 올바르지 않습니다.' })
    return
  }

  try {
    const order = await getOrderBundle(getPool(), orderId)
    if (!order) {
      res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
      return
    }
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '주문을 불러오지 못했습니다.' })
  }
}

async function createOrder(req, res) {
  const items = req.body?.items
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: '주문할 메뉴가 없습니다.' })
    return
  }

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const prepared = []
    let totalAmount = 0

    for (const item of items) {
      const menuId = Number(item.menuId)
      const quantity = Number(item.quantity)
      const optionIds = [
        ...new Set(
          (Array.isArray(item.optionIds) ? item.optionIds : [])
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ]

      if (!Number.isInteger(menuId) || menuId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error('메뉴 ID 또는 수량이 올바르지 않습니다.')
        error.status = 400
        throw error
      }

      const menuResult = await client.query(
        'SELECT id, name, price, stock FROM menus WHERE id = $1 FOR UPDATE',
        [menuId],
      )
      if (menuResult.rowCount === 0) {
        const error = new Error('메뉴를 찾을 수 없습니다.')
        error.status = 400
        throw error
      }
      const menu = menuResult.rows[0]

      let selectedOptions = []
      if (optionIds.length > 0) {
        const optionResult = await client.query(
          'SELECT id, name, price FROM options WHERE menu_id = $1 AND id = ANY($2::int[])',
          [menuId, optionIds],
        )
        if (optionResult.rowCount !== optionIds.length) {
          const error = new Error('옵션 ID가 올바르지 않습니다.')
          error.status = 400
          throw error
        }
        selectedOptions = optionResult.rows.map((row) => ({
          name: row.name,
          price: row.price,
        }))
      }

      const unitPrice = menu.price + selectedOptions.reduce((sum, option) => sum + option.price, 0)
      const amount = unitPrice * quantity
      totalAmount += amount
      prepared.push({ menu, quantity, selectedOptions, amount })
    }

    const qtyByMenu = new Map()
    for (const row of prepared) {
      qtyByMenu.set(row.menu.id, (qtyByMenu.get(row.menu.id) || 0) + row.quantity)
    }

    for (const [menuId, quantity] of qtyByMenu) {
      const menu = prepared.find((row) => row.menu.id === menuId).menu
      if (menu.stock < quantity) {
        const error = new Error(`${menu.name} 재고가 부족합니다.`)
        error.status = 400
        throw error
      }
      await client.query('UPDATE menus SET stock = stock - $1 WHERE id = $2', [quantity, menuId])
    }

    const orderResult = await client.query(
      `INSERT INTO orders (status, total_amount)
       VALUES ($1, $2)
       RETURNING id, created_at, status, total_amount`,
      [STATUS.RECEIVED, totalAmount],
    )
    const order = orderResult.rows[0]

    for (const row of prepared) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, name, quantity, options, amount)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
        [order.id, row.menu.id, row.menu.name, row.quantity, JSON.stringify(row.selectedOptions), row.amount],
      )
    }

    await client.query('COMMIT')
    const created = await getOrderBundle(client, order.id)
    res.status(201).json(created)
  } catch (error) {
    await client.query('ROLLBACK')
    const status = error.status || 500
    if (status === 500) console.error(error)
    res.status(status).json({ message: error.message || '주문을 저장하지 못했습니다.' })
  } finally {
    client.release()
  }
}

async function updateStatus(req, res) {
  const orderId = Number(req.params.id)
  const nextStatus = req.body?.status

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: '주문 ID가 올바르지 않습니다.' })
    return
  }
  if (!nextStatus) {
    res.status(400).json({ message: '변경할 상태가 없습니다.' })
    return
  }

  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const current = await client.query('SELECT id, status FROM orders WHERE id = $1 FOR UPDATE', [orderId])
    if (current.rowCount === 0) {
      const error = new Error('주문을 찾을 수 없습니다.')
      error.status = 404
      throw error
    }

    const status = current.rows[0].status
    const allowed =
      NEXT_STATUS[status] === nextStatus || (nextStatus === STATUS.CANCELLED && canCancel(status))

    if (!allowed) {
      const error = new Error(`'${status}'에서는 '${nextStatus}'로 바꿀 수 없습니다.`)
      error.status = 400
      throw error
    }

    if (nextStatus === STATUS.CANCELLED) {
      const items = await client.query(
        `SELECT id, menu_id, quantity
         FROM order_items
         WHERE order_id = $1 AND cancelled = FALSE
         FOR UPDATE`,
        [orderId],
      )
      for (const item of items.rows) {
        await restoreItemStock(client, item)
      }
      await client.query(
        'UPDATE order_items SET cancelled = TRUE WHERE order_id = $1 AND cancelled = FALSE',
        [orderId],
      )
      await client.query('UPDATE orders SET status = $1, total_amount = 0 WHERE id = $2', [
        STATUS.CANCELLED,
        orderId,
      ])
    } else {
      await client.query('UPDATE orders SET status = $1 WHERE id = $2', [nextStatus, orderId])
    }

    await client.query('COMMIT')
    const updated = await getOrderBundle(client, orderId)
    res.json(updated)
  } catch (error) {
    await client.query('ROLLBACK')
    const status = error.status || 500
    if (status === 500) console.error(error)
    res.status(status).json({ message: error.message || '주문 상태를 바꾸지 못했습니다.' })
  } finally {
    client.release()
  }
}

async function cancelItem(req, res) {
  const orderId = Number(req.params.id)
  const itemId = Number(req.params.itemId)

  if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ message: '주문 또는 항목 ID가 올바르지 않습니다.' })
    return
  }

  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const orderResult = await client.query(
      'SELECT id, status FROM orders WHERE id = $1 FOR UPDATE',
      [orderId],
    )
    if (orderResult.rowCount === 0) {
      const error = new Error('주문을 찾을 수 없습니다.')
      error.status = 404
      throw error
    }

    const orderStatus = orderResult.rows[0].status
    if (!canCancel(orderStatus)) {
      const error = new Error(`'${orderStatus}' 주문에서는 항목을 취소할 수 없습니다.`)
      error.status = 400
      throw error
    }

    const itemResult = await client.query(
      `SELECT id, menu_id, quantity, amount, cancelled
       FROM order_items
       WHERE id = $1 AND order_id = $2
       FOR UPDATE`,
      [itemId, orderId],
    )
    if (itemResult.rowCount === 0) {
      const error = new Error('주문 항목을 찾을 수 없습니다.')
      error.status = 404
      throw error
    }

    const item = itemResult.rows[0]
    if (item.cancelled) {
      const error = new Error('이미 취소된 항목입니다.')
      error.status = 400
      throw error
    }

    await client.query('UPDATE order_items SET cancelled = TRUE WHERE id = $1', [itemId])
    await restoreItemStock(client, item)

    const remaining = await client.query(
      `SELECT COALESCE(SUM(amount), 0)::int AS total, COUNT(*)::int AS count
       FROM order_items
       WHERE order_id = $1 AND cancelled = FALSE`,
      [orderId],
    )
    const nextTotal = remaining.rows[0].total
    const nextStatus = remaining.rows[0].count === 0 ? STATUS.CANCELLED : orderStatus

    await client.query('UPDATE orders SET status = $1, total_amount = $2 WHERE id = $3', [
      nextStatus,
      nextTotal,
      orderId,
    ])

    await client.query('COMMIT')
    const updated = await getOrderBundle(client, orderId)
    res.json(updated)
  } catch (error) {
    await client.query('ROLLBACK')
    const status = error.status || 500
    if (status === 500) console.error(error)
    res.status(status).json({ message: error.message || '주문 항목을 취소하지 못했습니다.' })
  } finally {
    client.release()
  }
}

module.exports = { listOrders, getOrder, createOrder, updateStatus, cancelItem }
