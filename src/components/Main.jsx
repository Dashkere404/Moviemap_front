import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import searchIcon from '../assets/search.svg';
import genreIcon from '../assets/genre.svg';
import rateIcon from '../assets/rate.svg';
import yearIcon from '../assets/year.svg';
import clearIcon from '../assets/clear.svg';
import styles from './Main.module.css';
import filterStyles from './FilterModal.module.css';
import tape from '../assets/tape.png';
import { theme } from '../styles/theme';
import FilterModal from './FilterModal';
import YearSlider from './YearSlider';
import { API_BASE_URL } from '../App';

import poster1 from '../assets/poster1.jpg';
import poster2 from '../assets/poster2.jpg';
import poster3 from '../assets/poster3.jpg';
import poster4 from '../assets/poster4.jpg';
import poster5 from '../assets/poster5.jpg';

const posters = [poster1, poster2, poster3, poster4, poster5]; 
const defaultPoster = poster1; // Используем первый постер как запасной вариант

const genres = [
  'Action', 'Adventure', 'Animation', "Children", 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'Musical',
  'Mystery', 'Romance', 'Sci-fi', 'Thriller', 'War', 'Western'
];

const ratingOptions = ['1+', '2+', '3+', '4+', '5'];

const GENRE_TRANSLATIONS = {
  "Action": "Боевик",
  "Adventure": "Приключения",
  "Animation": "Анимация",
  "Children": "Детский",
  "Comedy": "Комедия",
  "Crime": "Криминал",
  "Documentary": "Документальный",
  "Drama": "Драма",
  "Fantasy": "Фэнтези",
  "Film-Noir": "Фильм-нуар",
  "Horror": "Ужасы",
  "Musical": "Мюзикл",
  "Mystery": "Детектив",
  "Romance": "Мелодрама",
  "Sci-fi": "Научная фантастика",
  "Thriller": "Триллер",
  "War": "Военный",
  "Western": "Вестерн",
  "(no genres listed)": "Не указано"
};

