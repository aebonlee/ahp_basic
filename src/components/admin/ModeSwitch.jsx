import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_MODE } from '../../lib/constants';
import styles from './ModeSwitch.module.css';

export default function ModeSwitch() {
  const navigate = useNavigate();
  const { mode, setMode } = useAuth();

  const handleSwitch = (newMode) => {
    setMode(newMode);
    navigate(newMode === USER_MODE.ADMIN ? '/admin' : '/eval');
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>현재: {mode === USER_MODE.ADMIN ? '관리자' : '평가자'} MODE</span>
      <button
        className={styles.switchBtn}
        onClick={() => handleSwitch(mode === USER_MODE.ADMIN ? USER_MODE.EVALUATOR : USER_MODE.ADMIN)}
      >
        {mode === USER_MODE.ADMIN ? '평가자' : '관리자'} MODE로 이동
      </button>
    </div>
  );
}
