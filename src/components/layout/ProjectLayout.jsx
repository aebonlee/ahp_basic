import Navbar from './Navbar';
import Footer from './Footer';
import ProjectSidebar from './ProjectSidebar';
import styles from './ProjectLayout.module.css';

export default function ProjectLayout({ children, projectName }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.body}>
        <ProjectSidebar projectName={projectName} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
