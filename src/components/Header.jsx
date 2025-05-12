import logomap from '../assets/logomap.svg';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={logomap} alt="Логотип" className={styles.logo} />
        <h1 className={styles.title}>MovieMap</h1>
      </div>
    </header>
  );
}