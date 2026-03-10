-- ============================================
-- 016: 평가 완료 트리거 + 평가자 자기 완료 RLS
-- ============================================
-- 문제: 평가자가 SignaturePanel에서 "평가 완료" 클릭 시
--       evaluators.completed = true 업데이트가 RLS에 의해 차단됨
--       (evaluators_owner_update 정책은 프로젝트 소유자만 허용)
-- 해결: evaluation_signatures INSERT 시 자동으로
--       evaluators.completed = true 설정하는 트리거 추가

-- 1) 트리거 함수 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION public.auto_complete_evaluator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.evaluators
  SET completed = true
  WHERE id = NEW.evaluator_id;
  RETURN NEW;
END;
$$;

-- 2) 트리거: evaluation_signatures에 INSERT 후 자동 실행
DROP TRIGGER IF EXISTS trg_auto_complete_evaluator ON public.evaluation_signatures;
CREATE TRIGGER trg_auto_complete_evaluator
  AFTER INSERT ON public.evaluation_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_complete_evaluator();
