# 평가 완료 후 수정 잠금 & 결과 전용 화면

**날짜**: 2026-03-09
**유형**: 기능 개선 (보안/UX)

## 문제

- 평가자가 "평가 완료" 버튼을 누른 후에도 다시 평가 점수를 수정할 수 있었음
- 완료된 평가자가 재접속 시 평가 페이지에 진입 가능했음

## 해결

### 수정 파일 (4개)

#### 1. `src/pages/PairwiseRatingPage.jsx`
- `useEffect`로 evaluator의 `completed` 상태 확인
- `completed === true`이면 결과 페이지(`/eval/project/:id/result`)로 자동 리다이렉트

#### 2. `src/pages/EvalResultPage.jsx`
- `isCompleted` 변수로 완료 여부 판별
- 완료된 평가자: "평가로 돌아가기" 버튼 숨김
- 완료된 평가자: "재점검 필요 항목" 섹션 숨김
- 완료된 평가자: DetailView/ConsistencyTable의 페이지 이동 링크 비활성화

#### 3. `src/pages/InviteLandingPage.jsx`
- `handleStartEval()`에서 `evaluator.completed` 체크
- 완료된 평가자: "이미 평가를 완료하셨습니다" 메시지 + "결과 확인" 버튼 표시
- 미완료 평가자: 기존 "평가 시작" 버튼 유지

#### 4. `src/components/results/ConsistencyTable.jsx`
- `onNavigateToPage`가 `undefined`일 때 안전하게 처리
- 클릭/키보드 이벤트 및 cursor 스타일 조건부 적용

## 구현 흐름

```
평가자 접속
  ↓
InviteLandingPage: evaluator.completed 확인
  ├─ completed=false → 평가 시작 (기존 흐름)
  └─ completed=true  → "결과 확인" 버튼 → /eval/project/:id/result

PairwiseRatingPage: 진입 시 completed 확인
  └─ completed=true → /eval/project/:id/result 자동 리다이렉트

EvalResultPage: completed 확인
  └─ completed=true → "돌아가기" 버튼/링크 모두 제거
```

## 기존 인프라 활용
- `evaluators.completed` 필드 (이미 존재)
- `evaluation_signatures` 테이블 (이미 존재)
- `SignaturePanel.jsx`의 `handleSign()`에서 `completed: true` 설정 (변경 없음)

## 빌드 검증
- `npm run build` 성공 확인
