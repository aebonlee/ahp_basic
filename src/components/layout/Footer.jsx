import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>&copy; 2026 AHP Basic - I Make It</span>
        <span className={styles.links}>
          <a href="https://imakeit.kr" target="_blank" rel="noopener noreferrer">imakeit.kr</a>
        </span>
      </div>
    </footer>
  );
}
