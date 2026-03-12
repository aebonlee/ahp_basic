-- ============================================================
-- 특정 프로젝트 평가자 "완료 상태" 초기화 스크립트
-- ============================================================
-- 용도: 평가자들이 다시 접속하여 기존 응답을 확인하고
--       "평가 완료" 버튼을 다시 누를 수 있도록 완료 상태만 해제
--
-- 초기화 범위 (기존 데이터는 보존):
--   - evaluation_signatures 삭제 (서명 기록)
--   - evaluators.completed = FALSE (완료 플래그 해제)
--
-- 보존되는 데이터:
--   - consent_records (동의 기록)
--   - survey_responses (설문 응답)
--   - pairwise_comparisons (쌍대비교 결과)
--   - direct_input_values (직접입력 값)
--
-- 사용법: Supabase SQL Editor에서 실행
-- ============================================================

DO $$
DECLARE
  v_project_id UUID;
  v_project_name TEXT := '생성형 AI 활용 수업에서 교수자의 AI 교수역량 우선순위 분석';
  v_sig_count INT;
  v_eval_count INT;
BEGIN
  -- 1) 프로젝트 ID 조회
  SELECT id INTO v_project_id
  FROM public.projects
  WHERE name = v_project_name;

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION '프로젝트를 찾을 수 없습니다: %', v_project_name;
  END IF;

  RAISE NOTICE '프로젝트 발견: % (ID: %)', v_project_name, v_project_id;

  -- 2) 서명(완료 기록) 삭제
  DELETE FROM public.evaluation_signatures
  WHERE project_id = v_project_id;

  GET DIAGNOSTICS v_sig_count = ROW_COUNT;
  RAISE NOTICE '삭제된 서명 수: %', v_sig_count;

  -- 3) 평가자 completed 플래그 해제
  UPDATE public.evaluators
  SET completed = FALSE
  WHERE project_id = v_project_id
    AND completed = TRUE;

  GET DIAGNOSTICS v_eval_count = ROW_COUNT;
  RAISE NOTICE '초기화된 평가자 수: %', v_eval_count;

  RAISE NOTICE '완료! 평가자들이 다시 접속하면 기존 응답을 확인하고 "평가 완료"를 다시 누를 수 있습니다.';
END;
$$;
