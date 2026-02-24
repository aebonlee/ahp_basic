# 2026-02-24 — 설문 설계 구글 폼 스타일 개편 + 4단계 탭 UI

> **날짜**: 2026-02-24
> **커밋**: 2건 (`206f848`, `a44b4a1`)
> **변경 파일**: 6개 (코드) + 1개 (개발일지)

---

## 커밋 타임라인

| 커밋 | 내용 |
|:----:|------|
| `206f848` | 설문 설계 구글 폼 스타일 개편 + DB 마이그레이션 RLS 수정 |
| `a44b4a1` | 설문 설계 4단계 탭 UI 개편 + category 컬럼 추가 |

---

## 세션 1 — 구글 폼 스타일 개편 + RLS 수정 (`206f848`)

### 1. DB 마이그레이션 RLS 수정 (`004_survey_tables.sql`)

| 변경 전 | 변경 후 |
|---------|---------|
| `FOR ALL USING (subquery)` | `SELECT/INSERT/UPDATE/DELETE` 개별 분리 |
| 직접 서브쿼리 | `public.is_project_owner(project_id)` 함수 사용 |
| 평가자 정책 2개 | 평가자 `SELECT/INSERT/UPDATE/DELETE` + `WITH CHECK` 명시 |

> 기존 003_fix_all_rls.sql 패턴과 100% 일치하도록 수정

### 2. SurveyBuilderPage 구글 폼 스타일 전면 개편

- 타이틀 카드 (상단 4px primary 컬러 배너)
- 질문 카드 좌측 컬러 바 (활성 시 primary 강조)
- 유형별 미리보기 (라디오 dot, 체크박스 square, 리커트 가로 배치)
- 기본 인구통계 질문 템플릿 11개 원클릭 로드
- 질문 복제 기능 추가

### 3. EvalPreSurveyPage 구글 폼 응답 스타일 개선

- 질문 카드 좌측 4px primary 바 추가
- 리커트 척도: 가로 바 + 선택 시 primary 배경/흰색 텍스트
- 모바일 리커트 세로 스택 전환

---

## 세션 2 — 4단계 탭 UI 개편 (`a44b4a1`)

### 핵심 변경: SurveyBuilderPage를 4단계 탭 구조로 전면 재설계

```
┌──────────────────────────────────────────────────────┐
│  ① 연구 소개  │ ② 개인정보 동의  │ ③ 인구통계  │ ④ 연구자 설문  │
│   [active]    │                  │             │               │
└──────────────────────────────────────────────────────┘
│  STEP 1                                              │
│  연구 소개                                            │
│                                                      │
│  [기본 양식 불러오기] 배너 (내용 없을 때)               │
│                                                      │
│  ┌────────────────────────────────────┐               │
│  │ textarea (연구 배경/목적/방법)      │               │
│  └────────────────────────────────────┘               │
│                                                      │
│  ← 이전           1 / 4           다음 →              │
└──────────────────────────────────────────────────────┘
```

### 4단계 구성

| 탭 | 내용 | 기본 템플릿 |
|:--:|------|:-----------:|
| **① 연구 소개** | 연구 배경/목적/방법 textarea | 연구소개 양식 |
| **② 개인정보 동의** | 동의서 textarea | 개인정보 동의서 양식 |
| **③ 인구통계학적 설문** | 질문 빌더 (category=demographic) | 11개 질문 템플릿 |
| **④ 연구자 설문항목** | 질문 빌더 (category=custom) | 3개 예시 질문 템플릿 |

### DB 스키마 변경

```sql
-- survey_questions 테이블에 category 컬럼 추가
ALTER TABLE survey_questions
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'demographic';

-- CHECK 제약조건
ALTER TABLE survey_questions
  ADD CONSTRAINT survey_questions_category_check
  CHECK (category IN ('demographic', 'custom'));
```

### 기본 템플릿 상세

**연구소개 양식**: 연구 목적 / 연구 방법 / 소요 시간 / 기대 효과 구조

**개인정보 동의서 양식**: 수집 항목 / 수집 목적 / 보유 기간 / 동의 거부 시 불이익 구조

**인구통계 질문 (11개)**:

| # | 질문 | 유형 |
|:-:|------|------|
| 1 | 성별 | radio |
| 2 | 연령대 | dropdown |
| 3 | 최종 학력 | dropdown |
| 4 | 직업 | short_text |
| 5 | 전문 분야 | short_text |
| 6 | 관련 경력 | dropdown |
| 7 | 소속 기관 유형 | radio |
| 8 | 전문성 자가 평가 | likert |
| 9 | AHP 평가 경험 | radio |
| 10 | 소속 기관명 | short_text |
| 11 | 연락처 | short_text |

**연구자 설문 예시 (3개)**:
1. 연구 주제 사전 인지 여부 (radio)
2. 관련 업무/연구 경험 (long_text)
3. 추가 고려사항 자유 기술 (long_text)

### useSurvey Hook 변경

- `addQuestion`에 `category` 파라미터 전달 지원

---

## 수정 파일 목록 (전체)

| 파일 | 설명 |
|------|------|
| `supabase/migrations/004_survey_tables.sql` | RLS 개별 분리 + category 컬럼 추가 |
| `src/hooks/useSurvey.js` | addQuestion category 지원 |
| `src/pages/SurveyBuilderPage.jsx` | 4단계 탭 전면 재설계 + 기본 템플릿 4종 |
| `src/pages/SurveyBuilderPage.module.css` | 탭 UI + 구글 폼 스타일 CSS |
| `src/pages/EvalPreSurveyPage.jsx` | 구글 폼 응답 스타일 개선 |
| `src/pages/EvalPreSurveyPage.module.css` | 좌측 바 + 리커트 가로 바 |

---

## Supabase 수동 실행 필요

```sql
-- 기존 테이블이 없다면 004_survey_tables.sql 전체 실행
-- 기존 테이블이 있다면 아래만 실행:
ALTER TABLE survey_questions
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'demographic';
ALTER TABLE survey_questions
  ADD CONSTRAINT survey_questions_category_check
  CHECK (category IN ('demographic', 'custom'));
```

---

## 검증

- [x] `npx vite build` — 빌드 성공 (1,202KB)
- [ ] Supabase SQL Editor에서 category 컬럼 추가 실행
- [ ] 설문 설계 4단계 탭 전환 확인
- [ ] 각 단계 기본 템플릿 로드 확인
- [ ] 인구통계/연구자 질문 독립 관리 확인
