# 평가 완료 버튼 오류 수정

## 날짜
2026-03-10

## 개요
평가 결과 페이지에서 "평가 완료" 버튼 클릭 시 오류가 발생하는 문제를 수정했다.

## 원인 분석

### 1. 변수 참조 순서 오류 (EvalResultPage.jsx)
- `isCompleted` useMemo가 `evaluatorId` useMemo보다 먼저 선언됨
- `evaluatorId`가 선언 전에 참조되어 TDZ(Temporal Dead Zone) 오류 발생 가능
- `isCompleted`가 항상 `false`로 평가되어 완료 상태 판단 실패

### 2. Supabase `.select()` 누락 + 에러 미검출 (SignaturePanel.jsx)
- `.insert()`와 `.update()` 호출 시 `.select()` 누락
- `{ error }` 반환값을 확인하지 않고 try/catch에만 의존
- Supabase는 에러 시 throw하지 않고 `{ error }` 객체로 반환 → catch 미동작

### 3. RLS 정책 누락 (evaluators 테이블)
- `evaluators` 테이블에 `evaluators_owner_update` 정책만 존재 (프로젝트 소유자만 UPDATE 가능)
- 평가자가 자기 자신의 `completed` 필드를 업데이트할 수 있는 정책이 없음
- `.update({ completed: true })` 호출이 RLS에 의해 사일런트 차단

## 수정 내용

### `src/pages/EvalResultPage.jsx`
1. **변수 순서 수정**: `evaluatorId` useMemo를 `isCompleted` 앞으로 이동
2. **서명 기반 완료 판단 추가**: `evaluation_signatures` 테이블에서 서명 존재 여부를 확인하여 `isCompleted` 보완
   - `evaluators.completed`가 미설정되어도 서명이 있으면 완료로 판단
3. `supabase` import 추가

### `src/components/results/SignaturePanel.jsx`
1. **기존 서명 확인**: 컴포넌트 마운트 시 `evaluation_signatures`에서 기존 서명 조회 → 이미 완료된 경우 버튼 숨김
2. **insert → upsert 변경**: 중복 삽입 방지 (`onConflict: 'project_id,evaluator_id'`)
3. **`.select()` 추가**: Supabase v2 안정적 동작을 위해 `.select()` 체이닝
4. **에러 체크 추가**: `{ error }` 반환값을 확인하고 `throw error`로 전파
5. **evaluators UPDATE 제거**: DB 트리거로 자동 처리하도록 변경

### `supabase/migrations/016_evaluator_complete_trigger.sql` (신규)
- `auto_complete_evaluator()` 트리거 함수 생성 (SECURITY DEFINER)
- `evaluation_signatures` INSERT 시 자동으로 `evaluators.completed = true` 설정
- RLS를 우회하여 평가자 완료 상태를 안전하게 업데이트

## ⚠️ DB 마이그레이션 필요
Supabase Dashboard → SQL Editor에서 아래 SQL을 실행해야 합니다:

```sql
-- 트리거 함수
CREATE OR REPLACE FUNCTION public.auto_complete_evaluator()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.evaluators SET completed = true WHERE id = NEW.evaluator_id;
  RETURN NEW;
END;
$$;

-- 트리거
DROP TRIGGER IF EXISTS trg_auto_complete_evaluator ON public.evaluation_signatures;
CREATE TRIGGER trg_auto_complete_evaluator
  AFTER INSERT ON public.evaluation_signatures
  FOR EACH ROW EXECUTE FUNCTION public.auto_complete_evaluator();
```

## 영향 범위
- 평가자 평가 결과 페이지 (EvalResultPage)
- 평가 완료 서명 패널 (SignaturePanel)
- 평가자 완료 상태 판단 로직 전체

## 코드 수정 없이도 동작하는 부분
- 서명 삽입(upsert)과 서명 기반 완료 판단은 DB 마이그레이션 없이도 동작
- 단, `evaluators.completed` 자동 설정은 트리거 적용 후에만 동작
