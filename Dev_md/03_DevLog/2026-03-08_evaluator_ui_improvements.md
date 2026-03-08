# 평가자 UI 개선 — 3가지 수정 (2026-03-08)

## 개요
평가자가 실제 연구를 수행할 때 발견된 3가지 UI 문제를 수정함.

---

## 수정 1: 라벨 줄임말 제거 — 전체 텍스트 표시

### 문제
- `.labelLeft`, `.labelRight`: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` + 고정 200px
- `PriorityBarChart .label`: 동일하게 140px 고정 + ellipsis
- 긴 기준명/대안명이 `...`으로 잘려 평가자가 내용을 이해할 수 없음

### 수정 내용

**`src/styles/pairwise.module.css`**:
- `.labelLeft`, `.labelRight`에서 줄임 속성 3개 제거
- `white-space: nowrap` → `white-space: normal` (자연 줄바꿈 허용)
- `overflow: hidden; text-overflow: ellipsis;` → 삭제
- `width: 200px` → `min-width: 140px; max-width: 240px` (유동 너비)
- `line-height: 1.3` 추가 (2줄일 때 가독성)
- 모바일: `min-width: 90px; max-width: 150px`

**`src/components/evaluation/PriorityBarChart.module.css`**:
- `.label`에서 줄임 속성 제거
- `white-space: nowrap` → `white-space: normal`
- `width: 140px` → `min-width: 100px; max-width: 180px`
- `line-height: 1.3` 추가

---

## 수정 2: 선택된 셀에 체크표시(✓) 추가

### 문제
- 선택된 셀은 `border + box-shadow` 글로우만 있어서 어떤 점수를 골랐는지 한눈에 불명확

### 수정 내용

**`src/components/evaluation/PairwiseCell.jsx`**:
- `isSelected`일 때 셀 내부에 `✓` 텍스트 렌더링
- `{isSelected && <span className={styles.checkmark}>✓</span>}` 추가

**`src/styles/pairwise.module.css`**:
- `.checkmark` 클래스 추가:
  - `color: #fff` (흰색 체크)
  - `font-size: 1rem; font-weight: 700`
  - `display: flex; align-items: center; justify-content: center`
  - `width: 100%; height: 100%`
  - `text-shadow: 0 1px 2px rgba(0,0,0,0.3)` (가독성)

---

## 수정 3: CR 통과/수정 상태 디자인 강화

### 문제
- 기존 ConsistencyDisplay: 배경색 + 텍스트 색상만으로 구분 → 더 명확한 시각 피드백 필요
- 아이콘 없음, 상태 뱃지 없음

### 수정 내용

**`src/components/evaluation/ConsistencyDisplay.jsx`**:
- 통과: `✓ 통과` (체크 아이콘 + 텍스트) 뱃지
- 수정 필요: `✗ 기준 초과` (X 아이콘 + 텍스트) 뱃지
- CR 값 옆에 진행바(게이지) 추가: CR/0.1 비율로 시각화
  - 초록 게이지: CR ≤ 0.1
  - 빨간 게이지: CR > 0.1
- CR이 0일 때는 뱃지/게이지 미표시

**`src/components/evaluation/ConsistencyDisplay.module.css`**:
- `.top` 래퍼: 라벨, 값, 뱃지를 가로 정렬
- `.statusBadge`: 둥근 필(pill) 뱃지, 아이콘 + 텍스트, 흰색 폰트
- `.pass .statusBadge`: 초록 배경 (`var(--color-success)`)
- `.fail .statusBadge`: 빨간 배경 (`var(--color-danger)`)
- `.gauge` / `.gaugeTrack` / `.gaugeFill`: CR 비율 시각화 바 (높이 6px, 둥근 모서리)

---

## 수정 대상 파일 요약

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `src/styles/pairwise.module.css` | 라벨 줄임 제거 + 체크마크 스타일 |
| 2 | `src/components/evaluation/PairwiseCell.jsx` | 체크마크 ✓ 렌더링 |
| 3 | `src/components/evaluation/PriorityBarChart.module.css` | 라벨 줄임 제거 |
| 4 | `src/components/evaluation/ConsistencyDisplay.jsx` | 아이콘 + 뱃지 + 게이지 |
| 5 | `src/components/evaluation/ConsistencyDisplay.module.css` | 뱃지/게이지 스타일 |

## 검증 결과
- `npm run build` — 빌드 성공
- `npx vitest run` — 121개 테스트 전원 통과
