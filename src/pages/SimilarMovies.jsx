import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./Main.module.css"; // Используем те же стили, что и в Main
import { API_BASE_URL } from "../App";

export default function SimilarMovies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId } = useParams();

  const [movies, setMovies] = useState([]);
  const [showMovies, setShowMovies] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalMovieId, setOriginalMovieId] = useState(null);
  const [userTitle, setUserTitle] = useState("Похожие фильмы");
  const [cancelLoad, setCancelLoad] = useState(false);

  // Сортировка фильмов по рейтингу (от высшего к низшему)
  const sortedMovies = [...movies].sort((a, b) => b.rating - a.rating);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.state) {
      // Сохраняем информацию о том, что пользователь пришел с главной страницы
      if (location.state.fromMain) {
        console.log(
          "Пользователь пришел с главной страницы, сохраняем состояние",
        );
      }

      // Если есть state с данными о похожих фильмах
      if (location.state.similarMovies) {
        // Если массив пустой и есть сообщение об ошибке
        if (
          location.state.similarMovies.length === 0 &&
          location.state.noResultsMessage
        ) {
          setNoResults(true);
          setNoResultsMessage(location.state.noResultsMessage);
          setShowMovies(false);

          // Устанавливаем заголовок для похожих фильмов
          if (location.state.movieTitle) {
            setUserTitle(`Фильмы, похожие на "${location.state.movieTitle}"`);
          } else {
            setUserTitle(`Похожие фильмы`);
          }

          // Сохраняем ID оригинального фильма для кнопки возврата
          if (location.state.originalMovieId) {
            setOriginalMovieId(location.state.originalMovieId);
          } else if (movieId) {
            setOriginalMovieId(movieId);
          }

          return;
        }

        const formattedMovies = location.state.similarMovies.map((movie) => {
          // Проверяем, содержит ли URL постера полный путь или только имя файла
          let posterUrl = movie.poster_url;
          if (posterUrl && !posterUrl.startsWith("http")) {
            posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
          }

          return {
            id: movie.movieId,
            title: movie.title,
            rating: movie.average_rating.toFixed(1),
            poster: posterUrl,
            year: movie.year || 2000,
            genres: movie.genres || [],
          };
        });

        setMovies(formattedMovies);
        setShowMovies(true);

        // Устанавливаем заголовок для похожих фильмов
        if (location.state.movieTitle) {
          setUserTitle(`Фильмы, похожие на "${location.state.movieTitle}"`);
        } else {
          setUserTitle(`Похожие фильмы`);
        }

        // Сохраняем ID оригинального фильма для кнопки возврата
        if (location.state.originalMovieId) {
          setOriginalMovieId(location.state.originalMovieId);
        } else if (movieId) {
          setOriginalMovieId(movieId);
        }
      }
    } else {
      // Если state пустой, пробуем получить похожие фильмы по movieId из URL
      if (movieId) {
        fetchSimilarMovies(movieId);
      } else {
        // Если нет ни state, ни movieId, показываем сообщение об ошибке
        setNoResults(true);
        setNoResultsMessage("Похожие фильмы не найдены");
        setShowMovies(false);
      }
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [location, movieId]);

  // Функция для загрузки похожих фильмов
  const fetchSimilarMovies = async (movieId) => {
    try {
      // Сбрасываем флаг отмены
      setCancelLoad(false);

      // Показываем индикатор загрузки
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/recommend/similar-movies/${movieId}`,
      );

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }

      // Сначала получаем данные от API для проверки
      const data = await response.json();

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }

      // Проверяем, содержит ли ответ сообщение об ошибке
      if (!response.ok || data.message) {
        console.log("Получен ответ с ошибкой:", data);

        // Показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage("Похожие фильмы не найдены");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }

      // Получаем информацию о фильме для заголовка
      try {
        const movieResponse = await fetch(`${API_BASE_URL}/movie/${movieId}`);

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          setUserTitle(`Фильмы, похожие на "${movieData.title}"`);
        }
      } catch (error) {
        console.error("Ошибка при получении данных о фильме:", error);
      }

      // Проверяем, что список фильмов не пустой
      if (!data.recommendations || data.recommendations.length === 0) {
        setNoResults(true);
        setNoResultsMessage("Похожие фильмы не найдены");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }

      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }

      // Преобразуем полученные данные в формат, используемый в приложении
      const formattedMovies = data.recommendations.map((movie) => {
        // Проверяем, содержит ли URL постера полный путь или только имя файла
        let posterUrl = movie.poster_url;
        if (posterUrl && !posterUrl.startsWith("http")) {
          posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
        }

        return {
          id: movie.movieId,
          title: movie.title,
          rating: movie.average_rating.toFixed(1),
          poster: posterUrl,
          year: movie.year || 2000,
          genres: movie.genres || [],
        };
      });

      // Последняя проверка перед установкой состояний
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }

      setMovies(formattedMovies);
      setShowMovies(true);
      setOriginalMovieId(movieId);
      setIsLoading(false);
    } catch (error) {
      console.error("Ошибка при получении похожих фильмов:", error);

      if (!cancelLoad) {
        setNoResults(true);
        setNoResultsMessage("Произошла ошибка при получении похожих фильмов");
        setShowMovies(false);
        setIsLoading(false);
      }
    }
  };

  // Функция для возврата на 2 страницы назад
  const handleBackToMovie = () => {
    // Используем navigate(-2) для возврата на 2 страницы назад в истории браузера
    navigate(-2);
  };

  // Функция для возврата на главную страницу
  const handleBackToMain = () => {
    // Если у нас есть информация о состоянии главной страницы, используем её
    if (location.state && location.state.fromMain) {
      navigate("/main", {
        state: location.state,
        replace: true,
      });
    } else {
      // Иначе просто переходим на главную
      navigate("/main");
    }
  };

  // Функция для обработки клика по карточке фильма
  const handleMovieClick = (movieId) => {
    // Проверяем, есть ли информация о том, что пользователь пришел с главной страницы
    const mainPageState =
      location.state && location.state.fromMain ? location.state : null;

    navigate(`/movie/${movieId}`, {
      state: {
        // Если пользователь изначально пришел с главной, сохраняем эту информацию
        ...(mainPageState || {}),
        // Указываем, что переход на карточку фильма был со страницы похожих фильмов
        fromSimilar: true,
        // Сохраняем оригинальный ID фильма для возможности возврата
        originalMovieId: originalMovieId,
      },
    });
  };

  // Функция для обработки отмены загрузки
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setIsLoading(false);
    setNoResults(true);
    setNoResultsMessage("Загрузка была отменена пользователем");
    setShowMovies(false);
  };

  return (
    <>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <h2>Загрузка</h2>
            <div className={styles.spinner}></div>
            <button className={styles.cancelButton} onClick={handleCancelLoad}>
              Отменить
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.similarPageHeader}>
          <div className={styles.navigationButtons}>
            <button
              className={styles.navigationButton}
              onClick={handleBackToMovie}
            >
              Вернуться назад
            </button>
            <button
              className={styles.navigationButton}
              onClick={handleBackToMain}
            >
              Вернуться на главную
            </button>
          </div>
          <h2 className={styles.similarPageTitle}>{userTitle}</h2>
        </div>

        {/* Movie Grid or Placeholder */}
        {showMovies ? (
          <div className={styles.movieGrid}>
            {sortedMovies.map((movie) => (
              <div
                key={movie.id}
                className={styles.movieCard}
                onClick={() => handleMovieClick(movie.id)}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className={styles.moviePoster}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.backgroundColor = "#2B275F";
                    e.target.style.display = "flex";
                    e.target.style.alignItems = "center";
                    e.target.style.justifyContent = "center";
                    e.target.style.color = "#EFCFFF";
                    e.target.style.fontSize = "14px";
                    e.target.style.padding = "10px";
                    e.target.style.textAlign = "center";
                  }}
                />
                <div className={styles.ratingBadge}>{movie.rating}</div>
                <div className={styles.movieInfo}>
                  <div className={styles.movieTitle}>{movie.title}</div>
                </div>
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className={styles.noResults}>
            <p>{noResultsMessage}</p>
          </div>
        ) : (
          <div className={styles.placeholder}>Загрузка похожих фильмов...</div>
        )}
      </div>
    </>
  );
}
