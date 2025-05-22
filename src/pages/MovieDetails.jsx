import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./MovieDetails.module.css";
import mask from "../assets/mask.svg";
import backButton from "../assets/back-button.svg";
import { API_BASE_URL } from "../App";

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
    if (urlParams.has("reset")) {
      // Если параметр reset присутствует, перенаправляем на /main с параметром reset
      const timestamp = new Date().getTime();
      navigate(`/main?reset=${timestamp}`, { replace: true, state: null });
      return;
    }

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    const fetchMovieDetails = async () => {
      try {
        setCancelLoad(false);

        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`);

        // Проверяем, не была ли отменена загрузка
        if (cancelLoad) {
          return;
        }

        if (!response.ok) {
          throw new Error("Не удалось получить данные о фильме");
        }
        const data = await response.json();

        // Проверяем, не была ли отменена загрузка
        if (cancelLoad) {
          return;
        }

        // Проверяем формат URL постера и добавляем базовый URL при необходимости
        if (data.poster_url && !data.poster_url.startsWith("http")) {
          data.poster_url = `https://image.tmdb.org/t/p/w500${data.poster_url}`;
        }

        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении данных о фильме:", error);
        setLoading(false);
      }
    };

    fetchMovieDetails();

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [movieId, navigate, location.search]);

  const fetchSimilarMovies = async () => {
    try {
      setCancelLoad(false);

      // Показываем индикатор загрузки
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/recommend/similar-movies/${movieId}`,
      );

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setLoading(false);
        return;
      }

      // Сначала получаем данные от API для проверки
      const data = await response.json();

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setLoading(false);
        return;
      }

      // Проверяем, содержит ли ответ сообщение об ошибке
      if (!response.ok || data.message) {
        console.log("Получен ответ с ошибкой:", data);

        // Проверяем, не была ли отменена загрузка
        if (cancelLoad) {
          setLoading(false);
          return;
        }

        // Сохраняем информацию о пути пользователя
        const stateToPass = {
          ...location.state, // Сохраняем весь предыдущий state
          similarMovies: [], // Пустой массив фильмов
          movieTitle: movie?.title || "Фильм",
          originalMovieId: movieId, // Передаем ID оригинального фильма
          fromMovieDetails: true, // Флаг, что переход был с детальной страницы фильма
          noResultsMessage: "Похожие фильмы не найдены", // Сообщение об ошибке
        };

        // Если у нас есть информация о том, что пользователь пришел с главной страницы,
        // добавляем флаг fromMain в передаваемый state
        if (location.state && location.state.fromMain) {
          stateToPass.fromMain = true;
        }

        // Переходим на страницу с похожими фильмами, но с пустым массивом
        navigate(`/similar/${movieId}`, { state: stateToPass });
        return;
      }

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setLoading(false);
        return;
      }

      // Сохраняем информацию о пути пользователя
      const stateToPass = {
        ...location.state, // Сохраняем весь предыдущий state
        similarMovies: data.recommendations,
        movieTitle: movie?.title || "Фильм",
        originalMovieId: movieId, // Передаем ID оригинального фильма
        fromMovieDetails: true, // Флаг, что переход был с детальной страницы фильма
      };

      // Если у нас есть информация о том, что пользователь пришел с главной страницы,
      // добавляем флаг fromMain в передаваемый state
      if (location.state && location.state.fromMain) {
        stateToPass.fromMain = true;
      }

      // Если ответ успешный, переходим на страницу с похожими фильмами
      navigate(`/similar/${movieId}`, { state: stateToPass });
    } catch (error) {
      console.error("Ошибка при получении похожих фильмов:", error);

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setLoading(false);
        return;
      }

      // Сохраняем информацию о пути пользователя
      const stateToPass = {
        ...location.state,
        similarMovies: [],
        movieTitle: movie?.title || "Фильм",
        originalMovieId: movieId,
        fromMovieDetails: true,
        noResultsMessage: "Похожие фильмы не найдены.",
      };

      // Если у нас есть информация о том, что пользователь пришел с главной страницы,
      // добавляем флаг fromMain в передаваемый state
      if (location.state && location.state.fromMain) {
        stateToPass.fromMain = true;
      }

      // В случае непредвиденной ошибки также переходим на страницу с похожими фильмами
      navigate(`/similar/${movieId}`, { state: stateToPass });

      setLoading(false);
    }
  };

  const handleSimilarMovies = () => {
    fetchSimilarMovies();
  };

  const handleBack = (e) => {
    e.preventDefault();

    // Проверяем, откуда пришел пользователь
    if (location.state && location.state.fromSimilar) {
      // Если пришли со страницы похожих фильмов, возвращаемся туда
      navigate(-1);
    } else if (location.state && location.state.fromMain) {
      // Если пришли с главной страницы, возвращаемся на главную с сохранением состояния
      navigate("/main", {
        state: location.state,
        replace: true,
      });
    } else {
      // В остальных случаях просто возвращаемся назад
      navigate(-1);
    }
  };

  const handlePosterError = () => {
    setPosterError(true);
  };

  // Функция для обработки отмены загрузки
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
          <span key={`full-${i}`} className={styles.starFull}>
            ★
          </span>
        ))}
        {hasHalfStar && <span className={styles.starHalf}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.starEmpty}>
            ★
          </span>
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
          <button className={styles.cancelButton} onClick={handleCancelLoad}>
            Отменить
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className={styles.error}>Фильм не найден</div>;
  }

  // Получаем полный URL постера или создаем пустой блок при ошибке
  const posterUrl = posterError ? null : movie.poster_url || movie.poster_ur;

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
              <img
                src={backButton}
                alt="Back"
                className={styles.backButtonIcon}
              />
            </button>
          </div>

          {renderStarRating(movie.average_rating)}

          <div className={styles.genreContainer}>
            <img src={mask} alt="Mask" className={styles.genreIcon} />
            <span className={styles.genreLabel}>
              {movie.genres.join(" | ")}
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
