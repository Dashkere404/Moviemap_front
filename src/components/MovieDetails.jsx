import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './MovieDetails.module.css';
import mask from '../assets/mask.svg';
import backButton from '../assets/back-button.svg';
import poster6 from '../assets/poster6.jpg';

export default function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    document.body.style.overflow = 'hidden';

    const fetchMovieDetails = () => {
        const mockResponse = {
          movieId: 2028,
          title: "Спасти рядового Райана",
          poster_ur: poster6,
          average_rating: 3.6,
          overview: "Капитан Джон Миллер получает тяжелое задание. Вместе с отрядом из восьми человек Миллер должен отправиться в тыл врага на поиски рядового Джеймса Райана, три родных брата которого почти одновременно погибли на полях сражений. Командование приняло решение демобилизовать Райана и отправить его на родину к безутешной матери. Но для того, чтобы найти и спасти солдата, крошечному отряду придется пройти через все круги ада...",
          year: "1998",
          genres: [
            "Боевик",
            "Драма",
            "Военный"
          ]
        };

      setTimeout(() => {
        setMovie(mockResponse);
        setLoading(false);
      }, 1000); 
    };
    
    
    fetchMovieDetails();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [movieId]);
  
  const handleSimilarMovies = () => {
    navigate(`/similar/${movieId}`);
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (location.state && location.state.fromMain) {
      navigate('/main', { 
        state: location.state,
        replace: true 
      });
    } else {
      navigate(-1);
    }
  };
  
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className={styles.starRating}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.starFull}>★</span>
        ))}
        {hasHalfStar && <span className={styles.starHalf}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.starEmpty}>★</span>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  if (!movie) {
    return <div className={styles.error}>Фильм не найден</div>;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posterContainer}>
          <img src={movie.poster_ur} alt={movie.title} className={styles.poster} />
        </div>
        
        <div className={styles.detailsCard}>
            <div className={styles.titleAndBackButtonContainer}>
                <h1 className={styles.title}>{movie.title}</h1>
                <button onClick={handleBack} className={styles.backButton}>
                    <img src={backButton} alt="Back" className={styles.backButtonIcon} />
                </button>
            </div>
          
          {renderStarRating(movie.average_rating)}
          
          <div className={styles.genreContainer}>
            <img src={mask} alt="Mask" className={styles.genreIcon} />
            <span className={styles.genreLabel}>
              {movie.genres.join(' | ')}
            </span>
          </div>
          
          <div className={styles.overview}>
            <p>{movie.overview}</p>
          </div>
          
          <div className={styles.footer}>
            <div className={styles.year}>
              <span className={styles.yearLabel}>Год:</span> {movie.year}
            </div>
            
            <button 
              className={styles.similarButton} 
              onClick={handleSimilarMovies}
            >
              Похожие фильмы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 