const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// 등급별 가격표
const PRICES = {
  normal:    { hsignal: 165000, start: 383900, vip: 1430000 },
  affiliate: { hsignal:  30000, start: 100000, vip: 1430000 },
  referred:  { hsignal:  70000, start: 200000, vip: 1430000 },
};

// 도매가 (제휴사 포인트 마진 계산 기준)
const WHOLESALE = { hsignal: 30000, start: 100000, vip: 1430000 };

const PLAN_NAMES = {
  hsignal: 'H시그널 지표',
  start: '스타트패키지',
  vip: 'VIP서비스',
};

const BANK_INFO = {
  name: '하나은행',
  account: '497-910013-89204',
  holder: '(주)팔로인',
};

// 내 가격표 조회 (로그인 후 프론트에서 호출)
router.get('/my-prices', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    const userType = user?.user_type || 'normal';
    res.json({ prices: PRICES[userType] || PRICES.normal, user_type: userType });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 주문 생성 (무통장입금)
router.post('/create-order', authMiddleware, async (req, res) => {
  const { plan, depositor } = req.body;
  if (!PLAN_NAMES[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

  const depName = (depositor || '').trim();
  if (!depName) return res.status(400).json({ error: '입금자명을 입력해 주세요.' });

  try {
    const user = await db.users.findById(req.user.id);
    const userType = user?.user_type || 'normal';
    const amount = (PRICES[userType] || PRICES.normal)[plan];
    const name = PLAN_NAMES[plan];

    const orderId = `HSJ${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await db.orders.create({
      user_id: req.user.id,
      order_id: orderId,
      plan,
      amount,
      depositor: depName,
    });

    // referred 유저 결제 시 → 해당 제휴사에 마진 포인트 적립
    if (userType === 'referred' && user.referred_by) {
      const affiliateUser = await db.users.findByReferralCode(user.referred_by);
      if (affiliateUser) {
        const margin = amount - WHOLESALE[plan];
        if (margin > 0) {
          await db.users.addPoints(affiliateUser.id, margin);
          await db.pointsTransactions.create({
            user_id: affiliateUser.id,
            type: 'earn',
            amount: margin,
            description: `${name} 판매 마진 (${user.name}님)`,
            order_id: orderId,
          });
          // 결제 발생 시 제휴사 만료일 오늘 기준 +90일로 갱신
          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + 90);
          const curExpiry = affiliateUser.affiliate_expires_at ? new Date(affiliateUser.affiliate_expires_at) : null;
          if (!curExpiry || curExpiry < newExpiry) {
            await db.users.setAffiliateExpiry(affiliateUser.id, newExpiry.toISOString());
          }
        }
      }
    }

    res.json({ orderId, amount, planName: name, depositor: depName, bank: BANK_INFO });
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
module.exports.WHOLESALE = WHOLESALE;
