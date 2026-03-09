# 2026-03-09 개발 내역: 모델 구조 미리보기 + 평가자 입력 검증

## 1. 평가자에게 AHP 모델 구조 보여주기

### 배경
평가자가 쌍대비교 시작 전에 어떤 기준/대안이 있는지 전혀 모른 채 평가에 들어가는 문제.
평가 시작 전 + 평가 중에 연구자가 설계한 모델(기준 계층 + 대안)을 볼 수 있게 함.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/model/ModelPreview.jsx` | `PreviewContent` named export 추가 |
| `src/components/evaluation/AhpIntroduction.jsx` | 모델 구조 섹션 추가 (PreviewContent 재사용) |
| `src/components/evaluation/AhpIntroduction.module.css` | `.modelSection`, `.modelTitle`, `.modelDesc` 스타일 |
| `src/pages/PairwiseRatingPage.jsx` | 프로젝트명 fetch + criteria tree 빌드 + "모델 보기" 버튼 + ModelPreview 모달 |
| `src/pages/PairwiseRatingPage.module.css` | `.modelBtn` 스타일 |

### 동작
- **평가 시작 전 (AhpIntroduction)**: 안내 카드 아래에 기준 계층 트리 + 대안 목록 인라인 표시
- **평가 중 (PairwiseRatingPage)**: 헤더에 "모델 보기" 버튼 → 클릭 시 ModelPreview 모달

---

## 2. 평가자 이름 반복 글자 검증 + 기존 평가자 재확인

### 배경
- 공개 접근(QR) 평가자가 "김김김" 같은 장난 이름을 입력하는 것을 차단
- 기존 평가자가 다시 접속할 때 이름+전화번호 일치 시 바로 진행하지 않고 확인 단계 추가

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/lib/evaluatorUtils.js` | `isRepeatedName()` 함수 추가 — 같은 글자 반복 및 1글자 이름 차단 |
| `supabase/migrations/014_register_evaluator_is_existing.sql` | `public_register_evaluator` RPC에 `is_existing` boolean 반환 추가 |
| `src/pages/InviteLandingPage.jsx` | 이름 검증 + 기존 평가자 재확인 `confirm_existing` 플로우 |
| `src/pages/InviteLandingPage.module.css` | `.cancelBtn` 스타일 |

### 이름 검증 규칙
- 2글자 미만 → 차단
- 모든 글자가 동일 (예: "김김김", "ㅋㅋㅋ", "aaa") → 차단

### 기존 평가자 재접속 플로우

| 조건 | 결과 |
|------|------|
| 전화번호 매칭 + 이름 일치 | `confirm_existing` 화면 → "이전 평가를 이어서 진행하시겠습니까?" 확인 후 진행 |
| 전화번호 매칭 + 이름 불일치 | 에러: "등록된 이름을 정확히 입력해주세요." |
| 전화번호 미매칭 | 신규 평가자로 바로 등록 |

### SQL 마이그레이션 (014)
```sql
-- public_register_evaluator 반환 타입에 is_existing BOOLEAN 추가
-- 기존 전화번호 → TRUE, 신규 등록 → FALSE
```

---

## 검증
- `npm run build` — 빌드 성공
- `npx vitest run` — 121개 테스트 전부 통과

## 배포 참고
- Supabase에 `014_register_evaluator_is_existing.sql` 마이그레이션 실행 필요
- GitHub Actions 자동 배포 (main push 시)
