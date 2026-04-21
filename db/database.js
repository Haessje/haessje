const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// 테이블 초기화 (서버 시작 시 자동 실행)
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      plan TEXT DEFAULT NULL,
      plan_expires_at TIMESTAMPTZ DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      order_id TEXT UNIQUE NOT NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      depositor TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      payment_key TEXT DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

init().catch(err => console.error('DB init error:', err));

module.exports = {
  users: {
    async findByEmail(email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
      return rows[0] || null;
    },
    async findById(id) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
      return rows[0] || null;
    },
    async create({ email, password, name, phone }) {
      const { rows } = await pool.query(
        `INSERT INTO users (email, password, name, phone)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [email, password, name, phone || '']
      );
      return rows[0];
    },
    async updatePlan(id, plan, plan_expires_at) {
      await pool.query(
        'UPDATE users SET plan=$1, plan_expires_at=$2 WHERE id=$3',
        [plan, plan_expires_at, id]
      );
    },
    async updatePassword(id, password) {
      await pool.query('UPDATE users SET password=$1 WHERE id=$2', [password, id]);
    },
    async findAll() {
      const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return rows;
    },
  },

  orders: {
    async create({ user_id, order_id, plan, amount, depositor }) {
      const { rows } = await pool.query(
        `INSERT INTO orders (user_id, order_id, plan, amount, depositor)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [user_id, order_id, plan, amount, depositor || '']
      );
      return rows[0];
    },
    async findByOrderId(order_id, user_id) {
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE order_id=$1 AND user_id=$2',
        [order_id, user_id]
      );
      return rows[0] || null;
    },
    async findAnyByOrderId(order_id) {
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE order_id=$1',
        [order_id]
      );
      return rows[0] || null;
    },
    async findByUserId(user_id) {
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',
        [user_id]
      );
      return rows;
    },
    async findAll() {
      const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return rows;
    },
    async updateStatus(order_id, status, payment_key) {
      await pool.query(
        'UPDATE orders SET status=$1, payment_key=$2 WHERE order_id=$3',
        [status, payment_key, order_id]
      );
    },
  },
};
