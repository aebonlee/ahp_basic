import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 40, message }) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} style={{ width: size, height: size }} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
