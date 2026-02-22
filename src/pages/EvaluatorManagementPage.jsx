import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useEvaluators } from '../hooks/useEvaluators';
import { useProjects } from '../contexts/ProjectContext';
import { PROJECT_STATUS } from '../lib/constants';
import PageLayout from '../components/layout/PageLayout';
import ParticipantForm from '../components/admin/ParticipantForm';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EvaluatorManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projLoading } = useProject(id);
  const { evaluators, loading: evalLoading, addEvaluator, deleteEvaluator } = useEvaluators(id);
  const { updateProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [starting, setStarting] = useState(false);

  if (projLoading || evalLoading) return <PageLayout><LoadingSpinner /></PageLayout>;
  if (!currentProject) return <PageLayout><p>프로젝트를 찾을 수 없습니다.</p></PageLayout>;

  const inviteUrl = `${window.location.origin}${window.location.pathname}#/eval/invite/${id}`;

  const handleCopyLink = (evalId) => {
    const url = `${inviteUrl}?eval=${evalId}`;
    navigator.clipboard.writeText(url);
    alert('초대 링크가 복사되었습니다.');
  };

  const handleStartEvaluation = async () => {
    if (evaluators.length === 0) {
      alert('평가자를 1명 이상 추가해주세요.');
      return;
    }
    if (!window.confirm('평가를 시작하시겠습니까?')) return;
    setStarting(true);
    try {
      await updateProject(id, { status: PROJECT_STATUS.EVALUATING });
      alert('평가가 시작되었습니다.');
    } catch (err) {
      alert('시작 실패: ' + err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <PageLayout>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(`/admin/project/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
          &larr; 모델 구축으로
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{currentProject.name} - 평가자 관리</h1>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem' }}>평가자 목록 ({evaluators.length}명)</h2>
          <Button size="sm" onClick={() => setShowForm(true)}>+ 평가자 추가</Button>
        </div>

        {showForm && (
          <ParticipantForm
            onSave={async (data) => {
              await addEvaluator(data);
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        )}

        {evaluators.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24, fontSize: '0.85rem' }}>
            평가자를 추가해주세요.
          </p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border)' }}>이름</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border)' }}>이메일</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border)' }}>상태</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border)' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {evaluators.map(ev => (
                <tr key={ev.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>{ev.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>{ev.email}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    {ev.completed ? '완료' : '미완료'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <button onClick={() => handleCopyLink(ev.id)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>
                      링크 복사
                    </button>
                    <button onClick={() => { if (window.confirm('삭제하시겠습니까?')) deleteEvaluator(ev.id); }} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 8 }}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <Button variant="secondary" onClick={() => navigate(`/admin/project/${id}/confirm`)}>
          모델 확정으로
        </Button>
        <Button variant="success" loading={starting} onClick={handleStartEvaluation}>
          평가 시작
        </Button>
      </div>
    </PageLayout>
  );
}
