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

import poster1 from '../assets/poster1.jpg';
import poster2 from '../assets/poster2.jpg';
import poster3 from '../assets/poster3.jpg';
import poster4 from '../assets/poster4.jpg';
import poster5 from '../assets/poster5.jpg';

const posters = [poster1, poster2, poster3, poster4, poster5]; 

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
  "Crime": "Криимнал",
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

  useEffect(() => {
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
        setYearRange(location.state.yearRange);
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
      
      if (location.state.movies && location.state.movies.length > 0) {
        setMovies(location.state.movies);
        setShowMovies(true);
      }
    } else {
      window.scrollTo(0, 0);
    }
    
    if (location.pathname.includes('/similar/') && movieId) {
      setUserTitle(`Похожие фильмы`);
      fetchSimilarMovies(movieId);
    }
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [location, movieId]);

  const fetchSimilarMovies = async (id) => {
    const mockMovies = Array(50).fill().map((_, index) => ({
      id: index + 200,
      title: `Похожий фильм ${index + 1}`,
      rating: (Math.random() * 5).toFixed(1),
      poster: posters[index % posters.length],
      year: Math.floor(Math.random() * (2016 - 1874)) + 1874,
      genres: getRandomGenres()
    }));
    
    setMovies(mockMovies);
    setShowMovies(true);
  };

  const getRandomGenres = () => {
    const numberOfGenres = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfGenres);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const movieTitles = [
        "Приключения в космосе",
        "Тайна старого замка",
        "Путешествие к центру Земли. Путешествие к центру Земли",
        "Загадка времени",
        "Секреты океана",
        "В поисках счастья",
        "Невероятные приключения",
        "Сказания древних",
        "Мир фантазий",
        "Пробуждение силы"
      ];

      const mockMovies = Array(50).fill().map((_, index) => ({
        id: index + 1,
        title: movieTitles[Math.floor(Math.random() * movieTitles.length)],
        rating: (Math.random() * 5).toFixed(1),
        poster: posters[index % posters.length],
        year: Math.floor(Math.random() * (2016 - 1874)) + 1874,
        genres: getRandomGenres()
      }));
      
      setMovies(mockMovies);
      
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
        setShowMovies(true);
        document.body.style.overflow = 'auto';
      }, 100);
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
        
        setUserTitle(`Рекомендации для пользователя ${userIdInput}`);
        const mockMovies = Array(50).fill().map((_, index) => ({
          id: index + 100,
          title: `${activeTab === 'personal' ? 'Рекомендуемый' : 'Популярный'} фильм ${index + 1}`,
          rating: (Math.random() * 5).toFixed(1),
          poster: posters[index % posters.length],
          year: Math.floor(Math.random() * (2016 - 1874)) + 1874,
          genres: getRandomGenres()
        }));
        
        setMovies(mockMovies);
        
        setSearchInputDisabled(false);
        setFiltersDisabled(false);
        
        setSearchQuery('');
        
        setTimeout(() => {
          setShowMovies(true);
          document.body.style.overflow = 'auto';
        }, 100);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`, { 
      state: { 
        fromMain: true,
        scrollPosition,
        searchQuery,
        userIdInput,
        userTitle,
        selectedGenres,
        selectedRatings,
        bestFirst,
        yearRange,
        genreFilterActive,
        ratingFilterActive,
        yearFilterActive,
        movies,
        showMovies,
        activeTab
      } 
    });
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

  const applyGenreFilter = () => {
    if (tempSelectedGenres.length > 0) {
      setSelectedGenres(tempSelectedGenres);
      setGenreFilterActive(true);
      setShowGenreModal(false);
    } else {
      setShowGenreModal(false);
    }
  };

  const resetGenreFilter = () => {
    setTempSelectedGenres([]);
    setSelectedGenres([]);
    setGenreFilterActive(false);
    setShowGenreModal(false);
  };

  const applyRatingFilter = () => {
    if (tempSelectedRatings.length > 0 || tempBestFirst !== bestFirst) {
      setSelectedRatings(tempSelectedRatings);
      setBestFirst(tempBestFirst);
      setRatingFilterActive(true);
      setShowRatingModal(false);
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
  };

  const applyYearFilter = () => {
    if (tempYearRange.minYear !== yearRange.minYear || tempYearRange.maxYear !== yearRange.maxYear) {
      setYearRange(tempYearRange);
      setYearFilterActive(true);
    }
    setShowYearModal(false);
  };

  const resetYearFilter = () => {
    const defaultYearRange = { minYear: 1874, maxYear: 2016 };
    setTempYearRange(defaultYearRange);
    setYearRange(defaultYearRange);
    setYearFilterActive(false);
    setShowYearModal(false);
  };

  const handleTempYearChange = (range) => {
    setTempYearRange(range);
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

  const sortedMovies = [...(filteredMovies.length > 0 ? filteredMovies : movies)];
  if (ratingFilterActive) {
    if (bestFirst) {
      sortedMovies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else {
      sortedMovies.sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
    }
  }

  return (
    <div className={styles.container}>
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

      {/* Movie Grid or Placeholder */}
      {showMovies ? (
        <div className={styles.movieGrid}>
          {sortedMovies.map((movie) => (
            <div 
              key={movie.id} 
              className={styles.movieCard}
              onClick={() => handleMovieClick(movie.id)}
            >
              <img src={movie.poster} alt={movie.title} className={styles.moviePoster} />
              <div className={styles.ratingBadge}>{movie.rating}</div>
              <div className={styles.movieInfo}>
                <div className={styles.movieTitle}>{movie.title}</div>
              </div>
            </div>
          ))}
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
        <div className={filterStyles.bestFirstOption}>
          <div 
            className={`${filterStyles.filterOption} ${tempBestFirst ? filterStyles.active : ''}`}
            onClick={toggleBestFirst}
          >
            <input
              type="checkbox"
              checked={tempBestFirst}
              onChange={toggleBestFirst}
              className={filterStyles.checkbox}
            />
            <span>Сначала лучшие</span>
          </div>
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
  );
} 