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

    // 1) 평가자로 배정된 프로젝트 (user_id 또는 email 매칭)
    const { data: evaluators } = await supabase
      .from('evaluators')
      .select('id, project_id, completed, user_id')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`);

    // user_id 미연결 평가자 자동 연결
    if (evaluators) {
      for (const ev of evaluators) {
        if (!ev.user_id) {
          await supabase.from('evaluators').update({ user_id: user.id }).eq('id', ev.id);
        }
      }
    }

    // 2) 본인 소유 프로젝트도 포함 (관리자가 직접 평가 테스트 가능)
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .in('status', [PROJECT_STATUS.CREATING, PROJECT_STATUS.WAITING, PROJECT_STATUS.EVALUATING]);

    // 배정된 프로젝트 ID 목록
    const assignedIds = [...new Set((evaluators || []).map(e => e.project_id))];

    // 배정된 프로젝트 로드
    let assignedProjects = [];
    if (assignedIds.length > 0) {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .in('id', assignedIds)
        .in('status', [PROJECT_STATUS.WAITING, PROJECT_STATUS.EVALUATING]);
      assignedProjects = data || [];
    }

    // 병합 (중복 제거)
    const allMap = {};
    for (const p of assignedProjects) allMap[p.id] = p;
    for (const p of (ownedProjects || [])) allMap[p.id] = p;

    const enriched = Object.values(allMap).map(p => {
      const ev = (evaluators || []).find(e => e.project_id === p.id);
      return { ...p, completed: ev?.completed || false, hasEvaluator: !!ev };
    });

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
                  <Button onClick={async () => {
                    // 평가자 레코드 없으면 자동 생성 (소유자 직접 평가)
                    if (!p.hasEvaluator) {
                      await supabase.from('evaluators').insert({
                        project_id: p.id,
                        user_id: user.id,
                        name: user.user_metadata?.full_name || user.email,
                        email: user.email,
                      });
                    }
                    navigate(`/eval/project/${p.id}`);
                  }}>
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
