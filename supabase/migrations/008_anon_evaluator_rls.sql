-- ============================================
-- 008: 비로그인 평가자용 anon RLS 정책
-- 익명 로그인 없이 sessionStorage 기반 인증으로
-- 평가 데이터 읽기/쓰기를 허용
-- ============================================

-- 헬퍼 함수: evaluator_id가 유효한지 확인 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION public.is_valid_evaluator(eval_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM evaluators WHERE id = eval_id);
$$;

-- ============================================
-- READ 정책: 비로그인 사용자도 평가 데이터 조회 가능
-- (프로젝트 UUID가 접근 토큰 역할)
-- ============================================

-- projects: 프로젝트 정보 조회
CREATE POLICY "projects_anon_select" ON public.projects
  FOR SELECT USING (true);

-- evaluators: 평가자 목록 조회
CREATE POLICY "evaluators_anon_select" ON public.evaluators
  FOR SELECT USING (true);

-- criteria: 평가 기준 조회
CREATE POLICY "criteria_anon_select" ON public.criteria
  FOR SELECT USING (true);

-- alternatives: 대안 조회
CREATE POLICY "alternatives_anon_select" ON public.alternatives
  FOR SELECT USING (true);

-- survey_questions: 설문 문항 조회
CREATE POLICY "sq_anon_select" ON public.survey_questions
  FOR SELECT USING (true);

-- ============================================
-- READ/WRITE 정책: evaluator_id 유효성 검증 후 허용
-- ============================================

-- pairwise_comparisons: 비교 데이터 CRUD
CREATE POLICY "comparisons_anon_select" ON public.pairwise_comparisons
  FOR SELECT USING (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "comparisons_anon_insert" ON public.pairwise_comparisons
  FOR INSERT WITH CHECK (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "comparisons_anon_update" ON public.pairwise_comparisons
  FOR UPDATE USING (public.is_valid_evaluator(evaluator_id));

-- survey_responses: 설문 응답 CRUD
CREATE POLICY "sr_anon_select" ON public.survey_responses
  FOR SELECT USING (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "sr_anon_insert" ON public.survey_responses
  FOR INSERT WITH CHECK (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "sr_anon_update" ON public.survey_responses
  FOR UPDATE USING (public.is_valid_evaluator(evaluator_id));

-- consent_records: 동의 기록 CRUD
CREATE POLICY "cr_anon_select" ON public.consent_records
  FOR SELECT USING (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "cr_anon_insert" ON public.consent_records
  FOR INSERT WITH CHECK (public.is_valid_evaluator(evaluator_id));

-- direct_input_values: 직접입력 CRUD
CREATE POLICY "div_anon_select" ON public.direct_input_values
  FOR SELECT USING (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "div_anon_insert" ON public.direct_input_values
  FOR INSERT WITH CHECK (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "div_anon_update" ON public.direct_input_values
  FOR UPDATE USING (public.is_valid_evaluator(evaluator_id));

-- evaluation_signatures: 서명 CRUD
CREATE POLICY "sig_anon_select" ON public.evaluation_signatures
  FOR SELECT USING (public.is_valid_evaluator(evaluator_id));

CREATE POLICY "sig_anon_insert" ON public.evaluation_signatures
  FOR INSERT WITH CHECK (public.is_valid_evaluator(evaluator_id));
