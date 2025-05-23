import React, { useMemo } from 'react';
import OptimizedImage from './OptimizedImage';
import styles from '../pages/Main.module.css';
import defaultPoster from '../assets/poster1.jpg';

// Мемоизированный компонент карточки фильма
const MovieCard = React.memo(({ 
  movie, 
  onClick, 
  genreTranslations = {},
  index = 0 
}) => {
  // Мемоизируем форматированные жанры для предотвращения повторных вычислений
  const formattedGenres = useMemo(() => {
    if (!movie.genres || movie.genres.length === 0) return 'Не указано';
    
    return movie.genres
      .slice(0, 2) // Берем только первые два жанра
      .map(genre => genreTranslations[genre] || genre)
      .join(', ');
  }, [movie.genres, genreTranslations]);

  // Задержка для анимации появления карточек
  const animationDelay = useMemo(() => {
    return `${Math.min(index * 0.05, 0.5)}s`;
  }, [index]);

  // Обработчик клика по карточке
  const handleClick = () => {
    if (onClick) onClick(movie.id);
  };

  return (
    <div 
      className={styles.movieCard} 
      onClick={handleClick}
      style={{ animationDelay }}
    >
      <div className={styles.posterContainer}>
        <OptimizedImage
          src={movie.poster}
          alt={`Постер к фильму "${movie.title}"`}
          className={styles.poster}
          fallbackSrc={defaultPoster}
          loading="lazy"
        />
        <div className={styles.rating}>{movie.rating}</div>
      </div>
      <div className={styles.movieInfo}>
        <h3 className={styles.movieTitle}>{movie.title}</h3>
        <div className={styles.movieMeta}>
          <span className={styles.year}>{movie.year}</span>
          <span className={styles.genres}>{formattedGenres}</span>
        </div>
      </div>
    </div>
  );
});

export default MovieCard; 