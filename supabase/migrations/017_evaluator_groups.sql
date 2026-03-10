-- 평가자 그룹 테이블 (선택한 평가자 조합을 이름 붙여 저장)
CREATE TABLE IF NOT EXISTS public.evaluator_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  evaluator_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- RLS
ALTER TABLE public.evaluator_groups ENABLE ROW LEVEL SECURITY;

-- 프로젝트 소유자만 CRUD
CREATE POLICY "evaluator_groups_select" ON public.evaluator_groups
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "evaluator_groups_insert" ON public.evaluator_groups
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "evaluator_groups_update" ON public.evaluator_groups
  FOR UPDATE USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "evaluator_groups_delete" ON public.evaluator_groups
  FOR DELETE USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_evaluator_groups_project ON public.evaluator_groups(project_id);
