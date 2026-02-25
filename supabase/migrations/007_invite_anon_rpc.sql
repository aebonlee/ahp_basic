-- ============================================
-- 007: 비로그인 평가자 초대 링크용 RPC 함수
-- SECURITY DEFINER로 RLS 우회하여 최소 데이터만 반환
-- ============================================

-- 1) 프로젝트 이름 조회 (초대 페이지 표시용)
CREATE OR REPLACE FUNCTION public.get_project_for_invite(p_project_id UUID)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT projects.id, projects.name
    FROM projects
    WHERE projects.id = p_project_id;
END;
$$;

-- 2) 전화번호 뒷 4자리로 평가자 검색
CREATE OR REPLACE FUNCTION public.verify_evaluator_phone(p_project_id UUID, p_phone_last4 TEXT)
RETURNS TABLE(id UUID, name TEXT, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT evaluators.id, evaluators.name, evaluators.email
    FROM evaluators
    WHERE evaluators.project_id = p_project_id
    AND evaluators.phone_number LIKE '%' || p_phone_last4;
END;
$$;

-- 3) 전화번호 인증 후 익명 사용자 ↔ 평가자 연결
--    signInAnonymously() 후 호출하여 evaluator.user_id를 설정
CREATE OR REPLACE FUNCTION public.link_evaluator_to_user(p_evaluator_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE evaluators
  SET user_id = auth.uid()
  WHERE id = p_evaluator_id;
END;
$$;
