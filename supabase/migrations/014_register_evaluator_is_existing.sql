-- ============================================
-- 014: public_register_evaluator에 is_existing 반환 추가
-- 기존 평가자 재접속 시 프론트엔드에서 확인 단계를 넣기 위해
-- ============================================

DROP FUNCTION IF EXISTS public.public_register_evaluator(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.public_register_evaluator(
  p_project_id UUID,
  p_access_code TEXT,
  p_name TEXT,
  p_phone TEXT
)
RETURNS TABLE(id UUID, name TEXT, is_existing BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_exists BOOLEAN;
  v_existing_id UUID;
  v_email TEXT;
BEGIN
  -- 비밀번호 재검증
  SELECT EXISTS(
    SELECT 1 FROM projects
    WHERE projects.id = p_project_id
      AND projects.public_access_enabled = TRUE
      AND projects.access_code = p_access_code
  ) INTO v_project_exists;

  IF NOT v_project_exists THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  -- 동일 전화번호 기존 평가자 확인
  SELECT evaluators.id INTO v_existing_id
  FROM evaluators
  WHERE evaluators.project_id = p_project_id
    AND evaluators.phone_number = p_phone;

  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY
      SELECT evaluators.id, evaluators.name, TRUE
      FROM evaluators
      WHERE evaluators.id = v_existing_id;
    RETURN;
  END IF;

  -- 새 평가자 등록
  v_email := p_phone || '@public.local';

  RETURN QUERY
    INSERT INTO evaluators (project_id, name, email, phone_number, registration_source)
    VALUES (p_project_id, p_name, v_email, p_phone, 'public')
    RETURNING evaluators.id, evaluators.name, FALSE;
END;
$$;
