-- 011: 가입 사이트 추적 (signup_domain + visited_sites)
-- 공유 Supabase DB에서 실행 — 하위 사이트(ahp-basic, books, competency)의
-- 가입/로그인 도메인 정보를 www.dreamitbiz.com 회원관리에 전달

-- 1) user_profiles에 컬럼 추가 (이미 존재하면 무시)
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN signup_domain TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN visited_sites TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2) check_user_status RPC 함수
--    - signup_domain 미설정 시 현재 도메인으로 설정
--    - visited_sites에 현재 도메인 추가 (중복 방지)
CREATE OR REPLACE FUNCTION public.check_user_status(
  target_user_id UUID,
  current_domain TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- user_profiles 레코드가 없으면 무시 (트리거가 아직 안 돌았을 수 있음)
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = target_user_id) THEN
    RETURN;
  END IF;

  -- signup_domain이 비어있으면 현재 도메인으로 설정
  UPDATE user_profiles
  SET signup_domain = current_domain
  WHERE id = target_user_id
    AND (signup_domain IS NULL OR signup_domain = '');

  -- visited_sites에 현재 도메인 추가 (중복 방지)
  UPDATE user_profiles
  SET visited_sites = array_append(visited_sites, current_domain)
  WHERE id = target_user_id
    AND NOT (visited_sites @> ARRAY[current_domain]);
END;
$$;

-- 3) handle_new_user 트리거 업데이트 — signup_domain도 저장
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url, provider, signup_domain)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'signup_domain', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) sa_list_users에 signup_domain, visited_sites 포함하도록 업데이트
CREATE OR REPLACE FUNCTION public.sa_list_users()
RETURNS TABLE(
  id UUID, email TEXT, created_at TIMESTAMPTZ,
  role TEXT, display_name TEXT,
  signup_domain TEXT, visited_sites TEXT[]
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  PERFORM assert_superadmin();
  RETURN QUERY
    SELECT u.id, u.email::TEXT, u.created_at,
           coalesce(p.role,'user') AS role,
           coalesce(p.display_name,'') AS display_name,
           coalesce(p.signup_domain,'') AS signup_domain,
           coalesce(p.visited_sites, '{}') AS visited_sites
    FROM auth.users u
    LEFT JOIN user_profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END; $$;
