import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import PageLayout from '../components/layout/PageLayout';
import BrainstormingBoard from '../components/brainstorming/BrainstormingBoard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import common from '../styles/common.module.css';
import styles from './BrainstormingPage.module.css';

export default function BrainstormingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading } = useProject(id);

  if (loading) return <PageLayout><LoadingSpinner message="로딩 중..." /></PageLayout>;
  if (!currentProject) return <PageLayout><p>프로젝트를 찾을 수 없습니다.</p></PageLayout>;

  return (
    <PageLayout wide>
      <div className={styles.topBar}>
        <button onClick={() => navigate(`/admin/project/${id}`)} className={common.backBtn}>
          &larr; 모델 구축으로
        </button>
        <h1 className={common.pageTitle}>{currentProject.name} - 브레인스토밍</h1>
      </div>
      <BrainstormingBoard projectId={id} />
    </PageLayout>
  );
}
