-- ============================================
-- 010: anon RLS 정책 강화
-- 1) evaluators PII 노출 차단 → RPC 대체
-- 2) WRITE 정책: 교차 프로젝트 쓰기 차단
-- 3) user_profiles: 자기 자신만 조회
-- ============================================

-- ────────────────────────────────────────────
-- 1) evaluators: USING(true) → RPC로 대체
--    evaluators 테이블에는 email, phone_number 등 PII 포함
-- ────────────────────────────────────────────
DROP POLICY IF EXISTS "evaluators_anon_select" ON public.evaluators;

-- 헬퍼: evaluator가 속한 project_id 반환
CREATE OR REPLACE FUNCTION public.get_evaluator_project(eval_id UUID)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT project_id FROM evaluators WHERE id = eval_id;
$$;

-- 평가자 목록 조회 RPC (같은 프로젝트만, PII 제외)
CREATE OR REPLACE FUNCTION public.anon_get_evaluators(p_evaluator_id UUID)
RETURNS TABLE(id UUID, project_id UUID, name TEXT, completed BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE v_project_id UUID;
BEGIN
  v_project_id := get_evaluator_project(p_evaluator_id);
  IF v_project_id IS NULL THEN RETURN; END IF;
  RETURN QUERY
    SELECT e.id, e.project_id, e.name, e.completed
    FROM evaluators e WHERE e.project_id = v_project_id;
END; $$;

-- ────────────────────────────────────────────
-- 2) WRITE 정책 강화: evaluator_id + project_id 매칭 검증
--    교차 프로젝트 데이터 삽입/수정 차단
-- ────────────────────────────────────────────

-- 프로젝트 스코프 검증 함수
CREATE OR REPLACE FUNCTION public.is_valid_evaluator_for_project(eval_id UUID, proj_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM evaluators WHERE id = eval_id AND project_id = proj_id);
$$;

-- pairwise_comparisons: 교차 프로젝트 쓰기 차단
DROP POLICY IF EXISTS "comparisons_anon_insert" ON public.pairwise_comparisons;
DROP POLICY IF EXISTS "comparisons_anon_update" ON public.pairwise_comparisons;
CREATE POLICY "comparisons_anon_insert_v2" ON public.pairwise_comparisons
  FOR INSERT WITH CHECK (public.is_valid_evaluator_for_project(evaluator_id, project_id));
CREATE POLICY "comparisons_anon_update_v2" ON public.pairwise_comparisons
  FOR UPDATE USING (public.is_valid_evaluator_for_project(evaluator_id, project_id));

-- direct_input_values: 교차 프로젝트 쓰기 차단
DROP POLICY IF EXISTS "div_anon_insert" ON public.direct_input_values;
DROP POLICY IF EXISTS "div_anon_update" ON public.direct_input_values;
CREATE POLICY "div_anon_insert_v2" ON public.direct_input_values
  FOR INSERT WITH CHECK (public.is_valid_evaluator_for_project(evaluator_id, project_id));
CREATE POLICY "div_anon_update_v2" ON public.direct_input_values
  FOR UPDATE USING (public.is_valid_evaluator_for_project(evaluator_id, project_id));

-- survey_responses: 교차 프로젝트 쓰기 차단
DROP POLICY IF EXISTS "sr_anon_insert" ON public.survey_responses;
DROP POLICY IF EXISTS "sr_anon_update" ON public.survey_responses;
CREATE POLICY "sr_anon_insert_v2" ON public.survey_responses
  FOR INSERT WITH CHECK (public.is_valid_evaluator_for_project(evaluator_id, project_id));
CREATE POLICY "sr_anon_update_v2" ON public.survey_responses
  FOR UPDATE USING (public.is_valid_evaluator_for_project(evaluator_id, project_id));

-- ────────────────────────────────────────────
-- 3) user_profiles: 전체 공개 SELECT → 자기 자신만 조회
-- ────────────────────────────────────────────
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
