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

// ── 결제 ──
let tossPayments = null;
let widgets = null;
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
  document.getElementById('pay-modal').classList.remove('hidden');

  const confirmBtn = document.getElementById('pay-confirm-btn');
  const wrapper = document.getElementById('payment-widget-wrapper');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '결제 수단 로딩 중...';
  wrapper.innerHTML = '<p style="color:#888;font-size:13px;text-align:center;padding:20px;">결제 위젯 불러오는 중...</p>';

  const clientKey = window.__TOSS_CLIENT_KEY__;

  if (!window.TossPayments) {
    wrapper.innerHTML = '<p style="color:#ff5555;font-size:13px;text-align:center;padding:20px;">❌ 토스페이먼츠 SDK 로드 실패<br/>네트워크 또는 광고차단 확장프로그램을 확인해주세요.</p>';
    console.error('window.TossPayments is undefined - CDN 로드 실패');
    return;
  }
  if (!clientKey || clientKey.startsWith('test_ck_placeholder')) {
    wrapper.innerHTML = '<p style="color:#ff5555;font-size:13px;text-align:center;padding:20px;">❌ 결제 키가 설정되지 않았습니다.<br/>관리자에게 문의해주세요.</p>';
    console.error('TOSS_CLIENT_KEY가 설정되지 않음. /config.js 확인 필요');
    return;
  }

  try {
    tossPayments = TossPayments(clientKey);
    widgets = tossPayments.widgets({ customerKey: `user-${Date.now()}` });
    await widgets.setAmount({ currency: 'KRW', value: amount });
    wrapper.innerHTML = '';
    await widgets.renderPaymentMethods({
      selector: '#payment-widget-wrapper',
      variantKey: 'DEFAULT',
    });
    confirmBtn.disabled = false;
    confirmBtn.textContent = '결제하기';
  } catch (e) {
    console.error('결제 위젯 초기화 오류:', e);
    wrapper.innerHTML = `<p style="color:#ff5555;font-size:13px;text-align:center;padding:20px;">❌ 결제 수단 로드 오류<br/><span style="color:#888;font-size:11px;">${e.message || e}</span></p>`;
    widgets = null;
  }
}

async function confirmPayment() {
  if (!currentOrder) return;
  if (!widgets) {
    alert('결제 수단이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const btn = document.getElementById('pay-confirm-btn');
  btn.textContent = '처리 중...'; btn.disabled = true;

  try {
    await widgets.requestPayment({
      orderId: currentOrder.orderId,
      orderName: document.getElementById('modal-plan-name').textContent,
      successUrl: `${window.location.origin}/success?orderId=${currentOrder.orderId}`,
      failUrl: `${window.location.origin}/fail`,
    });
  } catch (e) {
    console.error('결제 요청 오류:', e);
    alert(e.message || '결제 중 오류가 발생했습니다.');
    btn.textContent = '결제하기'; btn.disabled = false;
  }
}

function closeModal() {
  document.getElementById('pay-modal').classList.add('hidden');
  currentOrder = null;
  widgets = null;
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
