import Button from '../common/Button';
import { PAIRWISE_SCALE } from '../../lib/constants';
import styles from './AhpIntroduction.module.css';

export default function AhpIntroduction({ onStart }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>쌍대비교 평가 안내</h2>

      <div className={styles.section}>
        <h3>평가 방법</h3>
        <p>두 항목을 비교하여 어느 쪽이 얼마나 더 중요한지를 선택합니다.</p>
        <p>왼쪽 항목이 더 중요하면 <span className={styles.left}>파란색</span> 영역을,
           오른쪽 항목이 더 중요하면 <span className={styles.right}>빨간색</span> 영역을 클릭합니다.</p>
      </div>

      <div className={styles.section}>
        <h3>17점 척도</h3>
        <table className={styles.scaleTable}>
          <thead>
            <tr><th>값</th><th>의미</th></tr>
          </thead>
          <tbody>
            {PAIRWISE_SCALE.map(s => (
              <tr key={s.value}>
                <td>{s.value}</td>
                <td>{s.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h3>비일관성비율 (CR)</h3>
        <p>응답의 일관성을 측정하는 지표입니다. CR이 0.1 이하여야 합니다.</p>
        <p>CR이 높으면 <strong>판단 도우미</strong>가 일관성을 개선할 수 있는 추천을 제공합니다.</p>
      </div>

      <Button onClick={onStart} size="lg" className={styles.startBtn}>
        평가 시작
      </Button>
    </div>
  );
}
