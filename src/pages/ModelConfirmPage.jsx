import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useCriteria } from '../hooks/useCriteria';
import { useAlternatives } from '../hooks/useAlternatives';
import { useProjects } from '../contexts/ProjectContext';
import { PROJECT_STATUS } from '../lib/constants';
import PageLayout from '../components/layout/PageLayout';
import ModelPreview from '../components/model/ModelPreview';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useState } from 'react';

export default function ModelConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading } = useProject(id);
  const { criteria, getTree } = useCriteria(id);
  const { alternatives } = useAlternatives(id);
  const { updateProject } = useProjects();
  const [confirming, setConfirming] = useState(false);

  if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;
  if (!currentProject) return <PageLayout><p>프로젝트를 찾을 수 없습니다.</p></PageLayout>;

  const criteriaTree = getTree();
  const canConfirm = criteria.length >= 2 && alternatives.length >= 2;

  const handleConfirm = async () => {
    if (!canConfirm) {
      alert('기준 2개 이상, 대안 2개 이상이 필요합니다.');
      return;
    }
    if (!window.confirm('모델을 확정하시겠습니까? 확정 후 기준/대안 수정이 제한됩니다.')) return;
    setConfirming(true);
    try {
      await updateProject(id, { status: PROJECT_STATUS.WAITING });
      navigate(`/admin/project/${id}/eval`);
    } catch (err) {
      alert('확정 실패: ' + err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <PageLayout>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(`/admin/project/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
          &larr; 모델 구축으로
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{currentProject.name} - 모델 확정</h1>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>모델 구조 검토</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: 16 }}>
          기준: {criteria.length}개 | 대안: {alternatives.filter(a => !a.parent_id).length}개
        </p>

        <ModelPreview
          projectName={currentProject.name}
          criteriaTree={criteriaTree}
          alternatives={alternatives}
          onClose={() => {}}
        />

        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate(`/admin/project/${id}`)}>
            모델 수정
          </Button>
          <Button
            variant="success"
            loading={confirming}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            모델 확정
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
