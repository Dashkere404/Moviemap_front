import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import searchIcon from '../assets/search.svg';
import genreIcon from '../assets/genre.svg';
import rateIcon from '../assets/rate.svg';
import yearIcon from '../assets/year.svg';
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

const posters = [poster1, poster2, poster3, poster4, poster5]; // Массив с импортированными постерами

// Genre list
const genres = [
  'Action', 'Adventure', 'Animation', "Children's", 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'Musical',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];

// Rating options
const ratingOptions = ['1+', '2+', '3+', '4+', '5'];

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

  // Filter states
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [bestFirst, setBestFirst] = useState(true);
  const [yearRange, setYearRange] = useState({ minYear: 1874, maxYear: 2016 });
  
  const [genreFilterActive, setGenreFilterActive] = useState(false);
  const [ratingFilterActive, setRatingFilterActive] = useState(false);
  const [yearFilterActive, setYearFilterActive] = useState(false);
  
  // Add a state to store the scroll position
  const [scrollPosition, setScrollPosition] = useState(0);

  // Modify the useEffect to restore all states
  useEffect(() => {
    // Check if returning from movie details with saved state
    if (location.state) {
      // Don't scroll to top if we have a saved position
      if (location.state.scrollPosition) {
        // Delay scrolling to ensure the DOM is fully loaded
        setTimeout(() => {
          window.scrollTo(0, location.state.scrollPosition);
        }, 100);
      } else {
        // If no saved position, scroll to top
        window.scrollTo(0, 0);
      }

      // Restore search query and user ID
      if (location.state.searchQuery) {
        setSearchQuery(location.state.searchQuery);
      }
      if (location.state.userIdInput) {
        setUserIdInput(location.state.userIdInput);
        if (location.state.userTitle) {
          setUserTitle(location.state.userTitle);
        }
      }
      
      // Restore filter states
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
      
      // Restore filter active states
      if (location.state.genreFilterActive !== undefined) {
        setGenreFilterActive(location.state.genreFilterActive);
      }
      if (location.state.ratingFilterActive !== undefined) {
        setRatingFilterActive(location.state.ratingFilterActive);
      }
      if (location.state.yearFilterActive !== undefined) {
        setYearFilterActive(location.state.yearFilterActive);
      }
      
      // Restore movies if available
      if (location.state.movies && location.state.movies.length > 0) {
        setMovies(location.state.movies);
        setShowMovies(true);
      }
    } else {
      // If not returning from movie details, scroll to top
      window.scrollTo(0, 0);
    }
    
    // Check if this is "Similar Movies" view
    if (location.pathname.includes('/similar/') && movieId) {
      setUserTitle(`Похожие фильмы`);
      fetchSimilarMovies(movieId);
    }
    
    // Save scroll position when navigating away
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function to reset when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [location, movieId]);

  const fetchSimilarMovies = async (id) => {
    // This function would fetch similar movies from the backend
    // For now, we're using mock data
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
    // Helper to generate random genres for mock data
    const numberOfGenres = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfGenres);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Mock search functionality - would fetch movie data based on search query
      // Mock data with 50 movies for demonstration

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
      
      // Set timeout to allow the DOM to update before showing movies
      setTimeout(() => {
        setShowMovies(true);
        // Ensure scrolling is enabled
        document.body.style.overflow = 'auto';
      }, 100);
    }
  };

  const handleUserIdChange = (e) => {
    setUserIdInput(e.target.value);
  };    
  
  const handleUserIdSearch = async (e) => {
    if (e.key === 'Enter') {
      try {
        // Real API call that would be used
        // const response = await fetch(`/recommend/by-ratings/${userIdInput}`);
        // const data = await response.json();
        // setMovies(data.recommendations);
        
        // Mock data for now
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
        
        // Set timeout to allow the DOM to update before showing movies
        setTimeout(() => {
          setShowMovies(true);
          // Ensure scrolling is enabled
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

  // Filter handling functions
  const toggleGenreSelection = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const toggleRatingSelection = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? [] : [rating]
    );
  };

  const toggleBestFirst = () => {
    setBestFirst(prev => !prev);
  };

  const handleYearChange = (range) => {
    setYearRange(range);
  };

  // Filter apply and reset functions
  const applyGenreFilter = () => {
    if (selectedGenres.length > 0) {
      setGenreFilterActive(true);
      // Filter movies logic would go here in the real app
      // For now, we'll just close the modal
      setShowGenreModal(false);
    }
  };

  const resetGenreFilter = () => {
    setSelectedGenres([]);
    setGenreFilterActive(false);
    setShowGenreModal(false);
    // Reset filter logic would go here
  };

  const applyRatingFilter = () => {
    if (selectedRatings.length > 0 || bestFirst) {
      setRatingFilterActive(true);
      // Filter movies logic would go here
      setShowRatingModal(false);
    } else {
      // If no rating is selected but we still want to close the modal
      setShowRatingModal(false);
    }
  };

  const resetRatingFilter = () => {
    setSelectedRatings([]);
    setBestFirst(true);
    setRatingFilterActive(false);
    setShowRatingModal(false);
    // Reset filter logic would go here
  };

  const applyYearFilter = () => {
    setYearFilterActive(true);
    // Filter movies logic would go here
    setShowYearModal(false);
  };

  const resetYearFilter = () => {
    setYearRange({ minYear: 1874, maxYear: 2016 });
    setYearFilterActive(false);
    setShowYearModal(false);
    // Reset filter logic would go here
  };

  // Filtered movies
  const filteredMovies = movies.filter(movie => {
    let passes = true;

    if (genreFilterActive && selectedGenres.length > 0) {
      passes = passes && selectedGenres.some(genre => movie.genres.includes(genre));
    }

    if (ratingFilterActive && selectedRatings.length > 0) {
      // For single selection, we just check if the movie rating is greater than or equal to the selected rating
      const minRating = parseInt(selectedRatings[0].charAt(0));
      passes = passes && parseFloat(movie.rating) >= minRating;
    }

    if (yearFilterActive) {
      passes = passes && (movie.year >= yearRange.minYear && movie.year <= yearRange.maxYear);
    }

    return passes;
  });

  // Sort movies if bestFirst is enabled
  const sortedMovies = [...(filteredMovies.length > 0 ? filteredMovies : movies)];
  if (ratingFilterActive && bestFirst) {
    sortedMovies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
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
          />
        </div>

        <button 
          className={genreFilterActive ? `${styles.filterButton} ${styles.activeFilterButton}` : styles.filterButton}
          onClick={() => setShowGenreModal(true)}
        >
          <img src={genreIcon} alt="Genre" className={styles.filterIcon} />
          <span>Жанр</span>
        </button>
        
        <button 
          className={ratingFilterActive ? `${styles.filterButton} ${styles.activeFilterButton}` : styles.filterButton}
          onClick={() => setShowRatingModal(true)}
        >
          <img src={rateIcon} alt="Rating" className={styles.filterIcon} />
          <span>Рейтинг</span>
        </button>

        <button 
          className={yearFilterActive ? `${styles.filterButton} ${styles.activeFilterButton}` : styles.filterButton}
          onClick={() => setShowYearModal(true)}
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
              className={`${filterStyles.filterOption} ${selectedGenres.includes(genre) ? filterStyles.active : ''}`}
              onClick={() => toggleGenreSelection(genre)}
            >
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenreSelection(genre)}
                className={filterStyles.checkbox}
              />
              <span>{genre}</span>
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
              className={`${filterStyles.filterOption} ${selectedRatings.includes(rating) ? filterStyles.active : ''}`}
              onClick={() => toggleRatingSelection(rating)}
            >
              <input
                type="radio"
                checked={selectedRatings.includes(rating)}
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
            className={`${filterStyles.filterOption} ${bestFirst ? filterStyles.active : ''}`}
            onClick={toggleBestFirst}
          >
            <input
              type="checkbox"
              checked={bestFirst}
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
        <YearSlider onChange={handleYearChange} />
      </FilterModal>
    </div>
  );
} 