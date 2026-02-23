import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>&copy; {new Date().getFullYear()} AHP Basic</span>
        <span className={styles.links}>
          <a href="https://ahp-basic.dreamitbiz.com" target="_blank" rel="noopener noreferrer">ahp-basic.dreamitbiz.com</a>
        </span>
      </div>
    </footer>
  );
}
