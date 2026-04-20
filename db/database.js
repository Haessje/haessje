const fs = require('fs');
const path = require('path');

const DB_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, 'haessje.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], orders: [], nextUserId: 1, nextOrderId: 1 };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { users: [], orders: [], nextUserId: 1, nextOrderId: 1 };
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  users: {
    findByEmail(email) {
      return load().users.find(u => u.email === email);
    },
    findById(id) {
      return load().users.find(u => u.id === id);
    },
    create({ email, password, name, phone }) {
      const db = load();
      const user = {
        id: db.nextUserId++,
        email,
        password,
        name,
        phone: phone || '',
        plan: null,
        plan_expires_at: null,
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
      save(db);
      return user;
    },
    updatePlan(id, plan, plan_expires_at) {
      const db = load();
      const user = db.users.find(u => u.id === id);
      if (user) {
        user.plan = plan;
        user.plan_expires_at = plan_expires_at;
        save(db);
      }
    },
  },
  orders: {
    create({ user_id, order_id, plan, amount }) {
      const db = load();
      const order = {
        id: db.nextOrderId++,
        user_id,
        order_id,
        plan,
        amount,
        status: 'pending',
        payment_key: null,
        created_at: new Date().toISOString(),
      };
      db.orders.push(order);
      save(db);
      return order;
    },
    findByOrderId(order_id, user_id) {
      return load().orders.find(o => o.order_id === order_id && o.user_id === user_id);
    },
    findByUserId(user_id) {
      return load().orders
        .filter(o => o.user_id === user_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    updateStatus(order_id, status, payment_key) {
      const db = load();
      const order = db.orders.find(o => o.order_id === order_id);
      if (order) {
        order.status = status;
        order.payment_key = payment_key;
        save(db);
      }
    },
  },
};
