-- =============================================
-- 036: 마켓플레이스 프로젝트 직접 등록 지원
-- get_project_for_invite에 recruit_evaluators 반환 추가
-- marketplace_register_evaluator RPC 생성
-- =============================================

-- 1) get_project_for_invite 확장 — recruit_evaluators, recruit_description 반환
DROP FUNCTION IF EXISTS public.get_project_for_invite(UUID);
CREATE FUNCTION public.get_project_for_invite(p_project_id UUID)
RETURNS TABLE(id UUID, name TEXT, public_access_enabled BOOLEAN, recruit_evaluators BOOLEAN, recruit_description TEXT)
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT projects.id, projects.name, projects.public_access_enabled,
           projects.recruit_evaluators, projects.recruit_description
    FROM projects
    WHERE projects.id = p_project_id;
END;
$$;

-- 2) marketplace_register_evaluator — 마켓플레이스 비로그인 자가 등록 (비밀번호 불필요)
CREATE OR REPLACE FUNCTION public.marketplace_register_evaluator(
  p_project_id UUID,
  p_name TEXT,
  p_phone TEXT
)
RETURNS TABLE(id UUID, name TEXT, is_existing BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_existing_id UUID;
  v_email TEXT;
BEGIN
  -- 프로젝트 확인: 마켓플레이스 모집 중인지
  SELECT * INTO v_project FROM projects
  WHERE projects.id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '프로젝트를 찾을 수 없습니다.';
  END IF;

  IF v_project.recruit_evaluators = FALSE OR v_project.status <> 1 THEN
    RAISE EXCEPTION '현재 모집 중이 아닙니다.';
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
  v_email := p_phone || '@marketplace.local';

  RETURN QUERY
    INSERT INTO evaluators (project_id, name, email, phone_number, registration_source)
    VALUES (p_project_id, p_name, v_email, p_phone, 'public')
    RETURNING evaluators.id, evaluators.name, FALSE;
END;
$$;
