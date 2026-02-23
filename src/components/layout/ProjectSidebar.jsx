import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './ProjectSidebar.module.css';

const STEPS = [
  { key: 'model',       path: '',             label: '모델 구축',     icon: '🏗', step: 1 },
  { key: 'brain',       path: '/brain',       label: '브레인스토밍',  icon: '💡', step: 2 },
  { key: 'confirm',     path: '/confirm',     label: '모델 확정',     icon: '✓',  step: 3 },
  { key: 'eval',        path: '/eval',        label: '평가자 관리',   icon: '👥', step: 4 },
  { key: 'workshop',    path: '/workshop',    label: '실시간 워크숍', icon: '📊', step: 5 },
  { key: 'result',      path: '/result',      label: '집계 결과',     icon: '📈', step: 6 },
  { key: 'sensitivity', path: '/sensitivity', label: '민감도 분석',   icon: '🔍', step: 7 },
  { key: 'resource',    path: '/resource',    label: '자원 배분',     icon: '💰', step: 8 },
];

export default function ProjectSidebar({ projectName }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = `/admin/project/${id}`;

  const currentPath = location.pathname;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.projectName} onClick={() => navigate('/admin')} title="프로젝트 목록으로">
        <span className={styles.backArrow}>&larr;</span>
        <span className={styles.name}>{projectName || '프로젝트'}</span>
      </div>
      <nav className={styles.nav}>
        {STEPS.map((s) => {
          const fullPath = basePath + s.path;
          const isActive = currentPath === fullPath;
          return (
            <button
              key={s.key}
              className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(fullPath)}
            >
              <span className={styles.stepNum}>{s.step}</span>
              <span className={styles.menuLabel}>{s.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
