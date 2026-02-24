import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_MODE } from '../../lib/constants';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, mode, setMode, isAdmin, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ahp_theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ahp_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const isAdminPath = location.pathname.startsWith('/admin');
  const isPreviewMode = isAdmin && mode === USER_MODE.EVALUATOR;

  const handleReturnToAdmin = () => {
    setMode(USER_MODE.ADMIN);
    navigate('/admin');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.logo} onClick={() => navigate(isAdminPath ? '/admin' : isAdmin ? '/admin' : '/eval')}>
          <span className={styles.logoText}>AHP Basic</span>
          <span className={styles.logoSub}>Decision Analysis</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? '라이트 모드' : '다크 모드'}
          >
            {darkMode ? '\u2600' : '\u263E'}
          </button>

          {user && (
            <>
              {/* Admin preview indicator — only for admins in evaluator preview mode */}
              {isPreviewMode && !isAdminPath && (
                <button className={styles.previewBadge} onClick={handleReturnToAdmin}>
                  미리보기 중 — 돌아가기
                </button>
              )}

              {/* Role badge — only for admins in admin mode */}
              {isAdmin && !isPreviewMode && (
                <span className={styles.roleBadge}>연구자</span>
              )}

              <span className={styles.userInfo}>{user.email}</span>
              <button className={styles.logoutBtn} onClick={handleSignOut}>
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
