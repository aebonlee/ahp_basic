import Button from '../common/Button';
import styles from './PageNavigator.module.css';

export default function PageNavigator({ current, total, onPrev, onNext, onGoTo }) {
  return (
    <div className={styles.container}>
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={current === 0}
      >
        &larr; 이전
      </Button>

      <div className={styles.pages}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.active : ''}`}
            onClick={() => onGoTo(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Button
        variant={current === total - 1 ? 'success' : 'primary'}
        onClick={onNext}
      >
        {current === total - 1 ? '결과 보기' : '다음 →'}
      </Button>
    </div>
  );
}
