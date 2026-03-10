# 설문집계 평가자 체크박스 선택 + 그룹/SMS/결과내보내기

## 날짜
2026-03-11

## 개요
설문집계(SurveyResultPage) 평가자 목록에 **체크박스**를 추가하여:
1. 선택한 평가자만 SMS 발송
2. 선택한 평가자만 AHP 결과 Excel 내보내기 (재집계)
3. 선택한 평가자를 이름 붙여 **그룹 저장** (Supabase 영구 저장)
4. 저장된 그룹 불러오기/삭제

## 변경 전 상태
- 평가자 목록에 체크박스 없음, 개별 선택 불가
- SMS는 전체 평가자 대상으로만 발송 가능
- 결과 내보내기는 전체 집계만 가능
- 평가자 그룹 기능 없음

## 수정 내용

### 1. DB 테이블 추가 (`supabase/migrations/017_evaluator_groups.sql`) — 신규
- `evaluator_groups` 테이블 생성
- 컬럼: `id`, `project_id`, `owner_id`, `name`, `evaluator_ids` (UUID[]), `created_at`
- UNIQUE 제약: `(project_id, name)` — 같은 프로젝트 내 동일 이름 그룹 방지
- RLS 정책: 프로젝트 소유자만 SELECT/INSERT/UPDATE/DELETE
- `project_id` 인덱스 추가

### 2. `src/hooks/useEvaluatorGroups.js` — 신규
- `useEvaluatorGroups(projectId)` 커스텀 훅
- 반환: `{ groups, loading, saveGroup, deleteGroup, fetchGroups }`
- `saveGroup(name, evaluatorIds)`: upsert 방식 — 같은 이름이면 덮어쓰기
- `deleteGroup(groupId)`: 그룹 삭제
- `useEvaluators.js` 동일 패턴 (useState + useCallback + useEffect)

### 3. `src/lib/exportUtils.js` — 수정
- `computeResultsForEvaluators()` 함수 추가
  - 선택된 evaluatorIds만으로 AHP 결과 재집계
  - `buildPageSequence()` → 페이지별 `aggregateComparisons()` / `aggregateDirectInputs()` 실행
  - 반환 형식: `{ goalId, pageResults, pageSequence, allConsistent }` (기존 `exportToExcel()` 호환)
- 기존 import에 `EVAL_METHOD`, `aggregateComparisons`, `aggregateDirectInputs`, `buildPageSequence` 추가

### 4. `src/pages/SurveyResultPage.module.css` — 수정
- `.evalCheck` — 체크박스 스타일 (accent-color: primary, 14x14)
- `.masterListHeader` — 전체선택 + 그룹 드롭다운 헤더 (flex, 하단 border)
- `.groupSelect` — 그룹 불러오기 드롭다운
- `.groupDeleteBtn` — 그룹 삭제 버튼 (danger 색상)
- `.floatingToolbar` / `.toolbarCount` / `.toolbarBtn` — 액션 툴바 (primary-bg 배경)
- `.toolbarBtnDanger` — 선택해제 등 위험 액션 버튼
- `.groupForm` / `.groupInput` / `.groupActions` — 그룹 저장 인라인 폼

### 5. `src/pages/SurveyResultPage.jsx` — 수정

**추가 import:**
- `useEvaluatorGroups`, `useToast`, `computeResultsForEvaluators`, `exportToExcel`

**추가 state:**
- `checkedIds` (Set) — 체크된 평가자 ID
- `smsForChecked` (bool) — SMS 모달을 선택자만으로 열지 여부
- `groupModalOpen` / `groupName` — 그룹 저장 모달

**추가 함수:**
- `toggleCheck(evId)` — 개별 체크/해제 (Set toggle 패턴)
- `toggleAll()` — 전체선택/해제
- `loadGroup(groupId)` — 저장된 그룹 불러와 체크박스 자동 체크
- `handleSaveGroup()` — 그룹 이름 입력 → Supabase upsert → 토스트
- `handleDeleteGroup(groupId)` — 그룹 삭제 → 토스트
- `handleExportChecked()` — 선택 평가자 재집계 → Excel 다운로드
- `smsEvaluators` (useMemo) — SMS 대상 평가자 필터

**UI 변경:**
- 마스터 리스트 상단: 전체선택 체크박스 + 그룹 불러오기 드롭다운 + 삭제 버튼
- 각 evalRow: 체크박스 추가 (세부내역 버튼 앞)
- 1명 이상 체크 시 **액션 툴바** 표시:
  - `N명 선택` | `선택 SMS` | `결과 내보내기` | `그룹 저장` | `선택해제`
- 그룹 저장: 인라인 폼 (이름 입력 → Enter/저장 버튼)
- SMS 발송 버튼: 기존 동작 유지 (전체 평가자)
- 선택 SMS: 체크된 평가자만 SmsModal에 전달

## 아키텍처 결정
- **ParticipantPanel.jsx 패턴 재사용**: `selectedIds` Set + `toggleSelect` 패턴
- **인라인 그룹 폼**: 별도 Modal 대신 인라인 폼 → UX 경량화
- **SmsModal 수정 없음**: evaluators prop만 필터하여 전달
- **computeResultsForEvaluators()**: useAhpContext.js의 집계 로직을 함수화하여 exportUtils에 배치

## 파일 목록
| 파일 | 상태 | 설명 |
|------|------|------|
| `supabase/migrations/017_evaluator_groups.sql` | 신규 | 평가자 그룹 테이블 + RLS |
| `src/hooks/useEvaluatorGroups.js` | 신규 | 그룹 CRUD 훅 |
| `src/lib/exportUtils.js` | 수정 | `computeResultsForEvaluators()` 추가 |
| `src/pages/SurveyResultPage.jsx` | 수정 | 체크박스 + 툴바 + 그룹 + 내보내기 |
| `src/pages/SurveyResultPage.module.css` | 수정 | 체크박스/툴바/그룹 스타일 |

## 배포 전 필수 작업
- Supabase SQL 에디터에서 `017_evaluator_groups.sql` 수동 실행 필요

## 검증 항목
- [ ] 각 evalRow에 체크박스 표시, 전체선택 동작
- [ ] 1명 이상 체크 시 액션 툴바 표시
- [ ] "선택 SMS" → SmsModal에 체크된 평가자만 표시
- [ ] "결과 내보내기" → 선택자만 집계한 Excel 다운로드
- [ ] "그룹 저장" → 이름 입력 → Supabase 저장 → 토스트
- [ ] "그룹 불러오기" 드롭다운 → 저장된 그룹 선택 시 체크박스 자동 체크
- [ ] 빌드 성공
