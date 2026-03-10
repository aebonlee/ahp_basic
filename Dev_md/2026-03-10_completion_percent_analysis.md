# 설문 완료 퍼센트 계산 로직 분석

## 날짜
2026-03-10

## 개요
AHP 쌍대비교 평가의 "완료 퍼센트" 계산이 정확한지 전체 데이터 흐름을 추적·검증했다.

## 핵심 공식

```javascript
// EvalResultPage.jsx (82~127행)
percent = Math.round((completedCells / totalCells) * 100)
```

- **totalCells**: 전체 필요한 쌍대비교 쌍 수 (각 페이지별 `n*(n-1)/2`의 합계)
- **completedCells**: 실제 응답된 쌍대비교 쌍 수 (`comparisons` 맵에 값 존재)

## 데이터 흐름

```
DB: pairwise_comparisons 테이블
  ↓ (select * where project_id & evaluator_id)
EvaluationContext: comparisons 맵 생성
  key: "criterion_id:row_id:col_id" → value
  ↓
EvalResultPage: buildPageSequence() → 페이지별 쌍 순회
  key: "parentId:itemIds[i]:itemIds[j]" (i < j)
  → totalCells++, comparisons[key] 존재 시 completedCells++
  ↓
SignaturePanel: 퍼센트 표시 + 프로그레스바
  "{completedCells}/{totalCells} ({percent}%)"
```

## 키 매칭 검증

| 단계 | criterion_id | row_id | col_id |
|---|---|---|---|
| **저장** (PairwiseRow.jsx:33) | `parentId` | `pair.left.id` | `pair.right.id` |
| **DB 로드** (EvaluationContext:99) | `c.criterion_id` | `c.row_id` | `c.col_id` |
| **계산** (EvalResultPage:98) | `page.parentId` | `itemIds[i]` | `itemIds[j]` |

- `pair.left` = `items[i]`, `pair.right` = `items[j]` (i < j, generateItemPairs)
- 저장과 계산 시 동일한 `buildPageSequence()` 사용 → **키 일치 보장**

## 순서 일관성

- `criteria`: `.order('sort_order')` 정렬 (EvaluationContext:80)
- `alternatives`: `.order('sort_order')` 정렬 (EvaluationContext:81)
- 평가 입력과 결과 계산 모두 같은 Context 데이터 사용 → 항목 순서 동일

## 페이지 구성 (buildPageSequence)

### 1. 기준 비교 페이지
- 같은 부모 아래 형제 기준이 **2개 이상**일 때 생성
- `parentId` = 부모 기준 ID (최상위는 프로젝트 UUID)
- `items` = 형제 기준들

### 2. 대안 비교 페이지
- 대안이 **2개 이상**이고, 말단 기준(leaf criterion)이 존재할 때 생성
- `parentId` = 말단 기준 ID
- `items` = 전체 대안 목록

## 예시

프로젝트 구조:
- 목표 → 기준 A, B, C (3개)
- 기준 A → 하위 A1, A2, A3, A4 (4개)
- 대안: X, Y (2개), 말단 기준: B, C, A1~A4 (6개)

| 페이지 | 비교 대상 | 쌍 수 |
|---|---|---|
| 기준 비교 (목표) | A vs B vs C | 3*(3-1)/2 = **3** |
| 기준 비교 (A) | A1 vs A2 vs A3 vs A4 | 4*(4-1)/2 = **6** |
| 대안 비교 (B) | X vs Y | 2*(2-1)/2 = **1** |
| 대안 비교 (C) | X vs Y | **1** |
| 대안 비교 (A1~A4) | 각각 X vs Y | **1** × 4 = **4** |
| **합계 (totalCells)** | | **15** |

## 표시 위치

1. **SignaturePanel** — 평가자 결과 페이지 하단 프로그레스바
2. **EvaluationProgress** — 평가 진행 중 상태 표시
3. **AdminResultPage** — 관리자 화면 (전체 평가자 집계)
4. **WorkshopPage** — 워크숍 모드 진행률

## 엣지 케이스

- `value === 0` (과거 버그 데이터): `undefined`가 아니므로 **완료로 카운트**, 계산 시 1(동등)로 변환
- 항목 1개인 그룹: `children.length < 2` → 페이지 미생성 (정상)
- 대안 없음: `alternatives.length < 2` → 대안 비교 페이지 미생성 (정상)

## 검증 결론

**계산 로직은 정확하다.** 동일한 `buildPageSequence()` + `sort_order` 정렬로 키 순서가 일관되며, 저장·로드·계산 간 키 형식이 완전히 일치한다.

## 관련 파일

| 파일 | 역할 |
|---|---|
| `src/pages/EvalResultPage.jsx` | 완료율 계산 핵심 로직 (82~127행) |
| `src/components/results/SignaturePanel.jsx` | 퍼센트 표시 UI (29행) |
| `src/lib/pairwiseUtils.js` | `buildPageSequence()`, `generateItemPairs()` |
| `src/contexts/EvaluationContext.jsx` | DB 로드 + `comparisons` 맵 생성 |
| `src/components/evaluation/PairwiseRow.jsx` | 쌍대비교 저장 (33행) |
| `src/pages/AdminResultPage.jsx` | 관리자 집계 완료율 (84~150행) |
