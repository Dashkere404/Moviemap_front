import logomap from '../assets/logomap.svg';
import styles from './Header.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isWelcomePage = location.pathname === '/';

  const handleHomeClick = () => {
    // Переходим на главную страницу без сохранения предыдущего состояния
    // Используем replace: true, чтобы заменить текущую запись в истории браузера
    // Принудительно обновляем страницу, чтобы гарантировать сброс всех состояний
    // Добавляем уникальный параметр, чтобы обойти кеширование и гарантировать перезагрузку
    const timestamp = new Date().getTime();
    navigate(`/main?reset=${timestamp}`, { 
      replace: true,
      state: null // Используем null вместо пустого объекта для полного сброса
    });
  };

  return (
    <header className={styles.header}>
      {isWelcomePage ? (
        // Для страницы Welcome оставляем только логотип посередине
        <div className={styles.logoContainer}>
          <img src={logomap} alt="Логотип" className={styles.logo} />
          <h1 className={styles.title}>MovieMap</h1>
        </div>
      ) : (
        // Для остальных страниц логотип слева и кнопка "Главная" по центру
        <div className={styles.headerContent}>
          <div className={styles.logoContainerLeft}>
            <img src={logomap} alt="Логотип" className={styles.logo} />
            <h1 className={styles.title}>MovieMap</h1>
          </div>
          <div className={styles.navCenter}>
            <button className={styles.homeButton} onClick={handleHomeClick}>
              Главная
            </button>
          </div>
          <div className={styles.spacer}></div>
        </div>
      )}
    </header>
  );
}