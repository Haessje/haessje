const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/database');

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name, phone, aff_token, ref_code } = req.body;
  if (!email || !password || !name || !phone) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  }

  try {
    const existing = await db.users.findByEmail(email);
    if (existing) return res.status(409).json({ error: '이미 가입된 이메일입니다.' });

    const existingPhone = await db.users.findByPhone(phone.trim());
    if (existingPhone) return res.status(409).json({ error: '이미 사용 중인 휴대폰 번호입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.users.create({ email, password: hashed, name, phone });

    // 제휴사 초대 토큰으로 가입 → affiliate 등급 + 고유 추천코드 발급
    if (aff_token) {
      const invite = await db.affiliateInvites.findByToken(aff_token);
      if (invite && !invite.used_by_user_id) {
        const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const affExpiry = new Date(); affExpiry.setDate(affExpiry.getDate() + 90);
        await db.users.setAffiliate(user.id, referralCode, affExpiry.toISOString());
        await db.affiliateInvites.markUsed(aff_token, user.id);
      }
    }
    // 추천코드로 가입 → referred 등급 부여
    else if (ref_code) {
      const affiliateUser = await db.users.findByReferralCode(ref_code);
      if (affiliateUser && affiliateUser.user_type === 'affiliate') {
        await db.users.setReferred(user.id, ref_code);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.users.findByEmail(email);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// 내 정보 조회
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    const { password, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
