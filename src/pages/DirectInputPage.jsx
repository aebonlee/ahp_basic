import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvaluation } from '../contexts/EvaluationContext';
import { useAuth } from '../hooks/useAuth';
import { buildPageSequence } from '../lib/pairwiseUtils';
import PageLayout from '../components/layout/PageLayout';
import DirectInputPanel from '../components/evaluation/DirectInputPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

export default function DirectInputPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { criteria, alternatives, loading, loadProjectData } = useEvaluation();

  useEffect(() => {
    loadProjectData(id);
  }, [id, loadProjectData]);

  const pages = useMemo(
    () => buildPageSequence(criteria, alternatives),
    [criteria, alternatives]
  );

  if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>직접입력 평가</h1>
      {pages.map(page => (
        <div key={page.parentId} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{page.parentName}</h3>
          <DirectInputPanel
            projectId={id}
            evaluatorId={user?.id}
            criterionId={page.parentId}
            items={page.items}
          />
        </div>
      ))}
      <Button onClick={() => navigate(`/eval/project/${id}/result`)}>결과 보기</Button>
    </PageLayout>
  );
}
