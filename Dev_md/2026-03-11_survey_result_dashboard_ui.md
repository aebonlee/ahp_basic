# 설문집계 대시보드 UI 개선 + 폰트 상향

## 날짜
2026-03-11

## 개요
설문집계(SurveyResultPage)의 상단 집계 영역을 **대시보드형 카드**로 전면 교체하고,
설문 응답 영역을 **3~4열 그리드**로 재배치, **액션 툴바 상단 배치**, **전체 폰트 크기 14px 기준 상향** 적용.

## 변경 전 상태
- 상단 집계: 단순 텍스트 `85 / 131 설문 응답 | 19 / 131 평가 완료`
- 설문 응답: `<table>` 세로 1열 나열 (항목이 많으면 스크롤 길어짐)
- 액션 툴바: 마스터 리스트 하단에만 배치
- 전체 폰트: 12.48px (0.78rem) 기준 — 가독성 낮음

## 수정 내용

### 1. 대시보드형 집계 카드 (`SurveyResultPage.jsx` + `.module.css`)

**5열 메인 카드:**
| 카드 | 내용 |
|------|------|
| 총 평가자 | `stats.total` (숫자만) |
| 설문 응답 | `stats.surveyed / stats.total` + 진행률 바 |
| 평가 완료 | `stats.completed / stats.total` + 녹색 진행률 바 |
| 평가 진행중 | `stats.inProgress` (숫자만) |
| 미시작 | `stats.notStarted` (숫자만) |

**동적 질문별 응답률 카드:**
- 프로젝트에 등록된 설문 질문(questions)에 따라 자동 생성
- 각 카드: 질문 텍스트(줄임) + `응답수 / 전체` + 진행률 바
- `questionStats` useMemo로 계산

**추가 state/computed:**
- `stats` — `inProgress`, `notStarted` 필드 추가
- `questionStats` — `questions.map(q => { count, total })` 질문별 응답 수

**CSS 클래스:**
- `.dashboard` — CSS Grid 5열 (반응형: 1100px→3열, 600px→2열)
- `.dashCard` — 메인 카드 (중앙 정렬, 큰 숫자)
- `.dashNum` — 1.6rem 볼드 숫자
- `.dashSub` — 분모 (/ total) 스타일
- `.dashLabel` — 카드 레이블
- `.dashBar` / `.dashBarFill` — 미니 진행률 바 (5px 높이)
- `.dashCardSm` — 질문별 작은 카드
- `.dashSmLabel` / `.dashSmVal` — 작은 카드 내부 스타일

### 2. 설문 응답 3~4열 그리드

**변경 전:** `<table>` → `<tr><td>질문</td><td>답변</td></tr>` 세로 나열
**변경 후:** `.answerGrid` CSS Grid 4열 → 각 셀에 질문+답변

**CSS 클래스:**
- `.answerGrid` — `grid-template-columns: repeat(4, 1fr)` (반응형: 1100px→3열, 600px→2열)
- `.answerCell` — 개별 셀 (padding, border, radius)
- `.answerLabel` — 질문 텍스트 (muted, ellipsis)
- `.answerVal` — 답변 값 (bold)
- `.answerNone` — 미응답 표시 (`-`)

### 3. 액션 툴바 상단 배치

**변경:** 체크박스 선택 시 액션 툴바(N명 선택, 선택 SMS, 결과 내보내기, 그룹 저장, 선택해제)를
`statusHeader` 영역에도 추가하여 스크롤 없이 바로 접근 가능하도록 함.

**CSS 클래스:**
- `.statusActions` — flex 컨테이너 (gap, wrap)

### 4. 전체 폰트 크기 14px 기준 상향

**변경 매핑 (rem):**
| 변경 전 | 변경 후 | 적용 대상 |
|---------|---------|-----------|
| 0.62 | 0.75 | — |
| 0.65 | 0.78 | — |
| 0.68 | 0.80 | — |
| 0.70 | 0.82 | — |
| 0.72 | 0.84 | `.groupSelect`, `.toolbarBtn`, `.crPass`, `.crFail`, `.priName` |
| 0.75 | 0.875 | `.evalName`, `.badgeDone/Progress/Pending`, `.detailBtn`, `.masterListHeader label`, `.groupDeleteBtn`, `.crName`, `.statLabel`, `.dashLabel`, `.questionType` |
| 0.78 | 0.875 | — |
| 0.80 | 0.90 | — |
| 0.82 | 0.92 | `.evalIdx`, `.smsBtn`, `.dashSmLabel`, `.detailSectionTitle`, `.detailEmpty`, `.priVal` |
| 0.85 | 0.95 | `.detailPlaceholder`, `.answerLabel`, `.answerVal`, `.responseCount`, `.textItem`, `.emptyMsg`, `.dashSub`, `.groupInput` |
| 0.88 | 0.95 | — |
| 0.90 | 0.95 | — |

### 5. TDZ 오류 수정 (`SurveyResultPage.jsx`)

**문제:** `handleExportChecked` useCallback이 `compByEvaluator`/`directByEvaluator` useMemo보다 앞에 선언되어
빌드된 코드에서 Temporal Dead Zone(TDZ) 오류 발생.

**해결:** `handleExportChecked`를 `compByEvaluator`/`directByEvaluator` 선언 이후로 이동.
주석 추가: `// 선택 평가자 결과 내보내기 (compByEvaluator, directByEvaluator 이후 선언)`

## 파일 목록
| 파일 | 상태 | 설명 |
|------|------|------|
| `src/pages/SurveyResultPage.jsx` | 수정 | 대시보드 카드, 응답 그리드, 상단 툴바, TDZ 수정 |
| `src/pages/SurveyResultPage.module.css` | 수정 | 대시보드/그리드/툴바 스타일, 폰트 상향 |

## 관련 커밋
- `fix: handleExportChecked를 compByEvaluator 선언 이후로 이동 (TDZ 오류 수정)`
- `refactor: 설문응답 3~4열 그리드 + 상단 대시보드형 집계 카드`
- `feat: 액션 툴바 상단 배치 + 전체 폰트 크기 14px 기준으로 상향`

## 검증 항목
- [x] 대시보드 5열 카드 표시 (총 평가자, 설문 응답, 평가 완료, 진행중, 미시작)
- [x] 질문별 응답률 카드 동적 생성
- [x] 설문 응답 4열 그리드 배치
- [x] 액션 툴바 상단 + 하단 동시 표시
- [x] 전체 폰트 14px 기준 가독성 확인
- [x] 반응형: 1100px(3열), 900px(1단), 600px(2열) 전환
- [x] TDZ 오류 해결 확인
- [x] 빌드 성공
