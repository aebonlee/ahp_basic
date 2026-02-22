-- ============================================
-- 003: projects 테이블 RLS 정책 수정
-- FOR ALL → 개별 정책 분리 (INSERT 명시)
-- ============================================

-- 기존 정책 제거
DROP POLICY IF EXISTS "projects_owner_all" ON public.projects;

-- 개별 정책 생성
CREATE POLICY "projects_owner_select" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "projects_owner_insert" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_owner_update" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "projects_owner_delete" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);
