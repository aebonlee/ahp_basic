# 2026-03-09 세션 종합 개발 내역

## 커밋 이력

| 커밋 | 설명 |
|------|------|
| `0644a7f` | feat: 평가자 모델 구조 미리보기 + 이름 검증 및 재평가 확인 |
| `86f1a7c` | feat: 설문 삭제 UX 개선 + 평가 화면 9점 척도/중요도 정렬 수정 |
| `87937c9` | fix: 기준 종합중요도 차트 정렬 + 상위/하위기준 시각 구분 |

---

## 1. 설문 질문 추가/삭제 자유도 개선

### 배경
- 템플릿 11개 로드 후 전부 지우려면 하나씩 삭제해야 하는 불편
- 🗑 클릭 즉시 삭제되어 실수 위험
- 질문이 1개라도 있으면 템플릿 로드 버튼이 사라짐

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/hooks/useSurvey.js` | `deleteQuestionsByCategory(category)` 일괄 삭제 함수 추가 |
| `src/pages/SurveyBuilderPage.jsx` | ConfirmDialog 연동 (개별/전체 삭제 확인), 헤더에 "전체 삭제" + "+ 템플릿 추가" 버튼 |
| `src/pages/SurveyBuilderPage.module.css` | `.headerActions`, `.headerActionBtn`, `.headerActionBtnDanger` 스타일 |

### 동작
- **개별 삭제**: 🗑 → ConfirmDialog 확인 → 삭제
- **전체 삭제**: 헤더 "전체 삭제" → ConfirmDialog "모든 {카테고리} 질문(N개)을 삭제하시겠습니까?" → 일괄 삭제
- **템플릿 추가**: 질문이 있어도 헤더에 "+ 템플릿 추가" 버튼 → 기존 질문 유지 + 템플릿 뒤에 추가

---

## 2. 평가자 모드 9점 척도 정렬 수정

### 배경
양쪽 라벨이 `min-width: 140px; max-width: 240px`으로 글자 길이에 따라 너비가 달라져 셀 그리드가 행마다 어긋남

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/styles/pairwise.module.css` | `labelLeft`/`labelRight`를 `width: var(--label-width-desktop)` 고정폭(200px)으로 변경, `word-break: keep-all` 추가, 모바일도 `var(--label-width-mobile)` 고정 |

### 결과
모든 행의 라벨이 동일 폭 → 스케일 헤더/숫자와 완벽 정렬, 말 줄임 없이 긴 텍스트는 줄바꿈

---

## 3. 평가자 모드 실시간 중요도 바 차트 정렬 수정

### 배경
라벨이 `min-width: 100px; max-width: 180px`으로 가변이라 바 트랙 시작점이 행마다 다름

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/components/evaluation/PriorityBarChart.module.css` | `.container`를 CSS Grid(`grid-template-columns: auto 1fr auto`)로 변경, `.row`를 `display: contents`로 변경 |

### 결과
CSS Grid의 `auto` 컬럼이 가장 긴 라벨 기준으로 너비 통일 → 모든 바 트랙 시작점 일치

---

## 4. 기준 종합중요도 차트 정렬 + 상위/하위기준 시각 구분

### 배경
- `paddingLeft: level * 16`이 행 전체에 적용되어 바 트랙 시작점이 레벨마다 달라짐
- 상위기준과 하위기준의 시각적 구분 없음

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/components/results/ResultSummary.jsx` | 상위기준(■)/하위기준(└) 접두어, `barRowTop`/`barRowSub` 클래스 분리, 인덴트를 라벨에만 적용 |
| `src/styles/results.module.css` | CSS Grid(`auto 1fr auto`) + `display: contents`, 상위기준 굵은 폰트 + 그룹 구분선, 하위기준 연한 색상 |

### 시각 결과
```
■ 상위기준A       ████████████████  35.200%   ← 굵고 큰 폰트
  └ 하위기준1     ████████          18.500%   ← 연한 색, 인덴트
  └ 하위기준2     ███████           16.700%
──────────────────────────────────────────────  ← 구분선
■ 상위기준B       ████████████████  34.800%
  └ 하위기준3     ██████████        20.100%
```

---

## 수정 파일 전체 목록

| # | 파일 | 변경 |
|---|------|------|
| 1 | `src/hooks/useSurvey.js` | `deleteQuestionsByCategory` 추가 |
| 2 | `src/pages/SurveyBuilderPage.jsx` | 삭제 확인 + 전체 삭제 + 템플릿 재로드 |
| 3 | `src/pages/SurveyBuilderPage.module.css` | 헤더 액션 버튼 스타일 |
| 4 | `src/styles/pairwise.module.css` | 9점 척도 라벨 고정폭 정렬 |
| 5 | `src/components/evaluation/PriorityBarChart.module.css` | CSS Grid 정렬 |
| 6 | `src/components/results/ResultSummary.jsx` | 상위/하위 기준 시각 구분 + 정렬 |
| 7 | `src/styles/results.module.css` | CSS Grid 정렬 + 상위/하위 스타일 |

**총 7개 파일 수정, 문서 1개 추가**
