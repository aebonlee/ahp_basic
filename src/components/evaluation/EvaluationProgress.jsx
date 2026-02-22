import styles from './EvaluationProgress.module.css';

export default function EvaluationProgress({ current, total, pageSequence, comparisons }) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  // Count total completed comparisons across all pages
  let totalPairs = 0;
  let completedPairs = 0;

  for (const page of pageSequence) {
    for (const pair of page.pairs) {
      totalPairs++;
      const key = `${page.parentId}:${pair.left.id}:${pair.right.id}`;
      if (comparisons[key] !== undefined && comparisons[key] !== 0) {
        completedPairs++;
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span>진행도: {current}/{total} 페이지</span>
        <span>평가: {completedPairs}/{totalPairs} 항목</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
