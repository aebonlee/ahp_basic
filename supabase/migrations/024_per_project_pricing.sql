-- =============================================
-- Per-Project Pricing Migration
-- 월 구독 → 프로젝트 단위 이용권 전환
-- =============================================

-- 1) project_plans 테이블
CREATE TABLE IF NOT EXISTS project_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  plan_type     TEXT NOT NULL CHECK (plan_type IN ('free','plan_30','plan_50','plan_100')),
  max_evaluators INT NOT NULL,
  sms_quota     INT NOT NULL,
  sms_used      INT NOT NULL DEFAULT 0,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  status        TEXT NOT NULL CHECK (status IN ('unassigned','active','expired')) DEFAULT 'unassigned',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_project_plans_user_id ON project_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_project_plans_project_id ON project_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_project_plans_user_status ON project_plans(user_id, status);

-- RLS
ALTER TABLE project_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON project_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON project_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON project_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 2) RPC Functions
-- =============================================

-- 2-1) activate_project_plan: 결제 후 unassigned 이용권 생성
CREATE OR REPLACE FUNCTION activate_project_plan(
  p_user_id  UUID,
  p_plan_type TEXT,
  p_order_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_eval INT;
  v_sms_quota INT;
  v_plan_id UUID;
BEGIN
  -- 플랜별 제한 설정
  CASE p_plan_type
    WHEN 'plan_30' THEN v_max_eval := 30;  v_sms_quota := 60;
    WHEN 'plan_50' THEN v_max_eval := 50;  v_sms_quota := 100;
    WHEN 'plan_100' THEN v_max_eval := 100; v_sms_quota := 200;
    ELSE RAISE EXCEPTION 'Invalid plan type: %', p_plan_type;
  END CASE;

  INSERT INTO project_plans (user_id, plan_type, max_evaluators, sms_quota, order_id, status)
  VALUES (p_user_id, p_plan_type, v_max_eval, v_sms_quota, p_order_id, 'unassigned')
  RETURNING id INTO v_plan_id;

  RETURN v_plan_id;
END;
$$;

-- 2-2) assign_plan_to_project: 이용권 → 프로젝트 배정 + 30일 타이머
CREATE OR REPLACE FUNCTION assign_plan_to_project(
  p_plan_id    UUID,
  p_project_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
BEGIN
  SELECT status, user_id INTO v_status, v_user_id
  FROM project_plans WHERE id = p_plan_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;

  IF v_status != 'unassigned' THEN
    RAISE EXCEPTION 'Plan is already assigned or expired';
  END IF;

  -- 본인 소유 확인
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE project_plans
  SET project_id  = p_project_id,
      assigned_at = NOW(),
      expires_at  = NOW() + INTERVAL '30 days',
      status      = 'active'
  WHERE id = p_plan_id;
END;
$$;

-- 2-3) get_project_plan: 프로젝트의 활성 플랜 조회 + 만료 자동 처리
CREATE OR REPLACE FUNCTION get_project_plan(p_project_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan project_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_plan
  FROM project_plans
  WHERE project_id = p_project_id
    AND status IN ('active', 'expired')
  ORDER BY assigned_at DESC
  LIMIT 1;

  IF v_plan.id IS NULL THEN
    -- free 플랜 확인
    SELECT * INTO v_plan
    FROM project_plans
    WHERE project_id = p_project_id
      AND plan_type = 'free'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_plan.id IS NULL THEN
      RETURN NULL;
    END IF;
  END IF;

  -- 만료 자동 처리 (유료 플랜만)
  IF v_plan.plan_type != 'free'
     AND v_plan.expires_at IS NOT NULL
     AND v_plan.expires_at <= NOW()
     AND v_plan.status = 'active' THEN
    UPDATE project_plans SET status = 'expired' WHERE id = v_plan.id;
    v_plan.status := 'expired';
  END IF;

  RETURN json_build_object(
    'id', v_plan.id,
    'user_id', v_plan.user_id,
    'project_id', v_plan.project_id,
    'plan_type', v_plan.plan_type,
    'max_evaluators', v_plan.max_evaluators,
    'sms_quota', v_plan.sms_quota,
    'sms_used', v_plan.sms_used,
    'order_id', v_plan.order_id,
    'purchased_at', v_plan.purchased_at,
    'assigned_at', v_plan.assigned_at,
    'expires_at', v_plan.expires_at,
    'status', v_plan.status
  );
END;
$$;

-- 2-4) get_user_plans: 사용자의 전체 플랜 목록
CREATE OR REPLACE FUNCTION get_user_plans(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plans JSON;
BEGIN
  -- 만료 자동 처리
  UPDATE project_plans
  SET status = 'expired'
  WHERE user_id = p_user_id
    AND status = 'active'
    AND plan_type != 'free'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  SELECT json_agg(row_to_json(pp))
  INTO v_plans
  FROM (
    SELECT id, user_id, project_id, plan_type, max_evaluators,
           sms_quota, sms_used, order_id, purchased_at,
           assigned_at, expires_at, status
    FROM project_plans
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
  ) pp;

  RETURN COALESCE(v_plans, '[]'::JSON);
END;
$$;

-- 2-5) increment_sms_used: SMS 사용량 증가 + 할당량 초과 검사
CREATE OR REPLACE FUNCTION increment_sms_used(
  p_project_id UUID,
  p_count      INT DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan project_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_plan
  FROM project_plans
  WHERE project_id = p_project_id
    AND status = 'active'
  ORDER BY assigned_at DESC
  LIMIT 1;

  IF v_plan.id IS NULL THEN
    -- free 플랜 확인
    SELECT * INTO v_plan
    FROM project_plans
    WHERE project_id = p_project_id
      AND plan_type = 'free'
    LIMIT 1;
  END IF;

  IF v_plan.id IS NULL THEN
    RAISE EXCEPTION 'No active plan for this project';
  END IF;

  IF (v_plan.sms_used + p_count) > v_plan.sms_quota THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SMS quota exceeded',
      'sms_used', v_plan.sms_used,
      'sms_quota', v_plan.sms_quota
    );
  END IF;

  UPDATE project_plans
  SET sms_used = sms_used + p_count
  WHERE id = v_plan.id;

  RETURN json_build_object(
    'success', true,
    'sms_used', v_plan.sms_used + p_count,
    'sms_quota', v_plan.sms_quota
  );
END;
$$;

-- 2-6) grant_free_plan: 무료 플랜 1회 자동 부여
CREATE OR REPLACE FUNCTION grant_free_plan(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing UUID;
  v_plan_id UUID;
BEGIN
  -- 이미 free 플랜 보유 확인
  SELECT id INTO v_existing
  FROM project_plans
  WHERE user_id = p_user_id
    AND plan_type = 'free'
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  INSERT INTO project_plans (
    user_id, plan_type, max_evaluators, sms_quota, status, assigned_at, expires_at
  )
  VALUES (
    p_user_id, 'free', 1, 1, 'unassigned', NULL, NULL
  )
  RETURNING id INTO v_plan_id;

  RETURN v_plan_id;
END;
$$;

-- =============================================
-- 3) 기존 RPC 제거
-- =============================================
DROP FUNCTION IF EXISTS activate_subscription(UUID, TEXT);
DROP FUNCTION IF EXISTS check_plan_expiry(UUID);
DROP FUNCTION IF EXISTS grant_trial(UUID, INT);
