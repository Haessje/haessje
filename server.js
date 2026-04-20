require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.BASE_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 프론트엔드에 클라이언트 키 주입 (시크릿 키는 절대 노출 안 함)
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.__TOSS_CLIENT_KEY__ = ${JSON.stringify(process.env.TOSS_CLIENT_KEY || '')};`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

// SPA fallback
app.get('*', (req, res) => {
  const pages = ['login', 'register', 'dashboard', 'success', 'fail', 'admin'];
  const page = pages.find(p => req.path === `/${p}`);
  if (page) {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Haessje server running on http://localhost:${PORT}`);
});
