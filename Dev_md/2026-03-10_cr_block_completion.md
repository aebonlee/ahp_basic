# 비일관성비율(CR) 초과 시 평가 완료 차단

## 날짜
2026-03-10

## 개요
쌍대비교 평가에서 비일관성비율(CR)이 기준(0.1)을 초과하거나 미완료 항목이 있을 때,
평가 완료 버튼을 차단하여 평가자가 반드시 수정 후 완료하도록 강제했다.

## 원인

### 증상
- 관리자 결과 페이지(`/result`)에 빨간색(비일관성 초과) 항목이 존재
- CR > 0.1인 상태에서도 "평가 완료" 가능했음 (경고만 표시, 차단 안 함)
- 미완료 상태(0/40 등)에서도 완료 가능

### 근본 원인
`SignaturePanel.jsx`에서 `!allComplete`이나 `!allConsistent` 시
경고 메시지만 표시하고 confirm 후 완료를 허용했다.

## 수정 내용

### `src/components/results/SignaturePanel.jsx`

1. **`canComplete` 플래그 추가**: `allComplete && allConsistent`
2. **`handleSign` 가드**: `if (!canComplete) return;` — 조건 미충족 시 즉시 반환
3. **버튼 비활성화**: `disabled={!canComplete}` — 미완료/CR 초과 시 클릭 불가
4. **버튼 텍스트 분기**:
   - 완료 가능: "평가 완료"
   - 미완료: "미완료 항목 있음"
   - CR 초과: "CR 초과 — 수정 필요"
5. **경고 메시지 개선**:
   - 미완료: "(N/M)" 진행률 표시
   - CR 초과: "수정 후 완료해주세요" 안내

### 기존 유지 사항
- EvalResultPage의 "재점검 필요 항목" 섹션 (돌아가기 버튼) 그대로 유지
- PairwiseRatingPage의 CR 표시 및 BestFitHelper 추천 기능 그대로 유지
- 이미 완료된 평가자(`signed === true`)는 영향 없음

## 동작 흐름 (수정 후)

```
평가자 쌍대비교 진행
  ↓
결과 페이지 도달
  ↓
[미완료 또는 CR 초과?]
  → YES: "평가 완료" 버튼 비활성화 + 사유 표시
         "재점검 필요 항목"에서 해당 페이지로 "돌아가기" 클릭
         → 쌍대비교 수정
         → 결과 페이지 재확인
  → NO: "평가 완료" 버튼 활성화
         → 클릭 → 서명 저장 → evaluators.completed = true
```

## 영향 범위
- 평가자 결과 페이지(`/eval/project/:id/result`)의 SignaturePanel
- 향후 새로 평가하는 평가자에게만 적용 (이미 완료된 평가는 영향 없음)
