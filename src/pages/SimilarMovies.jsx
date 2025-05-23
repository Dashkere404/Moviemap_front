import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./Main.module.css"; // Используем те же стили, что и в Main
import { API_BASE_URL, POSTER_BASE_URL } from "../App";

export default function SimilarMovies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId } = useParams();

  const [movies, setMovies] = useState([]);
  const [showMovies, setShowMovies] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [originalMovieId, setOriginalMovieId] = useState(null);
  const [userTitle, setUserTitle] = useState("Похожие фильмы");
  const [cancelLoad, setCancelLoad] = useState(false);
  const abortControllerRef = useRef(null);

  // Сортировка фильмов по рейтингу (от высшего к низшему)
  const sortedMovies = [...movies].sort((a, b) => b.rating - a.rating);

  useEffect(() => {
    // Сбрасываем состояния при каждом изменении movieId или location
    setIsLoading(true);
    setNoResults(false);
    setNoResultsMessage("");
    setCancelLoad(false);
    
    // Скроллим в начало страницы при загрузке
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    // Функция для обработки данных
    const processData = () => {
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
            setIsLoading(false); // Явно выключаем индикатор загрузки

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
              posterUrl = `${POSTER_BASE_URL}${posterUrl}`;
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
          setIsLoading(false); // Явно выключаем индикатор загрузки

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
        } else {
          // Если в state нет данных о похожих фильмах, но есть movieId
          if (movieId) {
            fetchSimilarMovies(movieId);
          } else {
            // Если нет ни данных, ни movieId
            setNoResults(true);
            setNoResultsMessage("Похожие фильмы не найдены");
            setShowMovies(false);
            setIsLoading(false); // Явно выключаем индикатор загрузки
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
          setIsLoading(false); // Явно выключаем индикатор загрузки
        }
      }
    };

    // Небольшая задержка для гарантированного отображения оверлея загрузки
    const timeoutId = setTimeout(() => {
      processData();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = "auto";
      // Отменяем запрос при размонтировании компонента
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, movieId]);

  // Функция для загрузки похожих фильмов
  const fetchSimilarMovies = async (movieId) => {
    try {
      // Сбрасываем флаг отмены
      setCancelLoad(false);

      // Показываем индикатор загрузки
      setIsLoading(true);
      
      // Создаем новый AbortController для этого запроса
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Небольшая задержка для гарантированного отображения оверлея загрузки
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch(
        `${API_BASE_URL}/recommend/similar-movies/${movieId}`,
        { signal }
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
        // Создаем новый AbortController для этого запроса
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const movieSignal = abortControllerRef.current.signal;
        
        const movieResponse = await fetch(`${API_BASE_URL}/movie/${movieId}`, { signal: movieSignal });

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          setUserTitle(`Фильмы, похожие на "${movieData.title}"`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос информации о фильме был отменен');
          return;
        }
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
          posterUrl = `${POSTER_BASE_URL}${posterUrl}`;
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
      // Проверяем, не была ли отмена запроса
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        return;
      }
      
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
    
    // Отменяем текущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Если фильмы не были загружены и это первоначальная загрузка, возвращаемся назад
    if (movies.length === 0 && !location.state?.similarMovies) {
      // Небольшая задержка перед навигацией, чтобы пользователь увидел сообщение об отмене
      setTimeout(() => {
        navigate(-1);
      }, 500);
    }
    
    // Сбрасываем флаг cancelLoad через небольшой промежуток времени
    setTimeout(() => {
      setCancelLoad(false);
    }, 100);
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
