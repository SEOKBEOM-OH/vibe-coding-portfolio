const { getPool } = require('./db')

const SEED_MENUS = [
  {
    name: '아메리카노(ICE)',
    description: '차갑고 깔끔한 블랙 에스프레소',
    price: 4000,
    image: '/menu/americano-ice.png',
    stock: 10,
  },
  {
    name: '아메리카노(HOT)',
    description: '따뜻하게 즐기는 클래식 아메리카노',
    price: 4000,
    image: '/menu/americano-hot.png',
    stock: 8,
  },
  {
    name: '카페라떼(ICE)',
    description: '부드러운 우유와 에스프레소의 조화',
    price: 4500,
    image: '/menu/cafe-latte-ice.png',
    stock: 6,
  },
  {
    name: '카페라떼(HOT)',
    description: '따뜻한 우유 거품이 올라간 라떼',
    price: 4500,
    image: '/menu/cafe-latte-hot.png',
    stock: 5,
  },
  {
    name: '카푸치노',
    description: '풍성한 밀크폼의 진한 에스프레소',
    price: 5000,
    image: '/menu/cappuccino.png',
    stock: 7,
  },
  {
    name: '바닐라라떼',
    description: '달콤한 바닐라 향이 은은하게',
    price: 5000,
    image: '/menu/vanilla-latte.png',
    stock: 4,
  },
]

const SEED_OPTIONS = [
  { name: '샷 추가', price: 500 },
  { name: '시럽 추가', price: 0 },
]

async function initSchema() {
  const pool = getPool()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT '주문 접수',
      total_amount INTEGER NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_id INTEGER REFERENCES menus(id),
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      amount INTEGER NOT NULL,
      cancelled BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)

  await pool.query(`
    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS cancelled BOOLEAN NOT NULL DEFAULT FALSE
  `)

  const count = await pool.query('SELECT COUNT(*)::int AS count FROM menus')
  if (count.rows[0].count === 0) {
    for (const menu of SEED_MENUS) {
      const inserted = await pool.query(
        `INSERT INTO menus (name, description, price, image, stock)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [menu.name, menu.description, menu.price, menu.image, menu.stock],
      )
      const menuId = inserted.rows[0].id
      for (const option of SEED_OPTIONS) {
        await pool.query(
          `INSERT INTO options (menu_id, name, price) VALUES ($1, $2, $3)`,
          [menuId, option.name, option.price],
        )
      }
    }
    console.log('초기 메뉴 데이터를 넣었습니다.')
  }

  for (const menu of SEED_MENUS) {
    await pool.query('UPDATE menus SET image = $1 WHERE name = $2', [menu.image, menu.name])
  }
}

module.exports = { initSchema }
