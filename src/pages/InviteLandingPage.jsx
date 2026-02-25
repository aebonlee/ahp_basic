import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useSurveyConfig, useSurveyQuestions, useConsentRecords, useSurveyResponses } from '../hooks/useSurvey';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import styles from './InviteLandingPage.module.css';

export default function InviteLandingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [project, setProject] = useState(null);
  const [evaluator, setEvaluator] = useState(null);

  // 사전설문 관련 hooks
  const { config, loading: configLoading } = useSurveyConfig(token);
  const { questions, loading: questionsLoading } = useSurveyQuestions(token);
  const { hasConsented, loading: consentLoading } = useConsentRecords(token);
  const { responses, loading: responsesLoading } = useSurveyResponses(token);

  const checkInvite = useCallback(async () => {
    // Token is the project ID
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', token)
      .single();

    if (error || !data) {
      setStatus('invalid');
      return;
    }

    setProject(data);

    if (user) {
      // user_id 또는 email로 평가자 매칭
      const { data: evalData } = await supabase
        .from('evaluators')
        .select('*')
        .eq('project_id', token)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .single();

      if (evalData) {
        // user_id 미연결이면 자동 연결
        if (!evalData.user_id) {
          await supabase.from('evaluators').update({ user_id: user.id }).eq('id', evalData.id);
        }
        setEvaluator(evalData);
        setStatus('ready');
      } else {
        setStatus('not_assigned');
      }
    } else {
      setStatus('need_login');
    }
  }, [token, user]);

  useEffect(() => {
    checkInvite();
  }, [checkInvite]);

  const surveyLoading = configLoading || questionsLoading || consentLoading || responsesLoading;

  const handleStartEval = () => {
    const hasSurvey = questions.length > 0 ||
      config.research_description ||
      config.consent_text;

    if (hasSurvey && evaluator) {
      const consentDone = !config.consent_text || hasConsented(evaluator.id);
      const evalResponses = responses.filter(r => r.evaluator_id === evaluator.id);
      const surveyDone = questions.length === 0 || evalResponses.length >= questions.length;

      if (!consentDone || !surveyDone) {
        navigate(`/eval/project/${token}/pre-survey`);
        return;
      }
    }

    navigate(`/eval/project/${token}`);
  };

  if (status === 'loading') return <LoadingSpinner message="초대 확인 중..." />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.brand}>AHP Basic</h1>

        {status === 'invalid' && (
          <>
            <p className={styles.errorDesc}>유효하지 않은 초대 링크입니다.</p>
            <Button onClick={() => navigate('/login', { state: { from: location } })}>로그인</Button>
          </>
        )}

        {status === 'need_login' && (
          <>
            <h2 className={styles.projectName}>{project?.name}</h2>
            <p className={styles.desc}>평가에 참여하려면 로그인이 필요합니다.</p>
            <Button onClick={() => navigate('/login', { state: { from: location } })}>로그인</Button>
          </>
        )}

        {status === 'not_assigned' && (
          <>
            <h2 className={styles.projectName}>{project?.name}</h2>
            <p className={styles.desc}>이 프로젝트의 평가자로 배정되지 않았습니다.</p>
            <Button onClick={() => navigate('/eval')}>평가자 화면으로</Button>
          </>
        )}

        {status === 'ready' && (
          <>
            <h2 className={styles.projectName}>{project?.name}</h2>
            <p className={styles.desc}>평가에 참여할 준비가 되었습니다.</p>
            <Button onClick={handleStartEval} loading={surveyLoading}>평가 시작</Button>
          </>
        )}
      </div>
    </div>
  );
}
