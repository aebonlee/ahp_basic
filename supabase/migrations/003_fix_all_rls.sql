-- ============================================
-- 003: 전체 RLS 정책 수정
-- FOR ALL USING → 개별 정책 분리 (INSERT에 WITH CHECK 명시)
-- 라이브 DB에서 실행: Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. criteria 테이블
-- ============================================
DROP POLICY IF EXISTS "criteria_project_owner" ON public.criteria;

CREATE POLICY "criteria_owner_select" ON public.criteria
  FOR SELECT USING (public.is_project_owner(project_id));

CREATE POLICY "criteria_owner_insert" ON public.criteria
  FOR INSERT WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "criteria_owner_update" ON public.criteria
  FOR UPDATE USING (public.is_project_owner(project_id));

CREATE POLICY "criteria_owner_delete" ON public.criteria
  FOR DELETE USING (public.is_project_owner(project_id));

-- ============================================
-- 2. alternatives 테이블
-- ============================================
DROP POLICY IF EXISTS "alternatives_project_owner" ON public.alternatives;

CREATE POLICY "alternatives_owner_select" ON public.alternatives
  FOR SELECT USING (public.is_project_owner(project_id));

CREATE POLICY "alternatives_owner_insert" ON public.alternatives
  FOR INSERT WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "alternatives_owner_update" ON public.alternatives
  FOR UPDATE USING (public.is_project_owner(project_id));

CREATE POLICY "alternatives_owner_delete" ON public.alternatives
  FOR DELETE USING (public.is_project_owner(project_id));

-- ============================================
-- 3. evaluators 테이블
-- ============================================
DROP POLICY IF EXISTS "evaluators_project_owner" ON public.evaluators;

CREATE POLICY "evaluators_owner_select" ON public.evaluators
  FOR SELECT USING (public.is_project_owner(project_id));

CREATE POLICY "evaluators_owner_insert" ON public.evaluators
  FOR INSERT WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "evaluators_owner_update" ON public.evaluators
  FOR UPDATE USING (public.is_project_owner(project_id));

CREATE POLICY "evaluators_owner_delete" ON public.evaluators
  FOR DELETE USING (public.is_project_owner(project_id));

-- ============================================
-- 4. brainstorming_items 테이블
-- ============================================
DROP POLICY IF EXISTS "brainstorming_project_owner" ON public.brainstorming_items;

CREATE POLICY "brainstorming_owner_select" ON public.brainstorming_items
  FOR SELECT USING (public.is_project_owner(project_id));

CREATE POLICY "brainstorming_owner_insert" ON public.brainstorming_items
  FOR INSERT WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "brainstorming_owner_update" ON public.brainstorming_items
  FOR UPDATE USING (public.is_project_owner(project_id));

CREATE POLICY "brainstorming_owner_delete" ON public.brainstorming_items
  FOR DELETE USING (public.is_project_owner(project_id));
