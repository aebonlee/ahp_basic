# 사용요금 페이지 디자인 검토 & 개선

## 날짜
2026-03-09

## 개요
사용요금 안내 페이지(`/pricing`)의 카드결제 기능을 검증하고 디자인을 검토하여 4건의 UI 개선을 적용했다.

## 카드결제 기능 검증 결과

| 시나리오 | 동작 | 결과 |
|---|---|---|
| Free "시작하기" | `/register` 이동 | OK |
| 유료 + 미로그인 | warning 토스트 + `/login` 이동 | OK |
| 유료 + 로그인 → "구독하기" | 결제 확인 모달 표시 | OK |
| 모달 → "결제하기" | `requestPayment()` 호출 + 버튼 disabled | OK |
| 데모 모드 (STORE_ID/CHANNEL_KEY 미설정) | 가짜 성공 반환 → 성공 토스트 + 대시보드 이동 | OK |
| 결제 실패 | 에러 토스트 표시 | OK |
| 결제 중 모달 닫기 시도 | 차단됨 (paying 상태) | OK |
| 오버레이 클릭 / 취소 버튼 | 모달 닫힘 | OK |

## 디자인 개선 사항 (4건)

### 1. Basic 카드 CTA 버튼 스타일 변경
- **이전**: 기본 회색 버튼 (Free와 동일)
- **이후**: outline-primary 스타일 (파란 테두리 + 파란 텍스트)
- **이유**: 유료 요금제임을 시각적으로 차별화

### 2. 비교표 섹션 상단 구분선 추가
- **이전**: 요금제 카드와 비교표 사이 구분 없음
- **이후**: `border-top: 1px solid #e2e8f0` 추가
- **이유**: 섹션 간 시각적 분리 강화

### 3. FAQ 섹션 배경색 적용
- **이전**: 흰색 배경 (비교표와 연속되어 보임)
- **이후**: `background: #f8fafc` + faqInner 래퍼 추가 (전체 너비 배경)
- **이유**: 비교표 섹션과 시각적 구분

### 4. 모바일 카드 여백 축소
- **이전**: `margin-top: 40px` (데스크톱과 동일)
- **이후**: `margin-top: 24px`
- **이유**: 모바일에서 불필요한 상단 여백 축소

## 변경 파일
- `src/pages/PricingPage.jsx` — outline 버튼 분기 + FAQ faqInner 래퍼 추가
- `src/pages/PricingPage.module.css` — planBtnOutline, compareSection border-top, faqSection 배경, faqInner, 모바일 margin-top
