const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const PLANS = {
  start: { name: '스타트패키지', amount: 99000, duration: 30 },
  vip: { name: 'VIP서비스', amount: 199000, duration: 30 },
  svip: { name: 'S-VIP서비스', amount: 399000, duration: 30 },
};

// 주문 생성
router.post('/create-order', authMiddleware, (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

  const orderId = `HSJ-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const { amount, name } = PLANS[plan];

  db.orders.create({ user_id: req.user.id, order_id: orderId, plan, amount });

  res.json({ orderId, amount, planName: name });
});

// 결제 승인 (토스페이먼츠 콜백)
router.post('/confirm', authMiddleware, async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  const order = db.orders.findByOrderId(orderId, req.user.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  if (order.amount !== amount) return res.status(400).json({ error: '결제 금액이 일치하지 않습니다.' });
  if (order.status === 'done') return res.status(409).json({ error: '이미 완료된 결제입니다.' });

  try {
    const encKey = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64');
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      { headers: { Authorization: `Basic ${encKey}`, 'Content-Type': 'application/json' } }
    );

    if (response.data.status === 'DONE') {
      const plan = PLANS[order.plan];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration);

      db.orders.updateStatus(orderId, 'done', paymentKey);
      db.users.updatePlan(req.user.id, order.plan, expiresAt.toISOString());

      res.json({ success: true, plan: order.plan, expiresAt: expiresAt.toISOString() });
    } else {
      res.status(400).json({ error: '결제가 완료되지 않았습니다.' });
    }
  } catch (err) {
    const msg = err.response?.data?.message || '결제 승인 중 오류가 발생했습니다.';
    res.status(500).json({ error: msg });
  }
});

// 구매 내역 조회
router.get('/orders', authMiddleware, (req, res) => {
  const orders = db.orders.findByUserId(req.user.id).map(o => ({
    order_id: o.order_id,
    plan: o.plan,
    amount: o.amount,
    status: o.status,
    created_at: o.created_at,
  }));
  res.json({ orders });
});

module.exports = router;
