const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const PLANS = {
  start: { name: '스타트패키지', amount: 199000, duration: 30 },
  vip: { name: 'VIP서비스', amount: 499000, duration: 30 },
};

const BANK_INFO = {
  name: '하나은행',
  account: '497-910013-89204',
  holder: '(주)팔로인',
};

// 주문 생성 (무통장입금)
router.post('/create-order', authMiddleware, async (req, res) => {
  const { plan, depositor } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

  const depName = (depositor || '').trim();
  if (!depName) return res.status(400).json({ error: '입금자명을 입력해 주세요.' });

  const orderId = `HSJ${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const { amount, name } = PLANS[plan];

  try {
    await db.orders.create({
      user_id: req.user.id,
      order_id: orderId,
      plan,
      amount,
      depositor: depName,
    });

    res.json({
      orderId,
      amount,
      planName: name,
      depositor: depName,
      bank: BANK_INFO,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 생성 중 오류가 발생했습니다.' });
  }
});

// 구매 내역 조회
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = (await db.orders.findByUserId(req.user.id)).map(o => ({
      order_id: o.order_id,
      plan: o.plan,
      amount: o.amount,
      depositor: o.depositor || '',
      status: o.status,
      created_at: o.created_at,
    }));
    res.json({ orders, bank: BANK_INFO });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
