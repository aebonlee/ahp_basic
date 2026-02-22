import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { PROJECT_STATUS } from '../../lib/constants';
import Button from '../common/Button';

const TRANSITIONS = {
  [PROJECT_STATUS.CREATING]: { next: PROJECT_STATUS.WAITING, label: '모델 확정', variant: 'primary' },
  [PROJECT_STATUS.WAITING]: { next: PROJECT_STATUS.EVALUATING, label: '평가 시작', variant: 'success' },
  [PROJECT_STATUS.EVALUATING]: { next: PROJECT_STATUS.COMPLETED, label: '평가 완료', variant: 'primary' },
};

export default function StateTransitionButton({ project }) {
  const navigate = useNavigate();
  const { updateProject } = useProjects();
  const [loading, setLoading] = useState(false);

  const transition = TRANSITIONS[project.status];
  if (!transition) return null;

  const handleTransition = async () => {
    const confirmMsg = `프로젝트를 "${transition.label}" 상태로 변경하시겠습니까?`;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await updateProject(project.id, { status: transition.next });
      if (transition.next === PROJECT_STATUS.WAITING) {
        navigate(`/admin/project/${project.id}/confirm`);
      }
    } catch (err) {
      alert('상태 변경 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={transition.variant}
      size="sm"
      loading={loading}
      onClick={handleTransition}
    >
      {transition.label}
    </Button>
  );
}
