# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors

pdfmetrics.registerFont(TTFont('MG',  'C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MGB', 'C:/Windows/Fonts/malgunbd.ttf'))

W, H = A4   # 595 x 842

# ── 색상 ────────────────────────────────────────────
BG    = colors.HexColor('#0D0D0D')
WHITE = colors.HexColor('#FFFFFF')
LIME  = colors.HexColor('#D4FF00')
GRAY  = colors.HexColor('#555555')
LGRAY = colors.HexColor('#AAAAAA')
CARD  = colors.HexColor('#1A1A1A')
CARD2 = colors.HexColor('#222222')
RED   = colors.HexColor('#FF4444')    # 양봉
BLUE  = colors.HexColor('#4488FF')   # 음봉
GREEN = colors.HexColor('#00CC66')
YELL  = colors.HexColor('#FFCC00')

OUT = r'C:\haessje\라임아카데미\돈복사_1주차_기초교육.pdf'
c = canvas.Canvas(OUT, pagesize=A4)

# ════════════════════════════════════════════════════
def full_bg(color=BG):
    c.setFillColor(color)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def header_bar(text, sub='', accent=LIME):
    c.setFillColor(accent)
    c.rect(0, H-cm*2.2, W, cm*2.2, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont('MGB', 20)
    c.drawString(cm*1.2, H-cm*1.5, text)
    if sub:
        c.setFont('MG', 11)
        c.drawString(cm*1.2, H-cm*2.0, sub)

def footer(page_num):
    c.setFillColor(CARD)
    c.rect(0, 0, W, cm*1.0, fill=1, stroke=0)
    c.setFillColor(LGRAY)
    c.setFont('MG', 9)
    c.drawString(cm*1.2, cm*0.35, '돈복사 커뮤니티  ·  1주차 기초 교육자료')
    c.drawRightString(W-cm*1.2, cm*0.35, f'{page_num}')

def section_box(x, y, w, h, title='', body_lines=[], accent=LIME,
                title_size=13, body_size=11):
    c.setFillColor(CARD)
    c.roundRect(x, y, w, h, 6, fill=1, stroke=0)
    c.setFillColor(accent)
    c.roundRect(x, y+h-cm*0.7, w, cm*0.7, 6, fill=1, stroke=0)
    c.setFillColor(CARD)
    c.rect(x, y+h-cm*0.45, w, cm*0.45, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont('MGB', title_size)
    c.drawString(x+cm*0.3, y+h-cm*0.52, title)
    c.setFillColor(WHITE)
    c.setFont('MG', body_size)
    for i, line in enumerate(body_lines):
        c.drawString(x+cm*0.35, y+h-cm*1.15-i*cm*0.6, line)

def tag(x, y, text, bg=LIME, fg=BG, size=10):
    tw = len(text)*size*0.6 + 12
    c.setFillColor(bg)
    c.roundRect(x, y, tw, cm*0.45, 4, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont('MGB', size)
    c.drawString(x+6, y+cm*0.1, text)

def draw_candle(cx, base_y, body_h, wick_top, wick_bot, is_up=True, width=18):
    color = RED if is_up else BLUE
    body_y = base_y
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.setLineWidth(2)
    c.rect(cx-width//2, body_y, width, body_h, fill=1, stroke=0)
    c.line(cx, body_y+body_h, cx, body_y+body_h+wick_top)
    c.line(cx, body_y, cx, body_y-wick_bot)

def term_card(x, y, w, h, term, reading, meaning, example='', accent=LIME):
    c.setFillColor(CARD2)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(x, y+h-cm*0.06, w, cm*0.06, fill=1, stroke=0)
    c.setFillColor(accent)
    c.setFont('MGB', 16)
    c.drawString(x+cm*0.4, y+h-cm*0.85, term)
    c.setFillColor(LGRAY)
    c.setFont('MG', 9)
    c.drawString(x+cm*0.4, y+h-cm*1.25, reading)
    c.setFillColor(WHITE)
    c.setFont('MG', 11)
    lines = meaning.split('\n')
    for i, ln in enumerate(lines):
        c.drawString(x+cm*0.4, y+h-cm*1.75-i*cm*0.55, ln)
    if example:
        c.setFillColor(GRAY)
        c.roundRect(x+cm*0.3, y+cm*0.25, w-cm*0.6, cm*0.6, 4, fill=1, stroke=0)
        c.setFillColor(LGRAY)
        c.setFont('MG', 9)
        c.drawString(x+cm*0.55, y+cm*0.42, '예) ' + example)


# ════════════════════════════════════════════════════════════════
# PAGE 1 — 표지
# ════════════════════════════════════════════════════════════════
full_bg()

# 상단 라임 바
c.setFillColor(LIME)
c.rect(0, H-cm*1.2, W, cm*1.2, fill=1, stroke=0)
c.setFillColor(BG)
c.setFont('MGB', 13)
c.drawString(cm*1.2, H-cm*0.82, '돈복사 커뮤니티  ·  1주차 기초 교육자료')

# 메인 타이틀
c.setFillColor(WHITE)
c.setFont('MGB', 46)
c.drawString(cm*1.5, H-cm*5.5, '주식 기초')
c.setFillColor(LIME)
c.setFont('MGB', 46)
c.drawString(cm*1.5, H-cm*7.2, '완전 정복')

c.setFillColor(LGRAY)
c.setFont('MG', 15)
c.drawString(cm*1.5, H-cm*8.5, '캔들차트 · 주식 용어 · 차트 보는 법')
c.setFont('MG', 12)
c.drawString(cm*1.5, H-cm*9.3, '중고등학생도 이해할 수 있게 쉽게 풀어드립니다.')

# 캔들 일러스트 (표지용 큰 캔들들)
candle_data = [
    (cm*11, cm*4.5, cm*2.5, cm*1.2, cm*0.8, True),
    (cm*13, cm*3.5, cm*3.5, cm*1.5, cm*0.6, True),
    (cm*15, cm*2.5, cm*1.5, cm*0.5, cm*1.5, False),
    (cm*17, cm*4.0, cm*2.0, cm*0.8, cm*1.0, True),
    (cm*19, cm*5.0, cm*3.0, cm*1.0, cm*0.7, True),
]
for cx, by, bh, wt, wb, up in candle_data:
    draw_candle(cx, by, bh, wt, wb, up, width=28)

# 하단 태그들
tags = ['양봉/음봉', '시가·고가·저가·종가', '거래량', '이동평균선', '상한가/하한가']
for i, t in enumerate(tags):
    tag(cm*1.5 + i*cm*2.8, cm*2.5, t, CARD2, LGRAY, 9)

c.setFillColor(GRAY)
c.setFont('MG', 9)
c.drawString(cm*1.5, cm*1.5, '본 자료는 돈복사 모임 참여자를 위한 기초 학습 자료입니다.')

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 2 — 주식이란?
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('01  주식이란 무엇인가?', '회사의 주인이 된다는 것')
footer(2)

# 비유 박스
c.setFillColor(CARD)
c.roundRect(cm*1.2, H-cm*5.5, W-cm*2.4, cm*2.8, 10, fill=1, stroke=0)
c.setFillColor(LIME)
c.setFont('MGB', 13)
c.drawString(cm*1.7, H-cm*3.4, '🍕  피자 비유로 이해하기')
c.setFillColor(WHITE)
c.setFont('MG', 12)
lines = [
    '삼성전자라는 피자 한 판이 있다고 생각해봐요.',
    '이 피자를 1억 조각으로 잘랐어요. 그게 바로 "주식"이에요.',
    '내가 그 조각 1개를 사면 → 삼성전자의 아주 작은 주인이 되는 거예요!',
    '회사가 잘 되면 내 조각(주식)의 가치도 올라가요. 그게 수익!',
]
for i, ln in enumerate(lines):
    c.drawString(cm*1.7, H-cm*4.1-i*cm*0.55, ln)

# 도식 그리기 (회사 → 주식 발행 → 투자자)
boxes = [
    (cm*1.5, H-cm*8.8, cm*3.5, cm*1.8, '회사\n(삼성전자)', LIME, BG),
    (cm*7.5, H-cm*8.8, cm*3.5, cm*1.8, '주식\n발행', CARD2, LIME),
    (cm*13.5, H-cm*8.8, cm*3.5, cm*1.8, '나(투자자)\n주주가 됨!', CARD2, WHITE),
]
for bx, by, bw, bh, txt, bg, fg in boxes:
    c.setFillColor(colors.HexColor(bg.hexval() if hasattr(bg,'hexval') else '#1A1A1A'))
    c.roundRect(bx, by, bw, bh, 8, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont('MGB', 13)
    lines2 = txt.split('\n')
    for li, lt in enumerate(lines2):
        c.drawCentredString(bx+bw/2, by+bh/2+cm*0.1-(li*cm*0.55), lt)

# 화살표
for ax in [cm*5.2, cm*11.2]:
    c.setFillColor(LGRAY)
    c.setStrokeColor(LGRAY)
    c.setLineWidth(2)
    c.line(ax, H-cm*7.9, ax+cm*2.1, H-cm*7.9)
    c.setFillColor(LGRAY)
    p2 = c.beginPath()
    p2.moveTo(ax+cm*2.1, H-cm*7.9)
    p2.lineTo(ax+cm*1.7, H-cm*7.7)
    p2.lineTo(ax+cm*1.7, H-cm*8.1)
    p2.close()
    c.drawPath(p2, fill=1, stroke=0)

# 핵심 포인트
c.setFillColor(CARD2)
c.roundRect(cm*1.2, H-cm*11.2, W-cm*2.4, cm*2.0, 8, fill=1, stroke=0)
c.setFillColor(LIME)
c.setFont('MGB', 12)
c.drawString(cm*1.7, H-cm*9.7, '핵심 포인트 3가지')
points = [
    '① 주식을 사면 그 회사의 주인(주주)이 된다',
    '② 회사가 잘되면 주가가 오르고, 못되면 내린다',
    '③ 주가는 매일 수많은 사람들의 매수/매도로 결정된다',
]
c.setFillColor(WHITE)
c.setFont('MG', 11)
for i, p in enumerate(points):
    c.drawString(cm*1.7, H-cm*10.3-i*cm*0.55, p)

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 3 — 캔들차트란?
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('02  캔들차트란?', '하루의 주가 움직임을 한눈에 보는 방법')
footer(3)

# 설명 텍스트
c.setFillColor(WHITE)
c.setFont('MG', 12)
intro = [
    '캔들차트는 주가의 움직임을 "초 모양"으로 표현한 차트예요.',
    '일본 에도시대 쌀 상인들이 만든 방법인데, 지금 전세계에서 씁니다.',
    '하나의 캔들 = 하루(또는 1시간, 1분 등)의 가격 정보를 담고 있어요.',
]
for i, ln in enumerate(intro):
    c.drawString(cm*1.5, H-cm*3.1-i*cm*0.65, ln)

# 큰 캔들 해부도
cx = cm*5.5
base = H-cm*13
bh = cm*4.5
wt = cm*2.0
wb = cm*1.5
w = 60

# 양봉 해부
c.setFillColor(RED)
c.rect(cx-w//2, base, w, bh, fill=1, stroke=0)
c.setStrokeColor(RED)
c.setLineWidth(3)
c.line(cx, base+bh, cx, base+bh+wt)  # 위꼬리
c.line(cx, base, cx, base-wb)         # 아래꼬리

# 라벨 화살표 & 텍스트 (우측)
label_data = [
    (cx+w//2+5, base+bh+wt-5,   '고가 (High) — 그날 가장 높은 가격'),
    (cx+w//2+5, base+bh-10,     '종가 (Close) — 장이 끝날 때 가격'),
    (cx+w//2+5, base+bh//2-5,   '몸통 (Body)'),
    (cx+w//2+5, base+10,        '시가 (Open) — 장이 시작할 때 가격'),
    (cx+w//2+5, base-wb+5,      '저가 (Low) — 그날 가장 낮은 가격'),
]
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.setStrokeColor(LGRAY)
c.setLineWidth(1)
for lx, ly, lt in label_data:
    c.line(lx, ly, lx+cm*0.5, ly)
    c.drawString(lx+cm*0.6, ly-4, lt)

# 양봉 레이블
c.setFillColor(RED)
c.setFont('MGB', 16)
c.drawString(cx-w//2-cm*2.5, base+bh//2, '양봉')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cx-w//2-cm*2.5, base+bh//2-cm*0.55, '(올랐어요!)')

# 음봉 옆에 그리기
cx2 = cm*5.5 + cm*6.5
c.setFillColor(BLUE)
c.rect(cx2-w//2, base, w, bh, fill=1, stroke=0)
c.setStrokeColor(BLUE)
c.setLineWidth(3)
c.line(cx2, base+bh, cx2, base+bh+wt)
c.line(cx2, base, cx2, base-wb)

c.setFillColor(BLUE)
c.setFont('MGB', 16)
c.drawString(cx2+w//2+cm*0.3, base+bh//2, '음봉')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cx2+w//2+cm*0.3, base+bh//2-cm*0.55, '(내렸어요!)')

# 음봉 설명 (시가/종가 반대)
c.setFillColor(LGRAY)
c.setFont('MG', 9)
c.drawString(cx2-w//2-cm*2.8, base+bh-5, '↑ 시가')
c.drawString(cx2-w//2-cm*2.8, base+5,    '↑ 종가')

# 하단 비교 박스
c.setFillColor(colors.HexColor('#1A0A0A'))
c.roundRect(cm*1.2, cm*2.5, (W-cm*2.8)/2, cm*2.0, 8, fill=1, stroke=0)
c.setFillColor(RED)
c.setFont('MGB', 12)
c.drawString(cm*1.7, cm*4.1, '🔴 양봉 = 가격이 올랐다')
c.setFillColor(WHITE)
c.setFont('MG', 10)
c.drawString(cm*1.7, cm*3.5, '종가 > 시가  (끝이 시작보다 높음)')
c.drawString(cm*1.7, cm*2.95, '빨간색으로 표시합니다.')

c.setFillColor(colors.HexColor('#0A0A1A'))
c.roundRect(cm*1.2+(W-cm*2.8)/2+cm*0.4, cm*2.5, (W-cm*2.8)/2, cm*2.0, 8, fill=1, stroke=0)
c.setFillColor(BLUE)
c.setFont('MGB', 12)
c.drawString(cm*1.7+(W-cm*2.8)/2+cm*0.4, cm*4.1, '🔵 음봉 = 가격이 내렸다')
c.setFillColor(WHITE)
c.setFont('MG', 10)
c.drawString(cm*1.7+(W-cm*2.8)/2+cm*0.4, cm*3.5, '종가 < 시가  (끝이 시작보다 낮음)')
c.drawString(cm*1.7+(W-cm*2.8)/2+cm*0.4, cm*2.95, '파란색으로 표시합니다.')

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 4 — 캔들 꼬리의 의미
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('03  캔들 꼬리가 말하는 것', '꼬리 하나에도 시장의 심리가 담겨있어요')
footer(4)

c.setFillColor(LGRAY)
c.setFont('MG', 12)
c.drawString(cm*1.5, H-cm*3.2,
    '캔들의 "꼬리(수염)"는 그날 매수/매도의 힘겨루기 결과를 보여줘요.')

tail_cases = [
    {
        'title': '윗꼬리가 길면',
        'color': YELL,
        'candle': (True, cm*1.5, cm*3.5, cm*0.8, cm*2.5, cm*0.3),
        'explain': ['높이 올랐다가 내려왔다는 뜻',
                    '→ 고점에서 "팔자"가 많았던 것',
                    '→ 상승이 약해질 수 있다는 신호'],
        'x': cm*4.5, 'y': H-cm*9.5
    },
    {
        'title': '아랫꼬리가 길면',
        'color': GREEN,
        'candle': (True, cm*1.5, cm*3.5, cm*0.5, cm*0.3, cm*2.5),
        'explain': ['낮이 내려갔다가 올라왔다는 뜻',
                    '→ 저점에서 "사자"가 많았던 것',
                    '→ 하락이 약해질 수 있다는 신호'],
        'x': cm*4.5, 'y': H-cm*15.5
    },
    {
        'title': '꼬리 없는 캔들',
        'color': LIME,
        'candle': (True, cm*1.5, cm*3.5, cm*0, cm*0, cm*0),
        'explain': ['시가=저가, 종가=고가인 경우',
                    '→ 강한 상승 or 하락 흐름',
                    '→ 방향성이 매우 강한 신호'],
        'x': cm*4.5, 'y': H-cm*21.5
    },
]

for i, case in enumerate(tail_cases):
    base_y = H - cm*9.0 - i*cm*6.2
    up, bh_c, body_h, wt_c, wb_c = case['candle'][0], case['candle'][1], case['candle'][2], case['candle'][4], case['candle'][5]
    candle_cx = cm*3.0

    draw_candle(candle_cx, base_y, body_h, wt_c, wb_c, up, width=35)

    c.setFillColor(case['color'])
    c.setFont('MGB', 13)
    c.drawString(cm*4.8, base_y + body_h/2 + cm*0.6, case['title'])
    c.setFillColor(WHITE)
    c.setFont('MG', 11)
    for j, ln in enumerate(case['explain']):
        c.drawString(cm*4.8, base_y + body_h/2 - j*cm*0.58, ln)

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 5 — 핵심 용어 1 (가격 관련)
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('04  꼭 알아야 할 주식 용어 ①', '가격 관련 용어')
footer(5)

terms1 = [
    ('시가', '시작 가격', '장이 오전 9시에 열릴 때의 첫 번째 가격\n비유: 마라톤의 출발선 가격', '삼성전자 시가 70,000원'),
    ('종가', '끝 가격', '장이 오후 3시 30분에 닫힐 때의 마지막 가격\n비유: 마라톤의 결승선 가격', '삼성전자 종가 72,000원'),
    ('고가', '최고 가격', '그날 하루 중 가장 높았던 가격\n장중에 잠깐이라도 찍으면 고가가 됨', '고가 74,500원'),
    ('저가', '최저 가격', '그날 하루 중 가장 낮았던 가격\n잠깐이라도 이 가격에 거래됐으면 저가', '저가 69,800원'),
]

positions = [
    (cm*1.2, H-cm*6.8),
    (cm*10.2, H-cm*6.8),
    (cm*1.2, H-cm*13.5),
    (cm*10.2, H-cm*13.5),
]
tw = cm*8.5
th = cm*5.8

for (term, reading, meaning, example), (tx, ty) in zip(terms1, positions):
    term_card(tx, ty, tw, th, term, reading, meaning, example)

# 하단 핵심 공식
c.setFillColor(CARD)
c.roundRect(cm*1.2, cm*1.8, W-cm*2.4, cm*1.5, 8, fill=1, stroke=0)
c.setFillColor(LIME)
c.setFont('MGB', 12)
c.drawString(cm*2.0, cm*2.95, '핵심 공식')
c.setFillColor(WHITE)
c.setFont('MG', 12)
c.drawString(cm*5.0, cm*2.95, '양봉 = 종가 > 시가      음봉 = 종가 < 시가')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cm*2.0, cm*2.35, '시가·고가·저가·종가, 이 4가지를 묶어서 "OHLC"라고도 불러요.')

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 6 — 핵심 용어 2 (거래 관련)
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('05  꼭 알아야 할 주식 용어 ②', '매매 & 거래 관련 용어')
footer(6)

terms2 = [
    ('매수', '사는 것 (BUY)', '주식을 돈을 주고 사는 행위\n비유: 편의점에서 물건을 집는 것', '10주 매수 → 내 계좌에 주식 들어옴'),
    ('매도', '파는 것 (SELL)', '갖고 있던 주식을 파는 행위\n비유: 편의점에 물건을 판매하는 것', '10주 매도 → 계좌에 현금 들어옴'),
    ('거래량', '얼마나 많이 거래됐나', '그날 사고 판 주식 수의 총합\n거래량이 많을수록 관심이 높다는 뜻', '오늘 거래량 1,200만 주'),
    ('시가총액', '회사의 총 가치', '주가 × 발행 주식 수\n회사가 전체적으로 얼마짜리인지 알 수 있음', '주가 70,000원 × 주식수 → 약 418조'),
]

for (term, reading, meaning, example), (tx, ty) in zip(terms2, positions):
    term_card(tx, ty, tw, th, term, reading, meaning, example, accent=GREEN)

# 상한가/하한가 설명
c.setFillColor(CARD)
c.roundRect(cm*1.2, cm*1.5, W-cm*2.4, cm*2.0, 8, fill=1, stroke=0)
c.setFillColor(RED)
c.setFont('MGB', 12)
c.drawString(cm*2.0, cm*3.1, '상한가 +30%')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cm*2.0, cm*2.6, '하루에 오를 수 있는 최대치. 전날 종가의 +30%까지만 오를 수 있어요.')
c.setFillColor(BLUE)
c.setFont('MGB', 12)
c.drawString(cm*2.0, cm*2.1, '하한가 -30%')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cm*2.0, cm*1.7, '하루에 내릴 수 있는 최대치. 전날 종가의 -30%까지만 내릴 수 있어요.')

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 7 — 핵심 용어 3 (차트 관련)
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('06  꼭 알아야 할 주식 용어 ③', '차트 분석 기본 용어')
footer(7)

# 이동평균선 설명
c.setFillColor(CARD)
c.roundRect(cm*1.2, H-cm*6.5, W-cm*2.4, cm*3.8, 10, fill=1, stroke=0)
c.setFillColor(LIME)
c.setFont('MGB', 14)
c.drawString(cm*1.7, H-cm*3.2, '이동평균선 (MA, Moving Average)')
c.setFillColor(WHITE)
c.setFont('MG', 11)
ma_lines = [
    '최근 N일간의 종가 평균을 선으로 이은 것이에요.',
    '5일선: 최근 5일 평균 → 단기 추세   /   20일선: 최근 20일 평균 → 중기 추세',
    '주가가 이동평균선 위 → 상승 추세    /   이동평균선 아래 → 하락 추세',
    '비유: 학교 시험 평균처럼, 최근 성적이 전체 평균보다 높으면 잘하고 있는 것!',
]
for i, ln in enumerate(ma_lines):
    c.drawString(cm*1.7, H-cm*3.9-i*cm*0.6, ln)

# 미니 차트 그리기 (이동평균선 포함)
chart_x, chart_y = cm*1.5, H-cm*14.5
chart_w, chart_h = W-cm*3.0, cm*6.5

c.setFillColor(CARD2)
c.roundRect(chart_x, chart_y, chart_w, chart_h, 8, fill=1, stroke=0)

# 캔들 데이터 (상대값)
candle_info = [
    (0.3, 0.5, 0.25, 0.48, True),
    (0.48, 0.65, 0.44, 0.62, True),
    (0.62, 0.70, 0.50, 0.55, False),
    (0.55, 0.68, 0.52, 0.66, True),
    (0.66, 0.80, 0.63, 0.75, True),
    (0.75, 0.82, 0.60, 0.63, False),
    (0.63, 0.72, 0.59, 0.70, True),
    (0.70, 0.85, 0.68, 0.82, True),
    (0.82, 0.88, 0.72, 0.75, False),
    (0.75, 0.90, 0.74, 0.88, True),
]
n = len(candle_info)
cw = (chart_w - cm*1.0) / n
pad = cm*0.5

# 이동평균선 계산
closes = [d[3] for d in candle_info]
ma5 = [sum(closes[max(0,i-4):i+1])/min(i+1,5) for i in range(n)]
ma20 = [sum(closes[max(0,i-19):i+1])/min(i+1,20) for i in range(n)]

for i, (op, hi, lo, cl, up) in enumerate(candle_info):
    cx_c = chart_x + pad + cw*i + cw/2
    scale = chart_h - cm*0.8
    base = chart_y + cm*0.4

    bh_c = abs(cl-op)*scale
    bbase = min(op,cl)*scale + base
    wt_c  = (hi - max(op,cl)) * scale
    wb_c  = (min(op,cl) - lo) * scale

    draw_candle(cx_c, bbase, max(bh_c,2), wt_c, wb_c, up, width=int(cw*0.55))

# 이동평균선 그리기
def ma_line(ma_vals, color, lw=1.5):
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    pts = []
    for i, v in enumerate(ma_vals):
        cx_c = chart_x + pad + cw*i + cw/2
        py   = chart_y + cm*0.4 + v*(chart_h-cm*0.8)
        pts.append((cx_c, py))
    p = c.beginPath()
    p.moveTo(pts[0][0], pts[0][1])
    for px, py in pts[1:]:
        p.lineTo(px, py)
    c.drawPath(p, stroke=1, fill=0)

ma_line(ma5, colors.HexColor('#FFAA00'), 1.8)
ma_line(ma20, colors.HexColor('#00AAFF'), 1.8)

# 범례
c.setFillColor(colors.HexColor('#FFAA00'))
c.rect(chart_x+cm*0.3, chart_y+chart_h-cm*0.85, cm*0.7, cm*0.15, fill=1, stroke=0)
c.setFillColor(WHITE)
c.setFont('MG', 9)
c.drawString(chart_x+cm*1.1, chart_y+chart_h-cm*0.9, '5일 이동평균선 (단기)')

c.setFillColor(colors.HexColor('#00AAFF'))
c.rect(chart_x+cm*5.5, chart_y+chart_h-cm*0.85, cm*0.7, cm*0.15, fill=1, stroke=0)
c.drawString(chart_x+cm*6.3, chart_y+chart_h-cm*0.9, '20일 이동평균선 (중기)')

# 지지선/저항선
c.setFillColor(CARD)
c.roundRect(cm*1.2, cm*1.5, W-cm*2.4, cm*2.8, 8, fill=1, stroke=0)
c.setFillColor(GREEN)
c.setFont('MGB', 12)
c.drawString(cm*2.0, cm*3.9, '지지선 (Support)')
c.setFillColor(WHITE)
c.setFont('MG', 11)
c.drawString(cm*2.0, cm*3.3, '주가가 내려오다가 "여기서는 더 안 내린다"고 버티는 가격대')
c.setFillColor(RED)
c.setFont('MGB', 12)
c.drawString(cm*2.0, cm*2.7, '저항선 (Resistance)')
c.setFillColor(WHITE)
c.setFont('MG', 11)
c.drawString(cm*2.0, cm*2.1, '주가가 올라오다가 "여기서는 더 안 오른다"고 막히는 가격대')
c.setFillColor(LGRAY)
c.setFont('MG', 10)
c.drawString(cm*2.0, cm*1.7, '비유: 지지선 = 바닥   /   저항선 = 천장')

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 8 — 실전 캔들 차트 읽기
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('07  실전! 캔들 차트 읽어보기', '지금까지 배운 내용을 한 번에 적용해봐요')
footer(8)

# 실전 차트 (더 큰 버전)
chart_x2, chart_y2 = cm*1.2, H-cm*17.0
chart_w2, chart_h2 = W-cm*2.4, cm*11.5

c.setFillColor(CARD2)
c.roundRect(chart_x2, chart_y2, chart_w2, chart_h2, 10, fill=1, stroke=0)

candle_info2 = [
    (0.40, 0.55, 0.36, 0.52, True),
    (0.52, 0.60, 0.48, 0.56, True),
    (0.56, 0.62, 0.42, 0.44, False),   # 장대음봉
    (0.44, 0.50, 0.40, 0.48, True),
    (0.48, 0.58, 0.45, 0.55, True),
    (0.55, 0.70, 0.53, 0.68, True),
    (0.68, 0.80, 0.64, 0.72, True),
    (0.72, 0.84, 0.55, 0.58, False),   # 윗꼬리 긴 음봉
    (0.58, 0.68, 0.55, 0.65, True),
    (0.65, 0.78, 0.62, 0.75, True),
    (0.75, 0.88, 0.72, 0.85, True),
    (0.85, 0.92, 0.70, 0.73, False),
]
n2 = len(candle_info2)
cw2 = (chart_w2 - cm*1.2) / n2

for i, (op, hi, lo, cl, up) in enumerate(candle_info2):
    cx_c = chart_x2 + cm*0.6 + cw2*i + cw2/2
    scale2 = chart_h2 - cm*1.0
    base2  = chart_y2 + cm*0.5
    bh_c   = abs(cl-op)*scale2
    bbase2 = min(op,cl)*scale2 + base2
    wt_c   = (hi-max(op,cl))*scale2
    wb_c   = (min(op,cl)-lo)*scale2
    draw_candle(cx_c, bbase2, max(bh_c,2), wt_c, wb_c, up, width=int(cw2*0.6))

# 주석 달기
annot = [
    (3, '장대음봉!\n강한 하락', RED, -0.12),
    (7, '윗꼬리 긴\n음봉 주의', YELL, -0.08),
    (10, '연속 양봉\n상승 추세', GREEN, 0.05),
]
for idx, note, nc, offset_y in annot:
    op, hi, lo, cl, up = candle_info2[idx]
    cx_a = chart_x2 + cm*0.6 + cw2*idx + cw2/2
    ay   = chart_y2 + cm*0.5 + (hi+offset_y)*(chart_h2-cm*1.0)
    c.setFillColor(nc)
    c.setFont('MGB', 9)
    for li, ln in enumerate(note.split('\n')):
        c.drawCentredString(cx_a, ay - li*cm*0.42, ln)

# 하단 퀴즈
c.setFillColor(CARD)
c.roundRect(cm*1.2, cm*1.5, W-cm*2.4, cm*2.8, 8, fill=1, stroke=0)
c.setFillColor(LIME)
c.setFont('MGB', 13)
c.drawString(cm*2.0, cm*3.9, '✏️  연습 퀴즈')
c.setFillColor(WHITE)
c.setFont('MG', 11)
quiz = [
    'Q1. 위 차트에서 양봉이 몇 개, 음봉이 몇 개인가요?',
    'Q2. 가장 큰 음봉이 나온 날, 시장 심리는 어땠을까요?',
    'Q3. 연속 양봉이 나올 때 어떤 느낌이 드나요?',
]
for i, q in enumerate(quiz):
    c.drawString(cm*2.0, cm*3.3-i*cm*0.58, q)

c.showPage()

# ════════════════════════════════════════════════════════════════
# PAGE 9 — 오늘의 핵심 정리
# ════════════════════════════════════════════════════════════════
full_bg()
header_bar('08  오늘의 핵심 정리', '이것만 알면 차트를 읽을 수 있어요')
footer(9)

# 체크리스트
c.setFillColor(CARD)
c.roundRect(cm*1.2, H-cm*14.5, W-cm*2.4, cm*11.5, 10, fill=1, stroke=0)

checks = [
    (True,  '주식 = 회사의 조각. 주주가 되면 회사 이익을 나눌 수 있다'),
    (True,  '캔들 하나 = 하루의 가격 정보 (시가·고가·저가·종가)'),
    (True,  '빨간 캔들(양봉) = 가격이 올랐다  /  파란 캔들(음봉) = 가격이 내렸다'),
    (True,  '긴 윗꼬리 → 고점 매도 압력 강함  /  긴 아랫꼬리 → 저점 매수 압력 강함'),
    (True,  '거래량이 많을수록 그날 시장의 관심이 높다는 의미'),
    (True,  '이동평균선: 최근 N일 평균 가격선 (5일선, 20일선 등)'),
    (True,  '지지선 = 잘 안 내려가는 가격대  /  저항선 = 잘 안 올라가는 가격대'),
    (False, '상한가 +30% / 하한가 -30% : 하루 최대 등락폭'),
]

for i, (checked, text) in enumerate(checks):
    ty = H-cm*4.5 - i*cm*1.25
    c.setFillColor(LIME if checked else CARD2)
    c.roundRect(cm*1.8, ty-cm*0.08, cm*0.65, cm*0.65, 4, fill=1, stroke=0)
    c.setFillColor(BG if checked else GRAY)
    c.setFont('MGB', 14)
    c.drawCentredString(cm*2.13, ty+cm*0.08, '✓' if checked else '')
    c.setFillColor(WHITE if checked else LGRAY)
    c.setFont('MG', 11)
    c.drawString(cm*2.7, ty+cm*0.1, text)

# 마지막 메시지
c.setFillColor(BG)
c.roundRect(cm*1.2, cm*1.5, W-cm*2.4, cm*2.5, 10, fill=1, stroke=0)
c.setFillColor(LIME)
c.roundRect(cm*1.2, cm*1.5, W-cm*2.4, cm*2.5, 10, fill=1, stroke=0)
c.setFillColor(BG)
c.setFont('MGB', 15)
c.drawString(cm*2.0, cm*3.5, '다음 주부터는 이 지식으로 직접 "좋은 종목의 조건"을 찾아봅니다.')
c.setFont('MG', 12)
c.drawString(cm*2.0, cm*2.8, '오늘 배운 캔들과 용어가 그 기초가 됩니다. 어렵지 않아요. 함께 찾아봐요!')
c.setFont('MGB', 11)
c.drawString(cm*2.0, cm*2.1, '돈복사 커뮤니티  ·  피스메이커')

c.save()
print('완료:', OUT)
