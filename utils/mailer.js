const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.naver.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.NAVER_EMAIL,
    pass: process.env.NAVER_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

// 시작 시 환경변수 확인
console.log('[Mailer] NAVER_EMAIL:', process.env.NAVER_EMAIL ? '설정됨' : '없음');
console.log('[Mailer] NAVER_PASSWORD:', process.env.NAVER_PASSWORD ? '설정됨' : '없음');

const TEMPLATES = {
  start: (userName) => ({
    subject: '성공적인 투자의 시작, 스타트패키지 가이드 안내',
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- 헤더 -->
    <div style="background:#08080c;padding:32px 40px;text-align:center;">
      <span style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
        Haessje<span style="color:#d4ff00;">.</span>
      </span>
    </div>

    <!-- 본문 -->
    <div style="padding:40px;">
      <p style="font-size:15px;line-height:1.8;color:#333;">
        안녕하세요, <strong>${userName}</strong> 님.<br/>
        주식 시장의 새로운 시그널 <strong>했제</strong>의 스타트패키지를 이용해주셔서 감사합니다.
      </p>
      <p style="font-size:15px;line-height:1.8;color:#333;">
        스타트패키지 이용 고객님을 위한 전용 혜택과 이용 방법을 안내해 드립니다.<br/>
        본 메시지는 고객님의 수익을 설계할 최적의 환경을 구축하는 첫 단계입니다.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:28px 0;"/>

      <!-- 1단계 -->
      <div style="margin-bottom:28px;">
        <p style="font-size:15px;font-weight:700;color:#111;margin-bottom:10px;">
          1️⃣ 실시간 대응과 알고리즘 운용 팁을 공유받을 수 있는 비공개 채널입니다.<br/>
          아래 링크를 통해 텔레그램 채널에 입장해 주시기 바랍니다.
        </p>
        <a href="https://t.me/+OpDy22dVGv5iOGU1"
           style="display:inline-block;background:#d4ff00;color:#000;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
          입장하기 ▶
        </a>
      </div>

      <!-- 2단계 -->
      <div style="margin-bottom:28px;">
        <p style="font-size:15px;font-weight:700;color:#111;margin-bottom:10px;">
          2️⃣ 입장 후 카톡으로 텔레그램 닉네임을 보내주세요
        </p>
        <a href="https://pf.kakao.com/_xjIzxen/chat"
           style="display:inline-block;background:#FEE500;color:#000;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
          닉네임 보내기 ▶
        </a>
      </div>

      <!-- 3단계 -->
      <div style="background:#f8f8f8;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="font-size:15px;font-weight:700;color:#111;margin-bottom:12px;">3️⃣ 이용 방법</p>
        <ul style="font-size:14px;color:#444;line-height:2;padding-left:18px;margin:0;">
          <li>H시그널에 포착된 종목은 매일 <strong>15시 10분</strong>에 발송됩니다.</li>
          <li>조건 충족 메시지를 확인 후 원하시는 증권사에서 매수를 합니다.</li>
          <li>조건 충족 시점으로 <strong>5%~30%</strong> 원하시는 곳에 매도를 합니다.</li>
        </ul>
      </div>

      <!-- 4단계 -->
      <div style="background:#fff8e1;border-left:4px solid #ffd700;border-radius:0 10px 10px 0;padding:20px 24px;margin-bottom:28px;">
        <p style="font-size:15px;font-weight:700;color:#111;margin-bottom:12px;">4️⃣ 유의 사항</p>
        <ul style="font-size:14px;color:#555;line-height:2;padding-left:18px;margin:0;">
          <li>H시그널에 포착된 종목은 했제가 만들어낸 특별 기법으로 충족된 종목들만 전달드립니다.</li>
          <li>매수 시점부터 3개월간 5% 상승이 안 됐다면 손절하시길 바랍니다.</li>
          <li>한 종목에 몰빵, 과도한 물타기는 하지 않기 바랍니다.</li>
        </ul>
      </div>

      <!-- 인용구 -->
      <div style="text-align:center;padding:24px;background:#08080c;border-radius:10px;margin-bottom:28px;">
        <p style="font-size:15px;font-style:italic;color:#d4ff00;margin:0;font-weight:600;">
          "시장의 소음은 지우고, 수익의 신호만 남기다."
        </p>
      </div>

      <p style="font-size:15px;line-height:1.8;color:#333;">
        이제 막연한 기대가 아닌 철저한 확률의 세계로 들어오셨습니다.<br/>
        스타트패키지 활용 중 궁금하신 점은 언제든 아래 카카오톡 채널을 통해 문의해 주시기 바랍니다.
      </p>
      <p style="font-size:15px;line-height:1.8;color:#333;">
        고객님의 성공적인 첫 신호를 응원합니다.<br/>
        감사합니다.
      </p>
    </div>

    <!-- 푸터 -->
    <div style="background:#08080c;padding:24px 40px;text-align:center;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">- 했제 팀 일동 드림 -</p>
      <p style="color:#555;font-size:11px;margin:0;">
        © 2026 Haessje. 본 메일은 서비스 안내를 위해 발송되었습니다.
      </p>
    </div>
  </div>
</body>
</html>`,
  }),

  vip: (userName) => ({
    subject: 'VIP서비스 가입을 환영합니다 — 했제',
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:#08080c;padding:32px 40px;text-align:center;">
      <span style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
        Haessje<span style="color:#d4ff00;">.</span>
      </span>
      <p style="color:#ffd700;font-size:13px;font-weight:700;margin:8px 0 0;letter-spacing:0.1em;">VIP SERVICE</p>
    </div>
    <div style="padding:40px;">
      <p style="font-size:15px;line-height:1.8;color:#333;">
        안녕하세요, <strong>${userName}</strong> 님.<br/>
        했제 VIP서비스 가입을 진심으로 환영합니다.<br/>
        곧 상세 안내를 별도로 전달드리겠습니다.
      </p>
      <p style="font-size:14px;color:#888;">문의: <a href="https://pf.kakao.com/_xjIzxen/chat" style="color:#d4ff00;">카카오톡 채널</a></p>
    </div>
    <div style="background:#08080c;padding:24px 40px;text-align:center;">
      <p style="color:#888;font-size:13px;margin:0;">- 했제 팀 일동 드림 -</p>
    </div>
  </div>
</body>
</html>`,
  }),
};

async function sendPlanEmail(toEmail, userName, plan) {
  const template = TEMPLATES[plan]?.(userName);
  if (!template) return;

  await transporter.sendMail({
    from: `"했제" <${process.env.NAVER_EMAIL}>`,
    to: toEmail,
    subject: template.subject,
    html: template.html,
  });
}

module.exports = { sendPlanEmail };
