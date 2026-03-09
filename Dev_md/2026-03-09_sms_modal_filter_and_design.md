# SMS 모달 필터링 기능 & 컬러 디자인 강화

**날짜:** 2026-03-09
**작업 유형:** 기능 추가 + 디자인 개선

## 변경 개요

SMS 모달의 수신자 필터링 기능 추가, 기본문구 탭 우선 배치 및 미리보기, 전체 컬러 디자인 강화.
설문 집계 페이지의 평가자별 현황을 5열 그리드 카드로 변경하고 SMS 발송 버튼 추가.

## 수정 파일 및 핵심 변경

### 1. `src/components/admin/SmsModal.jsx` — 핵심 기능 추가

**필터링 기능:**
- `FILTERS` 상수: 8종 필터 정의 (전체/평가완료/평가미완료/설문완료/설문미응답/가입완료/미가입/번호없음)
- `respondedIds` optional prop 추가 — 설문 응답 여부 필터용
- `filter` state + `filteredEvaluators` 메모이즈 — 필터 조건에 따라 목록 동적 갱신
- `filterCounts` 메모이즈 — 각 필터별 인원수 계산
- `visibleFilters` — `respondedIds` 미전달 시 설문 관련 필터 자동 숨김
- `handleToggleAll` 개선 — 필터된 목록 기준으로 전체 선택/해제 (기존: 전체 목록 기준)

**탭 순서 변경:**
- `activeTab` 기본값: `'symbols'` → `'templates'`
- 탭 버튼 순서: 기본문구 → 특수문자
- 기본문구 카드에 제목(`templateName`) + 실제 내용(`templateContent`) 미리보기

**기타:**
- 모달 폭: 780px → 820px
- textarea rows: 6 → 8

### 2. `src/components/admin/SmsModal.module.css` — 컬러 디자인 + 필터 스타일

**컬러 디자인:**
- 왼쪽 패널: 연초록 배경(`#f0fdf4`) + 초록 테두리(`#bbf7d0`)
- 오른쪽 패널: 연보라 배경(`#eef2ff`) + 인디고 테두리(`#c7d2fe`)
- 섹션 라벨: 컬러 텍스트 + 하단 보더 (초록/인디고)
- 탭 버튼: 라운드 스타일 + 인디고 그라데이션 활성 상태
- 기본문구 카드: nth-child별 좌측 컬러 보더 (인디고/앰버/에메랄드)
- 특수문자 그리드: 보라 테마 + 호버 이펙트 강화
- textarea: 인디고 좌측 3px 보더 포인트
- 바이트 카운터: 배경 + 테두리 추가
- 하단 액션바: 인디고 상단 보더 구분선

**필터 스타일:**
- `.filterChips`: flex-wrap 칩 레이아웃
- `.filterChip` / `.filterChipActive`: 초록 테마 라운드 칩 + 활성 시 진녹색
- `.filterCount`: 인원수 배지 (반투명 배경)
- `.selectedBadge`: 섹션 라벨 우측 "N명 선택" 배지
- `.recipientRowAll` / `.recipientNameAll`: 전체 선택 행 굵은 초록 스타일
- `.emptyFilter`: 빈 필터 결과 안내

### 3. `src/pages/SurveyResultPage.jsx` — 레이아웃 변경 + SmsModal 연동

- 평가자별 현황: 테이블 → 5열 그리드 카드 변경
- SMS 발송 버튼 추가 (statusHeader 영역)
- SmsModal에 `respondedIds` prop 전달 (설문 완료/미응답 필터 활성화)

### 4. `src/pages/SurveyResultPage.module.css` — 그리드 + SMS 스타일

- `.statusGrid`: 5열 그리드 (반응형: 1024px→4열, 768px→3열, 480px→2열)
- `.statusItem` / `.statusName` / `.statusBadges`: 그리드 카드 스타일
- `.statusHeader` / `.smsBtn`: SMS 버튼 영역

## 커밋 이력

| 커밋 | 내용 |
|------|------|
| `cb5a9d3` | 설문 집계 평가자별 현황 4열 그리드 카드 변경 |
| `8c03e35` | 5열 그리드 확장 + SMS 발송 버튼 추가 |
| `87b512e` | SMS 모달 탭 순서 변경 — 기본문구 우선 + 내용 미리보기 |
| `5faa171` | SMS 모달 컬러 디자인 강화 — 패널/탭/카드 색상 구분 |
| `13f126d` | SMS 모달 수신자 필터링 기능 추가 |

## 검증

- `npm run build` 성공
- 필터 칩 클릭 시 수신자 목록 동적 갱신
- 전체 선택 → 필터된 목록 기준 동작
- 설문 집계 페이지: respondedIds 전달 → 설문 완료/미응답 필터 표시
- 평가자 관리 페이지: respondedIds 미전달 → 설문 관련 필터 자동 숨김
- 컬러 디자인 패널 구분 정상 렌더링
