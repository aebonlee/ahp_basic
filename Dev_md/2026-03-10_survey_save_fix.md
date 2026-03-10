# 설문 최종 저장 오류 수정

## 날짜
2026-03-10

## 개요
설문 응답 제출(`submitResponses`), 동의 기록(`submitConsent`), 설문 설정 저장(`saveConfig`)에서 Supabase `.select()` 누락으로 인한 사일런트 실패 가능성을 수정했다.

## 원인 분석
Supabase JS v2에서 `.upsert()` 및 `.update()` 호출 시 `.select()`를 체이닝하지 않으면:
- 반환 데이터가 `null`이 되어 후속 처리에 문제 발생 가능
- RLS 정책에 따라 에러가 정상적으로 전파되지 않을 수 있음
- 기존 `addQuestion()`, `updateQuestion()`은 `.select().single()`을 사용 중이었으나, 3개 함수만 누락

## 수정 내용

### `src/hooks/useSurvey.js`

#### 1. `submitResponses()` (설문 응답 제출)
```javascript
// Before
.upsert(rows, { onConflict: '...' });

// After
.upsert(rows, { onConflict: '...' }).select();
```

#### 2. `submitConsent()` (동의 기록 저장)
```javascript
// Before
.upsert({...}, { onConflict: '...' });

// After
.upsert({...}, { onConflict: '...' }).select();
```

#### 3. `saveConfig()` (설문 설정 저장)
```javascript
// Before
.update(updates).eq('id', projectId);

// After
.update(updates).eq('id', projectId).select();
```

## 영향 범위
- 평가자 설문 응답 제출 (EvalPreSurveyPage)
- 평가자 동의서 동의 (EvalPreSurveyPage)
- 관리자 설문 설정 저장 — 연구 소개, 동의서, 공개 배포 설정 (SurveyBuilderPage)
