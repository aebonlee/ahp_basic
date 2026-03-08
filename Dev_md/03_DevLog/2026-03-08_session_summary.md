# 2026-03-08 세션 종합 개발 내역

## 커밋 내역 (3건)

### 1. `c7b4965` — 평가자 UI 개선 (4가지)
**라벨 줄임 제거 + 셀 체크마크 + CR 뱃지/게이지 + 점수 박스**

| 수정 파일 | 내용 |
|-----------|------|
| `src/styles/pairwise.module.css` | labelLeft/labelRight ellipsis 제거 → `white-space: normal` + 유동 너비(140~240px), 모바일(90~150px), `.checkmark` 스타일 추가 |
| `src/components/evaluation/PairwiseCell.jsx` | 선택된 셀에 `✓` 체크마크 렌더링 |
| `src/components/evaluation/PriorityBarChart.module.css` | 라벨 ellipsis 제거 + 컨테이너 border/shadow 추가 + 점수 값에 박스 뱃지 효과 |
| `src/components/evaluation/ConsistencyDisplay.jsx` | `✓ 통과`/`✗ 기준 초과` 필(pill) 뱃지 + CR/0.1 비율 게이지 바 |
| `src/components/evaluation/ConsistencyDisplay.module.css` | `.statusBadge`, `.gauge`, `.gaugeTrack`, `.gaugeFill` 스타일 |

### 2. `2b02da1` — 설문 checkbox 응답 그래프 미표시 버그 수정
**원인**: checkbox 배열 응답이 `{ value: [...] }` 래핑 없이 저장 → 결과 페이지에서 `.value`가 undefined → 카운트 0

| 수정 파일 | 내용 |
|-----------|------|
| `src/hooks/useSurvey.js` | 배열도 `{ value: [...] }`로 래핑 저장: `!Array.isArray(answer)` 체크 추가 |
| `src/pages/SurveyResultPage.jsx` | 레거시 데이터(배열 직접 저장) 호환 읽기: `r.answer` 자체가 배열인 경우 처리 |

### 3. `c5dcfcd` — 인구통계학적 설문 편집 기능 개선
**Step 3도 Google Forms 스타일(GFormCard)로 변경 — 항상 편집 가능**

| 수정 파일 | 내용 |
|-----------|------|
| `src/pages/SurveyBuilderPage.jsx` | `StepQuestions`에서 `GFormCard` 사용 + 우측 플로팅 툴바 추가, 미사용 `QuestionCard` 컴포넌트 제거 |

## 수정 파일 전체 목록 (8개)

1. `src/styles/pairwise.module.css`
2. `src/components/evaluation/PairwiseCell.jsx`
3. `src/components/evaluation/PriorityBarChart.module.css`
4. `src/components/evaluation/ConsistencyDisplay.jsx`
5. `src/components/evaluation/ConsistencyDisplay.module.css`
6. `src/hooks/useSurvey.js`
7. `src/pages/SurveyResultPage.jsx`
8. `src/pages/SurveyBuilderPage.jsx`

## 검증
- `npm run build` — 빌드 성공
- `npx vitest run` — 121개 테스트 전원 통과
- 3건 모두 `origin/main` 푸시 완료 → GitHub Actions 자동 배포
