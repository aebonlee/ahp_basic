import { useState, useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function EvaluatorGuard({ children }) {
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !id) return;

    const checkAccess = async () => {
      // 1) 프로젝트 소유자인지 확인 (관리자 테스트용)
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (project?.owner_id === user.id) {
        setAuthorized(true);
        setChecking(false);
        return;
      }

      // 2) 배정된 평가자인지 확인
      const { data: evaluators } = await supabase
        .from('evaluators')
        .select('id')
        .eq('project_id', id)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1);

      setAuthorized(evaluators && evaluators.length > 0);
      setChecking(false);
    };

    checkAccess();
  }, [authLoading, user, id]);

  if (authLoading || checking) {
    return <LoadingSpinner message="권한 확인 중..." />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/eval" replace />;
  }

  return children;
}
