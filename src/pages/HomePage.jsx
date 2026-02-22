import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>AHP Basic</div>
          <div className={styles.headerActions}>
            {isLoggedIn ? (
              <Button onClick={() => navigate('/admin')}>대시보드</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => navigate('/login')}>로그인</Button>
                <Button onClick={() => navigate('/register')}>회원가입</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          AHP 의사결정 분석<br />
          <span>쉽고 빠르게</span>
        </h1>
        <p className={styles.heroDesc}>
          다기준 의사결정 문제를 체계적으로 분석하는 AHP(Analytic Hierarchy Process) 도구입니다.<br />
          기준 설정부터 쌍대비교, 결과 분석까지 한 곳에서 진행하세요.
        </p>
        <div className={styles.heroCta}>
          {isLoggedIn ? (
            <Button size="lg" onClick={() => navigate('/admin')}>대시보드로 이동</Button>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/register')}>무료로 시작하기</Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>로그인</Button>
            </>
          )}
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>주요 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>계층 모델 구축</h3>
            <p>기준과 대안을 트리 구조로 구성하여 의사결정 모델을 직관적으로 설계합니다.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚖️</div>
            <h3>쌍대비교 평가</h3>
            <p>17점 척도의 쌍대비교 그리드로 정밀한 평가를 수행합니다. 실시간 CR 계산 및 Best-fit 추천을 제공합니다.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3>다수 평가자 지원</h3>
            <p>여러 평가자를 초대하여 평가를 진행하고, 가중 기하평균으로 결과를 집계합니다.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3>결과 분석</h3>
            <p>종합중요도, 민감도 분석, Excel 내보내기 등 다양한 분석 도구를 제공합니다.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💡</div>
            <h3>브레인스토밍</h3>
            <p>드래그앤드롭 보드에서 아이디어를 정리하고 기준과 대안으로 변환합니다.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>안전한 인증</h3>
            <p>Google, Kakao 소셜 로그인 및 이메일 인증을 지원합니다.</p>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>사용 방법</h2>
        <div className={styles.stepList}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div>
              <h3>프로젝트 생성</h3>
              <p>의사결정 주제를 설정하고 프로젝트를 생성합니다.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div>
              <h3>모델 구축</h3>
              <p>평가 기준과 대안을 계층 구조로 구성합니다.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div>
              <h3>평가 진행</h3>
              <p>평가자를 초대하고 쌍대비교 평가를 진행합니다.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>4</div>
            <div>
              <h3>결과 확인</h3>
              <p>종합중요도와 순위를 확인하고 보고서를 다운로드합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>AHP Basic - I Make It &copy; {new Date().getFullYear()} DreamIT Biz</p>
      </footer>
    </div>
  );
}
