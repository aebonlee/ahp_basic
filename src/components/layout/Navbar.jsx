import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_MODE } from '../../lib/constants';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, mode, setMode, signOut } = useAuth();

  const isAdmin = location.pathname.startsWith('/admin');

  const handleModeSwitch = () => {
    const newMode = mode === USER_MODE.ADMIN ? USER_MODE.EVALUATOR : USER_MODE.ADMIN;
    setMode(newMode);
    navigate(newMode === USER_MODE.ADMIN ? '/admin' : '/eval');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.logo} onClick={() => navigate(isAdmin ? '/admin' : '/eval')}>
          <span className={styles.logoText}>AHP Basic</span>
          <span className={styles.logoSub}>Decision Analysis</span>
        </div>

        {user && (
          <div className={styles.actions}>
            <button
              className={styles.modeBtn}
              onClick={handleModeSwitch}
              title={`${mode === USER_MODE.ADMIN ? '평가자' : '관리자'} 모드로 전환`}
            >
              {mode === USER_MODE.ADMIN ? '관리자' : '평가자'} MODE
            </button>
            <span className={styles.userInfo}>{user.email}</span>
            <button className={styles.logoutBtn} onClick={handleSignOut}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
