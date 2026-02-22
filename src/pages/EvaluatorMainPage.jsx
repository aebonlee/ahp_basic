import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { PROJECT_STATUS, PROJECT_STATUS_LABELS, EVAL_METHOD_LABELS } from '../lib/constants';
import PageLayout from '../components/layout/PageLayout';
import ModeSwitch from '../components/admin/ModeSwitch';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import styles from './EvaluatorMainPage.module.css';

export default function EvaluatorMainPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedProjects();
  }, [user]);

  const loadAssignedProjects = async () => {
    if (!user) return;
    const { data: evaluators } = await supabase
      .from('evaluators')
      .select('project_id, completed')
      .eq('user_id', user.id);

    if (!evaluators || evaluators.length === 0) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectIds = evaluators.map(e => e.project_id);
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .eq('status', PROJECT_STATUS.EVALUATING);

    const enriched = (projectData || []).map(p => ({
      ...p,
      completed: evaluators.find(e => e.project_id === p.id)?.completed || false,
    }));

    setProjects(enriched);
    setLoading(false);
  };

  return (
    <PageLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>평가자 화면</h1>
        <ModeSwitch />
      </div>

      {loading ? (
        <LoadingSpinner message="프로젝트 로딩 중..." />
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <p>배정된 평가 프로젝트가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.projectList}>
          {projects.map(p => (
            <div key={p.id} className={styles.projectCard}>
              <div className={styles.projectInfo}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <span className={styles.method}>{EVAL_METHOD_LABELS[p.eval_method]}</span>
              </div>
              <div className={styles.projectAction}>
                {p.completed ? (
                  <Button variant="secondary" onClick={() => navigate(`/eval/project/${p.id}/result`)}>
                    결과 보기
                  </Button>
                ) : (
                  <Button onClick={() => navigate(`/eval/project/${p.id}`)}>
                    평가하기
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