export default function Main() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId } = useParams();
  const [activeTab, setActiveTab] = useState('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [userTitle, setUserTitle] = useState('Рекомендации для пользователя');
  const [movies, setMovies] = useState([]);
  const [showMovies, setShowMovies] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [originalMovieId, setOriginalMovieId] = useState(null);
  
  const [searchInputDisabled, setSearchInputDisabled] = useState(false);
  const [filtersDisabled, setFiltersDisabled] = useState(false);

  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [bestFirst, setBestFirst] = useState(true);
  const [yearRange, setYearRange] = useState({ minYear: 1874, maxYear: 2016 });
  
  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
  const [tempBestFirst, setTempBestFirst] = useState(true);
  const [tempYearRange, setTempYearRange] = useState({ minYear: 1874, maxYear: 2016 });
  
  const [genreFilterActive, setGenreFilterActive] = useState(false);
  const [ratingFilterActive, setRatingFilterActive] = useState(false);
  const [yearFilterActive, setYearFilterActive] = useState(false);
  
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Добавляем новое состояние для отмены загрузки
  const [cancelLoad, setCancelLoad] = useState(false);

  useEffect(() => {
    // Проверяем наличие параметра reset в URL
    const urlParams = new URLSearchParams(location.search);
    const isReset = urlParams.has('reset');
    
    // Если есть параметр reset, принудительно сбрасываем все состояния
    if (isReset) {
      // Сбрасываем все состояния к начальным значениям
      setActiveTab('personal');
      setSearchQuery('');
      setUserId('');
      setUserIdInput('');
      setUserTitle('Рекомендации для пользователя');
      setMovies([]);
      setShowMovies(false);
      setNoResults(false);
      setNoResultsMessage('');
      setOriginalMovieId(null);
      setSearchInputDisabled(false);
      setFiltersDisabled(false);
      
      // Сбрасываем модальные окна
      setShowGenreModal(false);
      setShowRatingModal(false);
      setShowYearModal(false);
      
      // Сбрасываем фильтры
      setSelectedGenres([]);
      setSelectedRatings([]);
      setBestFirst(true);
      setYearRange({ minYear: 1874, maxYear: 2016 });
      setTempSelectedGenres([]);
      setTempSelectedRatings([]);
      setTempBestFirst(true);
      setTempYearRange({ minYear: 1874, maxYear: 2016 });
      
      // Сбрасываем активность фильтров
      setGenreFilterActive(false);
      setRatingFilterActive(false);
      setYearFilterActive(false);
      
      // Прокручиваем страницу вверх
      window.scrollTo(0, 0);
      
      // Очищаем URL от параметра reset
      navigate('/main', { replace: true });
      
      // Выходим из эффекта, чтобы не выполнять остальной код
      return;
    }
    
    // Обычная обработка location.state, если нет параметра reset
    if (location.state) {
      if (location.state.scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, location.state.scrollPosition);
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }

      if (location.state.searchQuery) {
        setSearchQuery(location.state.searchQuery);
      }
      if (location.state.userIdInput) {
        setUserIdInput(location.state.userIdInput);
        setUserId(location.state.userIdInput);
        if (location.state.userTitle) {
          setUserTitle(location.state.userTitle);
        }
      }
      
      if (location.state.selectedGenres) {
        setSelectedGenres(location.state.selectedGenres);
      }
      if (location.state.selectedRatings) {
        setSelectedRatings(location.state.selectedRatings);
      }
      if (location.state.bestFirst !== undefined) {
        setBestFirst(location.state.bestFirst);
      }
      if (location.state.yearRange) {
        console.log('Восстанавливаем диапазон лет из state:', location.state.yearRange);
        setYearRange({
          minYear: location.state.yearRange.minYear,
          maxYear: location.state.yearRange.maxYear
        });
        setTempYearRange({
          minYear: location.state.yearRange.minYear,
          maxYear: location.state.yearRange.maxYear
        });
      }
      
      if (location.state.genreFilterActive !== undefined) {
        setGenreFilterActive(location.state.genreFilterActive);
      }
      if (location.state.ratingFilterActive !== undefined) {
        setRatingFilterActive(location.state.ratingFilterActive);
      }
      if (location.state.yearFilterActive !== undefined) {
        setYearFilterActive(location.state.yearFilterActive);
      }
      
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
      
      if (location.state.movies && location.state.movies.length > 0) {
        setMovies(location.state.movies);
        setShowMovies(true);
      }

      // Обработка похожих фильмов, полученных из MovieDetails
      if (location.state.similarMovies) {
        // Если массив пустой и есть сообщение об ошибке
        if (location.state.similarMovies.length === 0 && location.state.noResultsMessage) {
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
        
        const formattedMovies = location.state.similarMovies.map(movie => {
          // Проверяем, содержит ли URL постера полный путь или только имя файла
          let posterUrl = movie.poster_url;
          if (posterUrl && !posterUrl.startsWith('http')) {
            posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
          }
          
          return {
            id: movie.movieId,
            title: movie.title,
            rating: movie.average_rating.toFixed(1),
            poster: posterUrl,
            year: movie.year || 2000,
            genres: movie.genres || []
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
      // Если state пустой (переход с кнопки "Главная"), сбрасываем все значения к дефолтным
      window.scrollTo(0, 0);
      
      // Сбрасываем все состояния к начальным значениям
      setActiveTab('personal');
      setSearchQuery('');
      setUserId('');
      setUserIdInput('');
      setUserTitle('Рекомендации для пользователя');
      setMovies([]);
      setShowMovies(false);
      setNoResults(false);
      setNoResultsMessage('');
      setOriginalMovieId(null);
      setSearchInputDisabled(false);
      setFiltersDisabled(false);
      
      // Сбрасываем модальные окна
      setShowGenreModal(false);
      setShowRatingModal(false);
      setShowYearModal(false);
      
      // Сбрасываем фильтры
      setSelectedGenres([]);
      setSelectedRatings([]);
      setBestFirst(true);
      setYearRange({ minYear: 1874, maxYear: 2016 });
      setTempSelectedGenres([]);
      setTempSelectedRatings([]);
      setTempBestFirst(true);
      setTempYearRange({ minYear: 1874, maxYear: 2016 });
      
      // Сбрасываем активность фильтров
      setGenreFilterActive(false);
      setRatingFilterActive(false);
      setYearFilterActive(false);
    }
    
    if (location.pathname.includes('/similar/') && movieId && !location.state?.similarMovies) {
      setUserTitle(`Похожие фильмы`);
      // Вместо перенаправления показываем сообщение об ошибке
      setNoResults(true);
      setNoResultsMessage('Похожие фильмы не найдены');
      setShowMovies(false);
      
      // Если есть ID фильма, сохраняем его для кнопки возврата
      if (movieId) {
        setOriginalMovieId(movieId);
      }
    }
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [location, location.search, movieId, navigate]);

  const getRandomGenres = () => {
    const numberOfGenres = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfGenres);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Если у нас уже есть ID пользователя и мы переключаемся на вкладку "Популярно у пользователей с похожим вкусом"
    if (userIdInput) {
      // Устанавливаем userId
      setUserId(userIdInput);
      
      if (tab === 'popular') {
        // Если есть активные фильтры, применяем их сразу
        if (genreFilterActive || ratingFilterActive || yearFilterActive) {
          setTimeout(() => {
            applyFilters();
          }, 100);
        } else {
          // Иначе запрашиваем рекомендации без фильтров
          fetchSimilarUsersRecommendations(userIdInput);
        }
      } else {
        // Если переключаемся на персональные рекомендации
        // Если есть активные фильтры, применяем их сразу
        if (genreFilterActive || ratingFilterActive || yearFilterActive) {
          setTimeout(() => {
            applyFilters();
          }, 100);
        } else {
          // Запрос персональных рекомендаций на основе оценок без фильтров
          fetchPersonalRecommendations(userIdInput);
        }
      }
    }
  };
  
  const fetchSimilarUsersRecommendations = async (userId) => {
    try {
      // Сбрасываем флаг отмены
      setCancelLoad(false);
      
      // setUserTitle(`Популярно у пользователей с похожим вкусом (ID: ${userId})`);
      setUserTitle(`Рекомендации для пользователя`);
      
      // Сбрасываем состояние отсутствия результатов
      setNoResults(false);
      setNoResultsMessage('');
      
      // Показываем индикатор загрузки
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/recommend/by-similar-ones/${userId}`);
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Сначала получаем данные для анализа
      const data = await response.json();
      
      // Снова проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Проверяем, содержит ли ответ сообщение об ошибке
      if (!response.ok || data.message) {
        console.log('Получен ответ с ошибкой:', data);
        
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        // Используем сообщение из ответа сервера или дефолтное
        setNoResultsMessage('Для этого пользователя нет рекомендаций.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Ответ API для похожих пользователей:', data);
      
      // Определяем формат ответа и извлекаем список фильмов
      let moviesList = [];
      
      if (Array.isArray(data)) {
        // Если API вернул массив фильмов напрямую
        moviesList = data;
      } else if (data && data.recommendations && Array.isArray(data.recommendations)) {
        // Если API вернул объект с полем recommendations
        moviesList = data.recommendations;
      } else {
        throw new Error('Неверный формат ответа от API');
      }
      
      // Проверяем, что список фильмов не пустой
      if (moviesList.length === 0) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Для этого пользователя нет рекомендаций.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Преобразуем полученные данные в формат, используемый в приложении
      const formattedMovies = moviesList.map(movie => {
        // Проверяем, содержит ли URL постера полный путь или только имя файла
        let posterUrl = movie.poster_url;
        if (posterUrl && !posterUrl.startsWith('http')) {
          posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
        }
        
        return {
          id: movie.movieId,
          title: movie.title,
          rating: movie.average_rating.toFixed(1),
          poster: posterUrl,
          year: movie.year || 2000,
          genres: movie.genres || []
        };
      });
      
      // Последняя проверка перед установкой состояний
      if (cancelLoad) {
        return;
      }
      
      setMovies(formattedMovies);
      setSearchInputDisabled(false);
      setFiltersDisabled(false);
      setSearchQuery('');
      
      setTimeout(() => {
        // Проверяем, не была ли отменена загрузка
        if (!cancelLoad) {
          setShowMovies(true);
          document.body.style.overflow = 'auto';
          // Скрываем индикатор загрузки
          setIsLoading(false);
        }
      }, 100);
      
      // Если есть активные фильтры, применяем их
      if (genreFilterActive || ratingFilterActive || yearFilterActive) {
        setTimeout(() => {
          // Проверяем, не была ли отменена загрузка
          if (!cancelLoad) {
            applyFilters();
          }
        }, 200);
      }
    } catch (error) {
      console.error('Ошибка при получении популярных фильмов:', error);
      // Проверяем, не была ли отменена загрузка
      if (!cancelLoad) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Произошла ошибка при получении рекомендаций. Пожалуйста, проверьте ID пользователя и попробуйте снова.');
        setShowMovies(false);
        // Скрываем индикатор загрузки
        setIsLoading(false);
      }
    }
  };

  const fetchPersonalRecommendations = async (userId) => {
    try {
      // Сбрасываем флаг отмены
      setCancelLoad(false);
      
      // setUserTitle(`Рекомендации для пользователя ${userId}`);
      setUserTitle(`Рекомендации для пользователя`);
      
      // Сбрасываем состояние отсутствия результатов
      setNoResults(false);
      setNoResultsMessage('');
      
      // Показываем индикатор загрузки
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/recommend/by-ratings/${userId}`);
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Сначала получаем данные для анализа
      const data = await response.json();
      
      // Снова проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Проверяем, содержит ли ответ сообщение об ошибке
      if (!response.ok || data.message) {
        console.log('Получен ответ с ошибкой:', data);
        
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        // Используем сообщение из ответа сервера или дефолтное
        setNoResultsMessage('Для этого пользователя нет рекомендаций.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Ответ API для персональных рекомендаций:', data);
      
      // Определяем формат ответа и извлекаем список фильмов
      let moviesList = [];
      
      if (Array.isArray(data)) {
        // Если API вернул массив фильмов напрямую
        moviesList = data;
      } else if (data && data.recommendations && Array.isArray(data.recommendations)) {
        // Если API вернул объект с полем recommendations
        moviesList = data.recommendations;
      } else {
        throw new Error('Неверный формат ответа от API');
      }
      
      // Проверяем, что список фильмов не пустой
      if (moviesList.length === 0) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Для этого пользователя нет рекомендаций.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Преобразуем полученные данные в формат, используемый в приложении
      const formattedMovies = moviesList.map(movie => {
        // Проверяем, содержит ли URL постера полный путь или только имя файла
        let posterUrl = movie.poster_url;
        if (posterUrl && !posterUrl.startsWith('http')) {
          posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
        }
        
        return {
          id: movie.movieId,
          title: movie.title,
          rating: movie.average_rating.toFixed(1),
          poster: posterUrl,
          year: movie.year || 2000,
          genres: movie.genres || []
        };
      });
      
      // Последняя проверка перед установкой состояний
      if (cancelLoad) {
        return;
      }
      
      setMovies(formattedMovies);
      setSearchInputDisabled(false);
      setFiltersDisabled(false);
      setSearchQuery('');
      
      setTimeout(() => {
        // Проверяем, не была ли отменена загрузка
        if (!cancelLoad) {
          setShowMovies(true);
          document.body.style.overflow = 'auto';
          // Скрываем индикатор загрузки
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при получении рекомендаций:', error);
      // Проверяем, не была ли отменена загрузка
      if (!cancelLoad) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Произошла ошибка при получении рекомендаций. Пожалуйста, проверьте ID пользователя и попробуйте снова.');
        setShowMovies(false);
        // Скрываем индикатор загрузки
        setIsLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim() === '') return;
      
      // Сбрасываем флаг отмены
      setCancelLoad(false);
      
      // Сбрасываем состояние отсутствия результатов
      setNoResults(false);
      setNoResultsMessage('');
      
      // Очищаем поле "Введите id пользователя"
      setUserIdInput('');
      setUserId('');
      
      try {
        setUserTitle(`Результаты поиска`);
        const fetchMovies = async () => {
          // Показываем индикатор загрузки
          setIsLoading(true);
          
          const response = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(searchQuery)}`);
          
          // Проверяем, не была ли отменена загрузка
          if (cancelLoad) {
            return;
          }
          
          if (!response.ok) {
            throw new Error('Не удалось выполнить поиск фильмов');
          }
          
          const data = await response.json();
          
          // Проверяем, не была ли отменена загрузка
          if (cancelLoad) {
            return;
          }
          
          console.log('Ответ API для поиска фильмов:', data);
          
          // Определяем формат ответа и извлекаем список фильмов
          let moviesList = [];
          
          if (Array.isArray(data)) {
            // Если API вернул массив фильмов напрямую
            moviesList = data;
          } else if (data && data.results && Array.isArray(data.results)) {
            // Если API вернул объект с полем results
            moviesList = data.results;
          } else {
            throw new Error('Неверный формат ответа от API');
          }
          
          // Проверяем, что список фильмов не пустой
          if (moviesList.length === 0) {
            // Вместо alert показываем сообщение в интерфейсе
            setNoResults(true);
            setNoResultsMessage(`По запросу "${searchQuery}" ничего не найдено.`);
            setShowMovies(false);
            setIsLoading(false);
            return;
          }
          
          // Проверяем, не была ли отменена загрузка
          if (cancelLoad) {
            return;
          }
          
          // Преобразуем полученные данные в формат, используемый в приложении
          const formattedMovies = moviesList.map(movie => {
            // Проверяем, содержит ли URL постера полный путь или только имя файла
            let posterUrl = movie.poster_url;
            if (posterUrl && !posterUrl.startsWith('http')) {
              posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
            }
            
            return {
              id: movie.movieId,
              title: movie.title,
              rating: movie.average_rating.toFixed(1),
              poster: posterUrl,
              year: movie.year || 2000,
              genres: movie.genres || []
            };
          });
          
          // Проверяем, не была ли отменена загрузка
          if (cancelLoad) {
            return;
          }
          
          setMovies(formattedMovies);
          
          if (searchQuery.trim() !== '') {
            setSearchInputDisabled(true);
            setFiltersDisabled(true);
            
            setSelectedGenres([]);
            setSelectedRatings([]);
            setYearRange({ minYear: 1874, maxYear: 2016 });
            setGenreFilterActive(false);
            setRatingFilterActive(false);
            setYearFilterActive(false);
          }
          
          setTimeout(() => {
            // Проверяем, не была ли отменена загрузка
            if (!cancelLoad) {
              setShowMovies(true);
              document.body.style.overflow = 'auto';
              // Скрываем индикатор загрузки
              setIsLoading(false);
            }
          }, 100);
        };
        
        fetchMovies();
      } catch (error) {
        console.error('Ошибка при поиске фильмов:', error);
        // Проверяем, не была ли отменена загрузка
        if (!cancelLoad) {
          // Вместо alert показываем сообщение в интерфейсе
          setNoResults(true);
          setNoResultsMessage('Произошла ошибка при поиске фильмов. Пожалуйста, попробуйте снова.');
          setShowMovies(false);
          // Скрываем индикатор загрузки
          setIsLoading(false);
        }
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchInputDisabled(false);
    setFiltersDisabled(false);
    setShowMovies(false);
  };

  const handleUserIdChange = (e) => {
    setUserIdInput(e.target.value);
  };    
  
  const handleUserIdSearch = async (e) => {
    if (e.key === 'Enter') {
      try {
        // Сохраняем введенный ID пользователя
        setUserId(userIdInput);
        
        // Выбираем, какой API метод вызвать в зависимости от активной вкладки
        if (activeTab === 'popular') {
          // Запрос рекомендаций популярных фильмов у пользователей с похожим вкусом
          fetchSimilarUsersRecommendations(userIdInput);
        } else {
          // Запрос персональных рекомендаций на основе оценок
          fetchPersonalRecommendations(userIdInput);
        }
      } catch (error) {
        console.error('Ошибка при получении рекомендаций:', error);
      }
    }
  };

  const handleMovieClick = (movieId) => {
    // Сохраняем текущее состояние всех фильтров и настроек
    const currentState = {
        fromMain: true,
        scrollPosition,
        searchQuery,
        userIdInput,
      userId,
        userTitle,
        selectedGenres,
        selectedRatings,
        bestFirst,
      yearRange: {
        minYear: yearRange.minYear,
        maxYear: yearRange.maxYear
      },
        genreFilterActive,
        ratingFilterActive,
        yearFilterActive,
        movies,
        showMovies,
        activeTab
    };
    
    console.log('Сохраняем состояние при переходе на детальную страницу:', currentState);
    
    navigate(`/movie/${movieId}`, { state: currentState });
  };

  const toggleGenreSelection = (genre) => {
    setTempSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const toggleRatingSelection = (rating) => {
    setTempSelectedRatings(prev => 
      prev.includes(rating) ? [] : [rating]
    );
  };

  const toggleBestFirst = () => {
    setTempBestFirst(prev => !prev);
  };

  const handleYearChange = (range) => {
    setTempYearRange(range);
  };

  // Функция для применения фильтров напрямую без setTimeout
  const applyFiltersDirectly = () => {
    if (!userIdInput) return;

    // Подготовка параметров фильтрации
    const params = new URLSearchParams();
    
    // Добавляем жанры, если они выбраны
    if (selectedGenres.length > 0) {
      selectedGenres.forEach(genre => {
        params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
      });
    }
    
    // Добавляем минимальный рейтинг, если он выбран
    if (selectedRatings.length > 0) {
      const minRating = parseInt(selectedRatings[0].charAt(0));
      params.append('min_rating', minRating);
    }
    
    // Добавляем диапазон лет, если он изменен от дефолтного
    if (yearRange.minYear !== 1874) {
      params.append('year_from', yearRange.minYear);
    }
    
    if (yearRange.maxYear !== 2016) {
      params.append('year_to', yearRange.maxYear);
    }
    
    // Выбираем API-эндпоинт в зависимости от активной вкладки
    const endpoint = activeTab === 'popular' 
      ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
      : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
    
    // Выполняем запрос с фильтрацией
    fetchFilteredRecommendations(endpoint, params);
  };

  const applyGenreFilter = () => {
    if (tempSelectedGenres.length > 0) {
      setSelectedGenres(tempSelectedGenres);
      setGenreFilterActive(true);
      setShowGenreModal(false);
      
      // Если есть ID пользователя, применяем фильтры к API немедленно
      if (userIdInput) {
        setUserId(userIdInput);
        // Применяем фильтры с новыми значениями напрямую
        const params = new URLSearchParams();
        
        tempSelectedGenres.forEach(genre => {
          params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
        });
        
        if (selectedRatings.length > 0) {
          const minRating = parseInt(selectedRatings[0].charAt(0));
          params.append('min_rating', minRating);
        }
        
        if (yearRange.minYear !== 1874) {
          params.append('year_from', yearRange.minYear);
        }
        
        if (yearRange.maxYear !== 2016) {
          params.append('year_to', yearRange.maxYear);
        }
        
        const endpoint = activeTab === 'popular' 
          ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
          : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
        
        fetchFilteredRecommendations(endpoint, params);
      }
    } else {
      setShowGenreModal(false);
    }
  };

  const resetGenreFilter = () => {
    setTempSelectedGenres([]);
    setSelectedGenres([]);
    setGenreFilterActive(false);
    setShowGenreModal(false);
    
    // Если есть ID пользователя, обновляем результаты без фильтра по жанру
    if (userIdInput) {
      setUserId(userIdInput);
      
      // Применяем фильтры без жанра напрямую
      const params = new URLSearchParams();
      
      if (selectedRatings.length > 0) {
        const minRating = parseInt(selectedRatings[0].charAt(0));
        params.append('min_rating', minRating);
      }
      
      if (yearRange.minYear !== 1874) {
        params.append('year_from', yearRange.minYear);
      }
      
      if (yearRange.maxYear !== 2016) {
        params.append('year_to', yearRange.maxYear);
      }
      
      const endpoint = activeTab === 'popular' 
        ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
        : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
      
      fetchFilteredRecommendations(endpoint, params);
    }
  };

  const applyRatingFilter = () => {
    if (tempSelectedRatings.length > 0 || tempBestFirst !== bestFirst) {
      setSelectedRatings(tempSelectedRatings);
      setBestFirst(tempBestFirst);
      setRatingFilterActive(true);
      setShowRatingModal(false);
      
      // Если есть ID пользователя, применяем фильтры к API
      if (userIdInput) {
        setUserId(userIdInput);
        
        // Применяем фильтры с новыми значениями напрямую
        const params = new URLSearchParams();
        
        if (selectedGenres.length > 0) {
          selectedGenres.forEach(genre => {
            params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
          });
        }
        
        if (tempSelectedRatings.length > 0) {
          const minRating = parseInt(tempSelectedRatings[0].charAt(0));
          params.append('min_rating', minRating);
        }
        
        if (yearRange.minYear !== 1874) {
          params.append('year_from', yearRange.minYear);
        }
        
        if (yearRange.maxYear !== 2016) {
          params.append('year_to', yearRange.maxYear);
        }
        
        const endpoint = activeTab === 'popular' 
          ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
          : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
        
        fetchFilteredRecommendations(endpoint, params);
      }
    } else {
      setShowRatingModal(false);
    }
  };

  const resetRatingFilter = () => {
    setTempSelectedRatings([]);
    setTempBestFirst(true);
    setSelectedRatings([]);
    setBestFirst(true);
    setRatingFilterActive(false);
    setShowRatingModal(false);
    
    // Если есть ID пользователя, обновляем результаты без фильтра по рейтингу
    if (userIdInput) {
      setUserId(userIdInput);
      
      // Применяем фильтры без рейтинга напрямую
      const params = new URLSearchParams();
      
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => {
          params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
        });
      }
      
      if (yearRange.minYear !== 1874) {
        params.append('year_from', yearRange.minYear);
      }
      
      if (yearRange.maxYear !== 2016) {
        params.append('year_to', yearRange.maxYear);
      }
      
      const endpoint = activeTab === 'popular' 
        ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
        : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
      
      fetchFilteredRecommendations(endpoint, params);
    }
  };

  // Обработчик изменения диапазона лет в слайдере
  const handleTempYearChange = (range) => {
    console.log('Получен новый диапазон лет от слайдера:', range);
    // Немедленно обновляем временный диапазон
    setTempYearRange({
      minYear: range.minYear,
      maxYear: range.maxYear
    });
  };

  // Синхронизация tempYearRange и yearRange при открытии модального окна
  useEffect(() => {
    if (showYearModal) {
      console.log('Открыт модальный фильтр по годам, текущий диапазон:', yearRange);
      // Устанавливаем временный диапазон равным текущему
      setTempYearRange({
        minYear: yearRange.minYear,
        maxYear: yearRange.maxYear
      });
    }
  }, [showYearModal, yearRange]);

  // Применение фильтра по годам
  const applyYearFilter = () => {
    console.log('Применение фильтра по годам, временный диапазон:', tempYearRange);
    
    // Всегда создаем новый объект для yearRange, чтобы избежать проблем с ссылками
    const newYearRange = { 
      minYear: tempYearRange.minYear, 
      maxYear: tempYearRange.maxYear 
    };
    
    console.log('Устанавливаем новый диапазон:', newYearRange);
    
    // Устанавливаем новый диапазон и активируем фильтр
    setYearRange(newYearRange);
      setYearFilterActive(true);
    setShowYearModal(false);
    
    // Если есть ID пользователя, применяем фильтры к API
    if (userIdInput) {
      setUserId(userIdInput);
      
      // Применяем фильтры с новыми значениями напрямую
      const params = new URLSearchParams();
      
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => {
          params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
        });
      }
      
      if (selectedRatings.length > 0) {
        const minRating = parseInt(selectedRatings[0].charAt(0));
        params.append('min_rating', minRating);
      }
      
      // Используем новый диапазон лет
      if (newYearRange.minYear !== 1874) {
        params.append('year_from', newYearRange.minYear);
      }
      
      if (newYearRange.maxYear !== 2016) {
        params.append('year_to', newYearRange.maxYear);
      }
      
      const endpoint = activeTab === 'popular' 
        ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
        : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
      
      console.log('Применяем фильтр по годам:', newYearRange);
      console.log('URL параметры:', params.toString());
      console.log('Endpoint:', endpoint);
      
      fetchFilteredRecommendations(endpoint, params);
    }
  };

  const resetYearFilter = () => {
    // Создаем новый объект с дефолтными значениями
    const defaultYearRange = { minYear: 1874, maxYear: 2016 };
    
    // Обновляем оба состояния
    setTempYearRange(defaultYearRange);
    setYearRange(defaultYearRange);
    
    // Сбрасываем флаг активности фильтра
    setYearFilterActive(false);
    
    // Закрываем модальное окно
    setShowYearModal(false);
    
    // Если есть ID пользователя, обновляем результаты без фильтра по году
    if (userIdInput) {
      setUserId(userIdInput);
      
      // Применяем фильтры без года напрямую
      const params = new URLSearchParams();
      
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => {
          params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
        });
      }
      
      if (selectedRatings.length > 0) {
        const minRating = parseInt(selectedRatings[0].charAt(0));
        params.append('min_rating', minRating);
      }
      
      const endpoint = activeTab === 'popular' 
        ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
        : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
      
      console.log('Сбрасываем фильтр по годам');
      console.log('URL параметры:', params.toString());
      
      fetchFilteredRecommendations(endpoint, params);
    }
  };

  useEffect(() => {
    if (showGenreModal) {
      setTempSelectedGenres(selectedGenres);
    }
  }, [showGenreModal, selectedGenres]);

  useEffect(() => {
    if (showRatingModal) {
      setTempSelectedRatings(selectedRatings);
      setTempBestFirst(bestFirst);
    }
  }, [showRatingModal, selectedRatings, bestFirst]);

  useEffect(() => {
    if (showYearModal) {
      setTempYearRange(yearRange);
    }
  }, [showYearModal, yearRange]);

  // Клиентская фильтрация (применяется только для поиска по названию)
  const filteredMovies = movies.filter(movie => {
    let passes = true;

    if (genreFilterActive && selectedGenres.length > 0) {
      passes = passes && selectedGenres.some(genre => movie.genres.includes(genre));
    }

    if (ratingFilterActive && selectedRatings.length > 0) {
      const minRating = parseInt(selectedRatings[0].charAt(0));
      passes = passes && parseFloat(movie.rating) >= minRating;
    }

    if (yearFilterActive) {
      passes = passes && (movie.year >= yearRange.minYear && movie.year <= yearRange.maxYear);
    }

    return passes;
  });

  // Фильмы по умолчанию отсортированы по рейтингу на сервере
  const sortedMovies = [...(filteredMovies.length > 0 ? filteredMovies : movies)];

  const applyFilters = () => {
    if (!userIdInput) return;

    // Подготовка параметров фильтрации
    const params = new URLSearchParams();
    
    // Добавляем жанры, если они выбраны
    if (selectedGenres.length > 0) {
      selectedGenres.forEach(genre => {
        params.append('genres', GENRE_TRANSLATIONS[genre] || genre);
      });
    }
    
    // Добавляем минимальный рейтинг, если он выбран
    if (selectedRatings.length > 0) {
      const minRating = parseInt(selectedRatings[0].charAt(0));
      params.append('min_rating', minRating);
    }
    
    // Добавляем диапазон лет, если он изменен от дефолтного
    if (yearRange.minYear !== 1874) {
      params.append('year_from', yearRange.minYear);
    }
    
    if (yearRange.maxYear !== 2016) {
      params.append('year_to', yearRange.maxYear);
    }
    
    // Выбираем API-эндпоинт в зависимости от активной вкладки
    const endpoint = activeTab === 'popular' 
      ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
      : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
    
    // Выполняем запрос с фильтрацией
    fetchFilteredRecommendations(endpoint, params);
  };
  
  const fetchFilteredRecommendations = async (endpoint, params) => {
    try {
      // Сбрасываем флаг отмены
      setCancelLoad(false);
      
      const url = `${endpoint}?${params.toString()}`;
      console.log('Отправка запроса:', url);
      
      // Показываем индикатор загрузки
      setIsLoading(true);
      setShowMovies(false);
      
      const response = await fetch(url);
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      if (!response.ok) {
        throw new Error('Не удалось получить отфильтрованные рекомендации');
      }
      
      const data = await response.json();
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      console.log('Получены отфильтрованные рекомендации:', data);
      
      // Проверяем, содержит ли ответ сообщение об ошибке
      if (data.message) {
        console.log('Получен ответ с ошибкой:', data);
        
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        // Используем сообщение из ответа сервера или дефолтное
        setNoResultsMessage('Для этого пользователя нет рекомендаций.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      // Определяем формат ответа и извлекаем список фильмов
      let moviesList = [];
      
      if (Array.isArray(data)) {
        // Если API вернул массив фильмов напрямую
        moviesList = data;
      } else if (data && data.recommendations && Array.isArray(data.recommendations)) {
        // Если API вернул объект с полем recommendations
        moviesList = data.recommendations;
      } else {
        throw new Error('Неверный формат ответа от API');
      }
      
      // Сбрасываем состояние отсутствия результатов
      setNoResults(false);
      setNoResultsMessage('');
      
      // Проверяем, что список фильмов не пустой
      if (moviesList.length === 0) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Нет фильмов, соответствующих выбранным фильтрам.');
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      // Преобразуем полученные данные в формат, используемый в приложении
      const formattedMovies = moviesList.map(movie => {
        // Проверяем, содержит ли URL постера полный путь или только имя файла
        let posterUrl = movie.poster_url;
        if (posterUrl && !posterUrl.startsWith('http')) {
          posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
        }
        
        return {
          id: movie.movieId,
          title: movie.title,
          rating: movie.average_rating.toFixed(1),
          poster: posterUrl,
          year: movie.year || 2000,
          genres: movie.genres || []
        };
      });
      
      // Проверяем, не была ли отменена загрузка
      if (cancelLoad) {
        return;
      }
      
      console.log('Отформатированные фильмы:', formattedMovies);
      
      // Обновляем состояние с новыми фильмами
      setMovies(formattedMovies);
      
      // Отображаем результаты
      setShowMovies(true);
      // Скрываем индикатор загрузки
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при получении отфильтрованных рекомендаций:', error);
      // Проверяем, не была ли отменена загрузка
      if (!cancelLoad) {
        // Вместо alert показываем сообщение в интерфейсе
        setNoResults(true);
        setNoResultsMessage('Произошла ошибка при применении фильтров. Пожалуйста, попробуйте еще раз.');
        setShowMovies(false);
        // Скрываем индикатор загрузки
        setIsLoading(false);
      }
    }
  };

  // Функция для возврата на главную страницу (как двойное нажатие кнопки "назад" в браузере)
  const handleBackToMain = () => {
    // Используем window.history для определения, насколько глубоко мы находимся
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Если мы на странице похожих фильмов, то нужно вернуться на 2 шага назад
    if (pathSegments[0] === 'similar') {
      // Сначала вернемся к карточке фильма
      navigate(-1);
      
      // Затем используем setTimeout, чтобы вернуться на главную после обновления истории
      setTimeout(() => {
        navigate(-1);
      }, 10);
    } else {
      // На всякий случай, если мы не на странице похожих фильмов
      navigate('/');
    }
  };

  // Функция для возврата на карточку фильма (как нажатие кнопки "назад" в браузере)
  const handleBackToMovie = () => {
    navigate(-1);
  };
  
  // Функция для обработки отмены загрузки
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setIsLoading(false);
    
    // Если мы находимся на странице похожих фильмов, показываем сообщение
    if (location.pathname.includes('/similar/')) {
      setNoResults(true);
      setNoResultsMessage('Загрузка была отменена пользователем');
      setShowMovies(false);
    }
    
    // Сбрасываем флаг отмены через небольшую задержку
    setTimeout(() => {
      setCancelLoad(false);
    }, 100);
  };

  // Проверяем, находимся ли мы на странице похожих фильмов
  const isSimilarPage = location.pathname.includes('/similar/');

  return (
    <>
      {isLoading && (
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
      )}
      
    <div className={styles.container}>
        {!isSimilarPage ? (
          // Обычный интерфейс для главной страницы
          <>
      {/* Top Card */}
      <div className={styles.topCard}>
        <div className={styles.cardContent}>
          <h1 className={styles.mainTitle}>Кино на любой вкус</h1>
          <p className={styles.subtitle}>Уникальные рекомендации, основанные на ваших предпочтениях.</p>
          
          <div className={styles.tabButtons}>
            <button 
              className={activeTab === 'personal' ? styles.activeButton : styles.inactiveButton}
              onClick={() => handleTabChange('personal')}
            >
              Персональные рекомендации
            </button>
            <button 
              className={activeTab === 'popular' ? styles.activeButton : styles.inactiveButton}
              onClick={() => handleTabChange('popular')}
            >
              Популярно у пользователей с похожим вкусом
            </button>
          </div>

          <div className={styles.tapeContainer}>
            <img src={tape} alt="Tape" className={styles.tape} />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Поиск по названию..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            disabled={searchInputDisabled}
          />
          {searchQuery && (
            <button 
              className={styles.clearSearchButton} 
              onClick={handleClearSearch}
              aria-label="Очистить поиск"
            >
              <img src={clearIcon} alt="Очистить" className={styles.clearIcon} />
            </button>
          )}
        </div>

        <button 
          className={genreFilterActive 
            ? `${styles.filterButton} ${styles.activeFilterButton}` 
            : filtersDisabled 
              ? `${styles.filterButton} ${styles.disabledFilterButton}` 
              : styles.filterButton
          }
          onClick={() => !filtersDisabled && setShowGenreModal(true)}
          disabled={filtersDisabled}
        >
          <img src={genreIcon} alt="Genre" className={styles.filterIcon} />
          <span>Жанр</span>
        </button>
        
        <button 
          className={ratingFilterActive 
            ? `${styles.filterButton} ${styles.activeFilterButton}` 
            : filtersDisabled 
              ? `${styles.filterButton} ${styles.disabledFilterButton}` 
              : styles.filterButton
          }
          onClick={() => !filtersDisabled && setShowRatingModal(true)}
          disabled={filtersDisabled}
        >
          <img src={rateIcon} alt="Rating" className={styles.filterIcon} />
          <span>Рейтинг</span>
        </button>

        <button 
          className={yearFilterActive 
            ? `${styles.filterButton} ${styles.activeFilterButton}` 
            : filtersDisabled 
              ? `${styles.filterButton} ${styles.disabledFilterButton}` 
              : styles.filterButton
          }
          onClick={() => !filtersDisabled && setShowYearModal(true)}
          disabled={filtersDisabled}
        >
          <img src={yearIcon} alt="Year" className={styles.filterIcon} />
          <span>Год</span>
        </button>
      </div>

      {/* User ID Section */}
      <div className={styles.userSection}>
        <h2 className={styles.userTitle}>{userTitle}</h2>
        <div className={styles.userIdSearch}>
          <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Выбрать id пользователя..." 
            className={styles.userIdInput}
            value={userIdInput}
            onChange={handleUserIdChange}
            onKeyDown={handleUserIdSearch}
          />
        </div>
      </div>
          </>
        ) : (
          // Упрощенный интерфейс для страницы похожих фильмов
          <div className={styles.similarPageHeader}>
            <div className={styles.navigationButtons}>
              <button 
                className={styles.navigationButton}
                onClick={handleBackToMovie}
              >
                Вернуться на карточку фильма
              </button>
              <button 
                className={styles.navigationButton}
                onClick={handleBackToMain}
              >
                Вернуться в предыдущий раздел
              </button>
            </div>
            <h2 className={styles.similarPageTitle}>{userTitle}</h2>
          </div>
        )}

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
                    e.target.style.backgroundColor = '#2B275F';
                    e.target.style.display = 'flex';
                    e.target.style.alignItems = 'center';
                    e.target.style.justifyContent = 'center';
                    e.target.style.color = '#EFCFFF';
                    e.target.style.fontSize = '14px';
                    e.target.style.padding = '10px';
                    e.target.style.textAlign = 'center';
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
        <div className={styles.placeholder}>
          Введите название фильма или ID пользователя для поиска фильмов
        </div>
      )}

      {/* Filter Modals */}
      <FilterModal
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        title="Выберите жанры"
        onApply={applyGenreFilter}
        onReset={resetGenreFilter}
      >
        <div className={filterStyles.filterGroup}>
          {genres.map(genre => (
            <div 
              key={genre}
              className={`${filterStyles.filterOption} ${tempSelectedGenres.includes(genre) ? filterStyles.active : ''}`}
              onClick={() => toggleGenreSelection(genre)}
            >
              <input
                type="checkbox"
                checked={tempSelectedGenres.includes(genre)}
                onChange={() => toggleGenreSelection(genre)}
                className={filterStyles.checkbox}
              />
              <span>{GENRE_TRANSLATIONS[genre] || genre}</span>
            </div>
          ))}
        </div>
      </FilterModal>

      <FilterModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Выберите рейтинг"
        onApply={applyRatingFilter}
        onReset={resetRatingFilter}
      >
        <div className={filterStyles.ratingOptions}>
          {ratingOptions.map(rating => (
            <div 
              key={rating}
              className={`${filterStyles.filterOption} ${tempSelectedRatings.includes(rating) ? filterStyles.active : ''}`}
              onClick={() => toggleRatingSelection(rating)}
            >
              <input
                type="radio"
                checked={tempSelectedRatings.includes(rating)}
                onChange={() => toggleRatingSelection(rating)}
                className={filterStyles.radioInput}
                name="rating-option"
              />
              <span>{rating}</span>
            </div>
          ))}
        </div>
      </FilterModal>

      <FilterModal
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        title="Выберите год"
        onApply={applyYearFilter}
        onReset={resetYearFilter}
      >
        <YearSlider 
          onChange={handleTempYearChange} 
          initialYearRange={tempYearRange} 
          minYear={1874} 
          maxYear={2016} 
        />
      </FilterModal>
    </div>
    </>
  );
} 