const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const adminMiddleware = require('../middleware/admin');

const PLANS = { start: '스타트패키지', vip: 'VIP서비스' };
const PLAN_DURATIONS = { start: 30, vip: 30 };

// 관리자 권한 확인
router.get('/check', adminMiddleware, (req, res) => {
  res.json({ isAdmin: true, email: req.user.email });
});

// 전체 회원 목록
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = (await db.users.findAll()).map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 전체 주문 목록
router.get('/orders', adminMiddleware, async (req, res) => {
  try {
    const allUsers = await db.users.findAll();
    const orders = (await db.orders.findAll()).map(o => {
      const u = allUsers.find(x => x.id === o.user_id);
      return { ...o, user_email: u?.email, user_name: u?.name };
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 회원 플랜 수동 설정
router.post('/users/:id/plan', adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { plan, extendDays } = req.body;

  try {
    const user = await db.users.findById(userId);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    if (plan === null || plan === '') {
      await db.users.updatePlan(userId, null, null);
      return res.json({ success: true, message: '플랜이 해제되었습니다.' });
    }

    if (!PLANS[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

    const days = Number(extendDays) || 30;
    const baseDate = user.plan_expires_at && new Date(user.plan_expires_at) > new Date()
      ? new Date(user.plan_expires_at)
      : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    await db.users.updatePlan(userId, plan, baseDate.toISOString());
    res.json({ success: true, plan, expiresAt: baseDate.toISOString() });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 주문 입금 확인 (수동 승인)
router.post('/orders/:orderId/confirm', adminMiddleware, async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await db.orders.findAnyByOrderId(orderId);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    if (order.status === 'done') return res.status(409).json({ error: '이미 확인된 주문입니다.' });

    const days = PLAN_DURATIONS[order.plan] || 30;
    const user = await db.users.findById(order.user_id);
    if (!user) return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });

    const baseDate = user.plan_expires_at && new Date(user.plan_expires_at) > new Date()
      ? new Date(user.plan_expires_at)
      : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    await db.orders.updateStatus(orderId, 'done', 'manual-deposit');
    await db.users.updatePlan(order.user_id, order.plan, baseDate.toISOString());

    res.json({ success: true, plan: order.plan, expiresAt: baseDate.toISOString() });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 주문 취소
router.post('/orders/:orderId/cancel', adminMiddleware, async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await db.orders.findAnyByOrderId(orderId);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    await db.orders.updateStatus(orderId, 'cancelled', null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 회원 비밀번호 재설정
router.post('/users/:id/password', adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }

  try {
    const user = await db.users.findById(userId);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.users.updatePassword(userId, hashed);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 통계 요약
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const users = await db.users.findAll();
    const orders = await db.orders.findAll();

    const totalUsers = users.length;
    const activeSubs = users.filter(u =>
      u.plan && u.plan_expires_at && new Date(u.plan_expires_at) > new Date()
    ).length;
    const paidOrders = orders.filter(o => o.status === 'done');
    const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
    const paidCount = paidOrders.length;

    res.json({ totalUsers, activeSubs, totalRevenue, paidCount });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
