import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import PageLayout from '../components/layout/PageLayout';
import BrainstormingBoard from '../components/brainstorming/BrainstormingBoard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BrainstormingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading } = useProject(id);

  if (loading) return <PageLayout><LoadingSpinner message="로딩 중..." /></PageLayout>;
  if (!currentProject) return <PageLayout><p>프로젝트를 찾을 수 없습니다.</p></PageLayout>;

  return (
    <PageLayout wide>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(`/admin/project/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
          &larr; 모델 구축으로
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{currentProject.name} - 브레인스토밍</h1>
      </div>
      <BrainstormingBoard projectId={id} />
    </PageLayout>
  );
}
