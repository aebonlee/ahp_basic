import styles from './WeightSlider.module.css';

export default function WeightSlider({ criteria, selected, onChange }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>1차 기준 선택</h3>
      <div className={styles.buttons}>
        {criteria.map((c, idx) => (
          <button
            key={c.id}
            className={`${styles.btn} ${idx === selected ? styles.active : ''}`}
            onClick={() => onChange(idx)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
