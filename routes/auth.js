const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: '필수 항목을 입력해주세요.' });
  }

  if (db.users.findByEmail(email)) {
    return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = db.users.create({ email, password: hashed, name, phone });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { email: user.email, name: user.name } });
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.findByEmail(email);
  if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { email: user.email, name: user.name, plan: user.plan } });
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// 내 정보 조회
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = db.users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

module.exports = router;
