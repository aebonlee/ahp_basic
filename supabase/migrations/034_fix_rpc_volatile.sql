-- 034: verify_evaluator_phone, public_verify_access 함수 STABLE → VOLATILE 수정
-- 원인: STABLE 함수는 PostgREST에서 읽기 전용 트랜잭션으로 실행됨
--       내부에서 check_rate_limit()이 INSERT/DELETE를 수행하므로
--       "cannot execute INSERT in a read-only transaction" 에러 발생

-- 1) verify_evaluator_phone — STABLE 제거 (VOLATILE이 기본값)
CREATE OR REPLACE FUNCTION public.verify_evaluator_phone(
  p_project_id UUID,
  p_phone_last4 TEXT,
  p_ip_hash TEXT DEFAULT 'unknown'
)
RETURNS TABLE(id UUID, name TEXT, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed BOOLEAN;
BEGIN
  -- 속도 제한 확인 (15분에 5회)
  SELECT check_rate_limit(p_ip_hash, p_project_id, 'phone') INTO allowed;
  IF NOT allowed THEN
    RAISE EXCEPTION 'Too many attempts. Please try again later.';
  END IF;

  RETURN QUERY
    SELECT evaluators.id, evaluators.name, evaluators.email
    FROM evaluators
    WHERE evaluators.project_id = p_project_id
    AND evaluators.phone_number LIKE '%' || p_phone_last4;
END;
$$;

-- 2) public_verify_access — STABLE 제거
CREATE OR REPLACE FUNCTION public.public_verify_access(
  p_project_id UUID,
  p_access_code TEXT,
  p_ip_hash TEXT DEFAULT 'unknown'
)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed BOOLEAN;
BEGIN
  -- 속도 제한 확인 (15분에 5회)
  SELECT check_rate_limit(p_ip_hash, p_project_id, 'access_code') INTO allowed;
  IF NOT allowed THEN
    RAISE EXCEPTION 'Too many attempts. Please try again later.';
  END IF;

  RETURN QUERY
    SELECT projects.id, projects.name
    FROM projects
    WHERE projects.id = p_project_id
      AND projects.public_access_enabled = true
      AND projects.access_code = p_access_code;
END;
$$;
