const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// 제휴사 내 정보 (포인트, 추천링크, 초대한 유저 목록)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user || user.user_type !== 'affiliate') {
      return res.status(403).json({ error: '제휴사 계정이 아닙니다.' });
    }
    const referred = await db.users.findReferredBy(user.referral_code);
    const transactions = await db.pointsTransactions.findByUserId(user.id);
    const withdrawals = await db.withdrawalRequests.findByUserId(user.id);

    res.json({
      name: user.name,
      email: user.email,
      points: user.points || 0,
      referral_code: user.referral_code,
      referred_count: referred.length,
      referred_users: referred.map(u => ({
        name: u.name,
        email: u.email,
        plan: u.plan,
        joined_at: u.created_at,
      })),
      transactions,
      withdrawals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 출금 신청
router.post('/withdraw', authMiddleware, async (req, res) => {
  const { points_amount, bank_name, bank_account, bank_holder } = req.body;
  if (!points_amount || points_amount < 10000) {
    return res.status(400).json({ error: '최소 출금 금액은 10,000P입니다.' });
  }
  if (!bank_name || !bank_account || !bank_holder) {
    return res.status(400).json({ error: '계좌 정보를 모두 입력해주세요.' });
  }

  try {
    const user = await db.users.findById(req.user.id);
    if (!user || user.user_type !== 'affiliate') {
      return res.status(403).json({ error: '제휴사 계정이 아닙니다.' });
    }
    if ((user.points || 0) < points_amount) {
      return res.status(400).json({ error: '포인트가 부족합니다.' });
    }

    const fee = Math.floor(points_amount * 0.2);
    const cash_amount = points_amount - fee;

    await db.users.deductPoints(user.id, points_amount);
    await db.pointsTransactions.create({
      user_id: user.id,
      type: 'withdraw',
      amount: -points_amount,
      description: `현금 출금 신청 (수수료 ${fee.toLocaleString()}P 차감)`,
    });
    await db.withdrawalRequests.create({
      user_id: user.id,
      points_amount,
      cash_amount,
      bank_name,
      bank_account,
      bank_holder,
    });

    res.json({ success: true, cash_amount, fee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || '서버 오류' });
  }
});

module.exports = router;
