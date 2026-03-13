-- ============================================
-- 027: 로그인된 평가자 자기 레코드 접근 RLS 정책
--
-- 배경:
--   010에서 evaluators_anon_select USING(true) 제거 후
--   로그인된 평가자(프로젝트 소유자 아닌)가 evaluators 테이블을
--   읽을 수 없어 설문/평가 플로우가 차단됨.
--
-- 수정:
--   1) evaluators_self_select: user_id 또는 이메일로 자기 레코드 조회
--   2) evaluators_self_update: 첫 로그인 시 user_id 자동 연결
-- ============================================

-- 1) SELECT: 로그인된 평가자가 자기 레코드를 조회
--    - user_id가 이미 연결된 경우: user_id = auth.uid()
--    - 첫 로그인(user_id 미설정): 이메일 매칭
DROP POLICY IF EXISTS "evaluators_self_select" ON public.evaluators;
CREATE POLICY "evaluators_self_select" ON public.evaluators
  FOR SELECT USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
  );

-- 2) UPDATE: 로그인된 평가자가 자기 레코드의 user_id를 연결
--    USING: 본인 레코드만 대상 (user_id 매칭 또는 이메일 매칭)
--    WITH CHECK: user_id는 반드시 자기 자신의 auth.uid()
DROP POLICY IF EXISTS "evaluators_self_update" ON public.evaluators;
CREATE POLICY "evaluators_self_update" ON public.evaluators
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    user_id = auth.uid()
  );
