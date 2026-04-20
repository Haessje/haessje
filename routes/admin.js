const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const adminMiddleware = require('../middleware/admin');

const PLANS = { start: '스타트패키지', vip: 'VIP서비스', svip: 'S-VIP서비스' };
const PLAN_DURATIONS = { start: 30, vip: 30, svip: 30 };

// 관리자 권한 확인
router.get('/check', adminMiddleware, (req, res) => {
  res.json({ isAdmin: true, email: req.user.email });
});

// 전체 회원 목록
function loadRaw() {
  const fs = require('fs');
  const path = require('path');
  const DB_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'db');
  const DB_PATH = path.join(DB_DIR, 'haessje.json');
  return fs.existsSync(DB_PATH)
    ? JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    : { users: [], orders: [] };
}

router.get('/users', adminMiddleware, (req, res) => {
  const raw = loadRaw();

  const users = raw.users.map(u => {
    const { password, ...safe } = u;
    return safe;
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));

  res.json({ users });
});

// 전체 주문 목록
router.get('/orders', adminMiddleware, (req, res) => {
  const raw = loadRaw();
  const orders = raw.orders.map(o => {
    const u = raw.users.find(x => x.id === o.user_id);
    return { ...o, user_email: u?.email, user_name: u?.name };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));

  res.json({ orders });
});

// 회원 플랜 수동 설정 (환불 시 플랜 해제 또는 수동 부여)
router.post('/users/:id/plan', adminMiddleware, (req, res) => {
  const userId = parseInt(req.params.id);
  const { plan, extendDays } = req.body;

  const user = db.users.findById(userId);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

  if (plan === null || plan === '') {
    // 플랜 해제 (환불)
    db.users.updatePlan(userId, null, null);
    return res.json({ success: true, message: '플랜이 해제되었습니다.' });
  }

  if (!PLANS[plan]) return res.status(400).json({ error: '유효하지 않은 플랜입니다.' });

  // 만료일 계산: 기존 만료일 + extendDays (기본 30일)
  const days = Number(extendDays) || 30;
  const baseDate = user.plan_expires_at && new Date(user.plan_expires_at) > new Date()
    ? new Date(user.plan_expires_at)
    : new Date();
  baseDate.setDate(baseDate.getDate() + days);

  db.users.updatePlan(userId, plan, baseDate.toISOString());
  res.json({ success: true, plan, expiresAt: baseDate.toISOString() });
});

// 주문 입금 확인 (수동 승인)
router.post('/orders/:orderId/confirm', adminMiddleware, (req, res) => {
  const { orderId } = req.params;
  const order = db.orders.findAnyByOrderId(orderId);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  if (order.status === 'done') return res.status(409).json({ error: '이미 확인된 주문입니다.' });

  const days = PLAN_DURATIONS[order.plan] || 30;
  const user = db.users.findById(order.user_id);
  if (!user) return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });

  const baseDate = user.plan_expires_at && new Date(user.plan_expires_at) > new Date()
    ? new Date(user.plan_expires_at)
    : new Date();
  baseDate.setDate(baseDate.getDate() + days);

  db.orders.updateStatus(orderId, 'done', 'manual-deposit');
  db.users.updatePlan(order.user_id, order.plan, baseDate.toISOString());

  res.json({ success: true, plan: order.plan, expiresAt: baseDate.toISOString() });
});

// 주문 취소
router.post('/orders/:orderId/cancel', adminMiddleware, (req, res) => {
  const { orderId } = req.params;
  const order = db.orders.findAnyByOrderId(orderId);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });

  db.orders.updateStatus(orderId, 'cancelled', null);
  res.json({ success: true });
});

// 회원 비밀번호 재설정
router.post('/users/:id/password', adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }

  const user = db.users.findById(userId);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.users.updatePassword(userId, hashed);
  res.json({ success: true });
});

// 통계 요약
router.get('/stats', adminMiddleware, (req, res) => {
  const raw = loadRaw();
  const totalUsers = raw.users.length;
  const activeSubs = raw.users.filter(u =>
    u.plan && u.plan_expires_at && new Date(u.plan_expires_at) > new Date()
  ).length;
  const paidOrders = raw.orders.filter(o => o.status === 'done');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
  const paidCount = paidOrders.length;

  res.json({ totalUsers, activeSubs, totalRevenue, paidCount });
});

module.exports = router;
