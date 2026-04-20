const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const PLANS = {
  start: { name: '스타트패키지', amount: 99000, duration: 30 },
  vip: { name: 'VIP서비스', amount: 199000, duration: 30 },
  svip: { name: 'S-VIP서비스', amount: 399000, duration: 30 },
};

const BANK_INFO = {
  name: '하나은행',
  account: '497-910013-89204',
  holder: '(주)팔로인',
};

// 주문 생성 (무통장입금)
router.post('/create-order', authMiddleware, (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

  // 짧은 주문번호 (입금자명 용도, 9자): HSJ + 6자 hex
  const orderId = `HSJ${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const { amount, name } = PLANS[plan];

  db.orders.create({ user_id: req.user.id, order_id: orderId, plan, amount });

  res.json({
    orderId,
    amount,
    planName: name,
    bank: BANK_INFO,
  });
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
  res.json({ orders, bank: BANK_INFO });
});

module.exports = router;
