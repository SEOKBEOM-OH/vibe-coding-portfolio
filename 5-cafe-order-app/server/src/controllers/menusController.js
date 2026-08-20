const { getPool } = require('../config/db')

function mapMenuRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    stock: row.stock,
    options: row.options || [],
  }
}

async function listMenus(_req, res) {
  try {
    const result = await getPool().query(`
      SELECT
        m.id,
        m.name,
        m.description,
        m.price,
        m.image,
        m.stock,
        COALESCE(
          json_agg(
            json_build_object('id', o.id, 'name', o.name, 'price', o.price)
            ORDER BY o.id
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'::json
        ) AS options
      FROM menus m
      LEFT JOIN options o ON o.menu_id = m.id
      GROUP BY m.id
      ORDER BY m.id
    `)
    res.json(result.rows.map(mapMenuRow))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '메뉴를 불러오지 못했습니다.' })
  }
}

async function updateStock(req, res) {
  const menuId = Number(req.params.id)
  const delta = Number(req.body?.delta)

  if (!Number.isInteger(menuId) || menuId <= 0) {
    res.status(400).json({ message: '메뉴 ID가 올바르지 않습니다.' })
    return
  }
  if (delta !== 1 && delta !== -1) {
    res.status(400).json({ message: 'delta는 1 또는 -1 이어야 합니다.' })
    return
  }

  try {
    const result = await getPool().query(
      `UPDATE menus
       SET stock = stock + $1
       WHERE id = $2 AND stock + $1 >= 0
       RETURNING id, name, description, price, image, stock`,
      [delta, menuId],
    )

    if (result.rowCount === 0) {
      const exists = await getPool().query('SELECT id, stock FROM menus WHERE id = $1', [menuId])
      if (exists.rowCount === 0) {
        res.status(404).json({ message: '메뉴를 찾을 수 없습니다.' })
        return
      }
      res.status(400).json({ message: '재고는 0 미만이 될 수 없습니다.' })
      return
    }

    const options = await getPool().query(
      'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
      [menuId],
    )
    res.json(mapMenuRow({ ...result.rows[0], options: options.rows }))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '재고를 수정하지 못했습니다.' })
  }
}

module.exports = { listMenus, updateStock }
