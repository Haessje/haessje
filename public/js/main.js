/* ── Haessje main.js ── */

// 파티클 캔버스
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, a: Math.random(),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,255,0,${p.a * 0.6})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// GSAP 애니메이션
gsap.registerPlugin(ScrollTrigger);

// Hero 애니메이션
gsap.timeline({ delay: 0.3 })
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
  .to('.hero-title .line span', {
    y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
  }, '-=0.4')
  .to('.hero-desc', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
  .to('.hero-cta', { opacity: 1, duration: 0.5 }, '-=0.2');

// Hero 타이틀 내 span 초기 설정
document.querySelectorAll('.hero-title .line').forEach(line => {
  const text = line.textContent;
  line.innerHTML = `<span>${text}</span>`;
});
gsap.set('.hero-title .line span', { y: '100%' });

// 스크롤 reveal
document.querySelectorAll('.pkg-card, .feature-card, .timeline-item, .acc-item').forEach(el => {
  el.classList.add('reveal');
  ScrollTrigger.create({
    trigger: el, start: 'top 85%',
    onEnter: () => el.classList.add('visible'),
  });
});

// 네브바 스크롤 효과
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('bottom-bar').classList.toggle('visible', window.scrollY > 400);
});

// 타임라인 fill 애니메이션
document.querySelectorAll('.timeline-item').forEach(item => {
  ScrollTrigger.create({
    trigger: item, start: 'top 75%',
    onEnter: () => item.querySelector('.tl-fill').style.height = '100%',
  });
});

// 체크리스트
const checkboxes = document.querySelectorAll('.check-item input');
const result = document.getElementById('checklist-result');
checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    cb.closest('.check-item').classList.toggle('checked', cb.checked);
    const checkedCount = [...checkboxes].filter(c => c.checked).length;
    if (checkedCount >= 3) {
      result.classList.remove('hidden');
    }
  });
});

// 패키지 카드 플립
document.querySelectorAll('.pkg-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.classList.contains('btn-buy') || e.target.closest('.btn-buy') ||
        e.target.classList.contains('btn-outline') || e.target.closest('.btn-outline')) return;
    card.classList.toggle('flipped');
  });
});

function flipBack(btn) {
  btn.closest('.pkg-card').classList.remove('flipped');
}

// FAQ 아코디언
document.querySelectorAll('.acc-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.acc-q').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── 주문 (무통장입금) ──
let currentOrder = null;

async function startPurchase(plan, amount, planName) {
  // 로그인 체크
  try {
    const me = await fetch('/api/auth/me', { credentials: 'include' });
    if (!me.ok) { showAuthModal(); return; }
  } catch { showAuthModal(); return; }

  // 주문 생성
  let orderData;
  try {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    orderData = await res.json();
    if (!res.ok) { alert(orderData.error || '주문 생성 실패'); return; }
  } catch { alert('서버 오류가 발생했습니다.'); return; }

  currentOrder = orderData;

  document.getElementById('modal-plan-name').textContent = planName;
  document.getElementById('modal-price').textContent = `₩${amount.toLocaleString()}/월`;
  document.getElementById('bank-name').textContent = orderData.bank.name;
  document.getElementById('bank-account').textContent = orderData.bank.account;
  document.getElementById('bank-holder').textContent = orderData.bank.holder;
  document.getElementById('bank-amount').textContent = `${amount.toLocaleString()}원`;
  document.getElementById('bank-order-id').textContent = orderData.orderId;

  document.getElementById('pay-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('pay-modal').classList.add('hidden');
  currentOrder = null;
}

// 클립보드 복사
function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text.trim()).then(() => {
    showToast(`복사됨: ${text.trim()}`);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text.trim();
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(`복사됨: ${text.trim()}`); } catch {}
    document.body.removeChild(ta);
  });
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

// 로그인 상태 확인
(async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      document.getElementById('nav-login-btn')?.classList.add('hidden');
      document.getElementById('nav-register-btn')?.classList.add('hidden');
      document.getElementById('nav-dashboard-btn')?.classList.remove('hidden');
    }
  } catch {}
})();
