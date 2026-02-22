-- ============================================
-- direct_input_values 테이블 추가 (이미 배포된 DB용)
-- ============================================

CREATE TABLE IF NOT EXISTS public.direct_input_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.evaluators(id) ON DELETE CASCADE,
  criterion_id UUID,
  item_id UUID NOT NULL,
  value FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, evaluator_id, criterion_id, item_id)
);

ALTER TABLE public.direct_input_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "direct_input_evaluator_crud" ON public.direct_input_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.evaluators
      WHERE evaluators.id = direct_input_values.evaluator_id
      AND evaluators.user_id = auth.uid()
    )
  );

CREATE POLICY "direct_input_owner_select" ON public.direct_input_values
  FOR SELECT USING (public.is_project_owner(project_id));
