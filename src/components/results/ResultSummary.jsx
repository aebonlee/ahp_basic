import { LEVEL_COLORS } from '../../lib/constants';
import styles from '../../styles/results.module.css';

export default function ResultSummary({ criteria, alternatives, results }) {
  // Build global priorities for criteria
  const getGlobalPriority = (criterionId) => {
    let global = 1;
    let current = criteria.find(c => c.id === criterionId);
    const chain = [];

    while (current) {
      chain.unshift(current);
      current = criteria.find(c => c.id === current.parent_id);
    }

    for (const node of chain) {
      const parentId = node.parent_id || 'root';
      const pageResult = results.pageResults[parentId];
      if (pageResult) {
        const idx = pageResult.items.findIndex(i => i.id === node.id);
        if (idx >= 0) global *= pageResult.priorities[idx] || 0;
      }
    }
    return global;
  };

  // Get leaf criteria
  const leafCriteria = criteria.filter(c => !criteria.some(other => other.parent_id === c.id));

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>기준 종합중요도</h3>

      <div className={styles.legend}>
        {[1, 2, 3, 4, 5].map(level => (
          <span key={level} className={styles.legendItem}>
            <span className={styles.legendColor} style={{ background: LEVEL_COLORS[level - 1] }} />
            {level}차
          </span>
        ))}
      </div>

      <div className={styles.barList}>
        {criteria.map(c => {
          const level = getLevel(criteria, c.id);
          const global = getGlobalPriority(c.id);
          const pct = (global * 100).toFixed(3);

          return (
            <div key={c.id} className={styles.barRow} style={{ paddingLeft: level * 16 }}>
              <span className={styles.barLabel}>{c.name}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${global * 100}%`,
                    backgroundColor: LEVEL_COLORS[level % LEVEL_COLORS.length],
                  }}
                />
              </div>
              <span className={styles.barValue}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getLevel(criteria, id) {
  let level = 0;
  let current = criteria.find(c => c.id === id);
  while (current?.parent_id) {
    level++;
    current = criteria.find(c => c.id === current.parent_id);
  }
  return level;
}
