# 평가자 UI 점수 박스 효과 추가 (2026-03-08)

## 개요
평가 페이지(PairwiseRatingPage)의 중요도 점수 표시에 박스 효과를 추가하여 시각적 가독성 향상.

## 수정 파일
- `src/components/evaluation/PriorityBarChart.module.css`

## 수정 내용

### 1. 컨테이너 박스 효과
- `border: 1px solid var(--color-border-light)` 추가
- `box-shadow: var(--shadow-sm)` 추가
- 중요도 영역이 카드 형태로 구분됨

### 2. 점수 값 박스 뱃지
- `background: var(--color-primary-bg)` — 연한 파란 배경
- `border: 1px solid var(--color-border-light)` — 테두리
- `border-radius: var(--radius-sm)` — 둥근 모서리
- `padding: 2px 8px` — 내부 여백
- `box-shadow: 0 1px 2px rgba(0,0,0,0.05)` — 미세 그림자
- `color: var(--color-primary)` — 프라이머리 색상 강조
- `font-weight: 700` — 굵은 글씨

### 이전 세션 수정 (동일 배포에 포함)
1. **라벨 줄임말 제거** — ellipsis → 자연 줄바꿈 (`pairwise.module.css`, `PriorityBarChart.module.css`)
2. **선택 셀 체크마크(✓)** — 흰색 체크 표시 (`PairwiseCell.jsx`, `pairwise.module.css`)
3. **CR 뱃지 + 게이지** — 통과/초과 필 뱃지 + 게이지 바 (`ConsistencyDisplay.jsx`, `.module.css`)

## 검증
- `npm run build` — 빌드 성공
- `npx vitest run` — 121개 테스트 전원 통과
