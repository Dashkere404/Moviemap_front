import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './MovieDetails.module.css';
import mask from '../assets/mask.svg';
import backButton from '../assets/back-button.svg';
import { API_BASE_URL } from '../App';

export default function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterError, setPosterError] = useState(false);
  const [cancelLoad, setCancelLoad] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has('reset')) {
      navigate('/main', { replace: true, state: null });
      return;
    }
    
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    const fetchMovieDetails = async () => {
      try {
        setCancelLoad(false);
        
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`);
        
        if (cancelLoad) {
          return;
        }
        
        if (!response.ok) {
          throw new Error('Не удалось получить данные о фильме');
        }
        const data = await response.json();
        
        if (cancelLoad) {
          return;
        }
        
        if (data.poster_url && !data.poster_url.startsWith('http')) {
          data.poster_url = `https://image.tmdb.org/t/p/w500${data.poster_url}`;
        }
        
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении данных о фильме:', error);
        setLoading(false);
      }
    };
    
    fetchMovieDetails();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [movieId, navigate, location.search]);
  
  const fetchSimilarMovies = async () => {
    try {
      setCancelLoad(false);
      
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/recommend/similar-movies/${movieId}`);
      
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      
      if (!response.ok || data.message) {
        console.log('Получен ответ с ошибкой:', data);
        
        if (cancelLoad) {
          setLoading(false);
          return;
        }
        
        navigate(`/similar/${movieId}`, {
          state: {
            ...location.state,
            similarMovies: [],
            movieTitle: movie?.title || 'Фильм',
            originalMovieId: movieId,
            fromMovieDetails: true,
            noResultsMessage: 'Похожие фильмы не найдены'
          }
        });
        return;
      }
      
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      
      navigate(`/similar/${movieId}`, {
        state: {
          ...location.state,
          similarMovies: data.recommendations,
          movieTitle: movie?.title || 'Фильм',
          originalMovieId: movieId,
          fromMovieDetails: true
        }
      });
    } catch (error) {
      console.error('Ошибка при получении похожих фильмов:', error);
      
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      
      navigate(`/similar/${movieId}`, {
        state: {
          ...location.state,
          similarMovies: [],
          movieTitle: movie?.title || 'Фильм',
          originalMovieId: movieId,
          fromMovieDetails: true,
          noResultsMessage: 'Похожие фильмы не найдены.'
        }
      });
      
      setLoading(false);
    }
  };
  
  const handleSimilarMovies = () => {
    fetchSimilarMovies();
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
  
  const handlePosterError = () => {
    setPosterError(true);
  };
  
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setLoading(false);
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
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingContent}>
          <h2>Загрузка</h2>
          <div className={styles.spinner}></div>
          <button 
            className={styles.cancelButton}
            onClick={handleCancelLoad}
          >
            Отменить
          </button>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return <div className={styles.error}>Фильм не найден</div>;
  }
  
  const posterUrl = posterError ? null : (movie.poster_url || movie.poster_ur);
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posterContainer}>
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className={styles.poster} 
              onError={handlePosterError}
            />
          ) : (
            <div className={styles.emptyPoster}>
              <span>{movie.title}</span>
            </div>
          )}
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