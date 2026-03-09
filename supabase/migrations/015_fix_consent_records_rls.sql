-- ============================================
-- 015: consent_records RLS 정책 수정
-- 1) anon INSERT 정책: 교차 프로젝트 차단 (010 패턴 적용)
-- 2) anon UPDATE 정책 추가 (upsert 시 필요, 기존 누락)
-- ============================================

-- 기존 정책 모두 제거 후 재생성
DROP POLICY IF EXISTS "cr_anon_insert" ON public.consent_records;
DROP POLICY IF EXISTS "cr_anon_insert_v2" ON public.consent_records;
CREATE POLICY "cr_anon_insert_v2" ON public.consent_records
  FOR INSERT WITH CHECK (public.is_valid_evaluator_for_project(evaluator_id, project_id));

-- anon UPDATE 정책 추가 (upsert 충돌 시 UPDATE 필요)
DROP POLICY IF EXISTS "cr_anon_update" ON public.consent_records;
DROP POLICY IF EXISTS "cr_anon_update_v2" ON public.consent_records;
CREATE POLICY "cr_anon_update_v2" ON public.consent_records
  FOR UPDATE USING (public.is_valid_evaluator_for_project(evaluator_id, project_id));
