export function findEvaluatorId(evaluators, user, projectId) {
  // 1. 로그인 사용자: user_id 매칭 (기존 로직)
  if (user?.id) {
    const match = evaluators.find(e => e.user_id === user.id);
    if (match) return match.id;
  }
  // 2. 전화번호 인증 사용자: sessionStorage에서 evaluatorId
  const storedId = sessionStorage.getItem(`evaluator_${projectId}`);
  if (storedId) {
    const match = evaluators.find(e => e.id === storedId);
    if (match) return match.id;
  }
  return null;
}
