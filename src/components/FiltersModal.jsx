import { useState, useEffect, useRef } from "react";
import styles from "./FilterModal.module.css";
import YearSlider from "./YearSlider";
import genreIcon from "../assets/genre.svg";
import rateIcon from "../assets/rate.svg";
import yearIcon from "../assets/year.svg";

export default function FiltersModal({
  isOpen,
  onClose,
  genres,
  ratingOptions,
  selectedGenres,
  selectedRatings,
  yearRange,
  bestFirst,
  genreTranslations,
  onApply,
  onClear,
}) {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // Временные состояния для фильтров
  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
  const [tempYearRange, setTempYearRange] = useState({
    minYear: 1874,
    maxYear: 2016,
  });
  // Всегда устанавливаем true, так как убрали кнопку выбора
  const tempBestFirst = true;

  // Инициализация временных состояний при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setTempSelectedGenres([...selectedGenres]);
      setTempSelectedRatings([...selectedRatings]);
      setTempYearRange({ ...yearRange });
      // Больше не обновляем tempBestFirst, он всегда true
    }
  }, [isOpen, selectedGenres, selectedRatings, yearRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 50);
  };

  const handleApply = () => {
    // Принудительно обновляем состояния перед вызовом onApply
    const filters = {
      selectedGenres: [...tempSelectedGenres],
      selectedRatings: [...tempSelectedRatings],
      yearRange: { ...tempYearRange },
      bestFirst: true, // Всегда передаем true
    };

    console.log("Применяем фильтры из модального окна:", filters);

    // Сразу закрываем модальное окно
    setIsClosing(true);
    onClose();

    // И только потом вызываем onApply с небольшой задержкой
    setTimeout(() => {
      onApply(filters);
      setIsClosing(false);
    }, 50);
  };

  const handleApplyEmpty = () => {
    // Применяем пустые фильтры
    const emptyFilters = {
      selectedGenres: [],
      selectedRatings: [],
      yearRange: { minYear: 1874, maxYear: 2016 },
      bestFirst: true, // Всегда передаем true
    };

    console.log("Применяем пустые фильтры:", emptyFilters);

    // Сразу закрываем модальное окно
    setIsClosing(true);
    onClose();

    // И только потом вызываем onApply с небольшой задержкой
    setTimeout(() => {
      onApply(emptyFilters);
      setIsClosing(false);
    }, 50);
  };

  const toggleGenreSelection = (genre) => {
    setTempSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const toggleRatingSelection = (rating) => {
    setTempSelectedRatings((prev) => {
      if (prev.includes(rating)) {
        return [];
      } else {
        return [rating];
      }
    });
  };

  const handleTempYearChange = (range) => {
    setTempYearRange(range);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Фильтры</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          {/* Жанры */}
          <div>
            <h3 className={styles.modalSubtitle}>
              <img src={genreIcon} alt="Жанры" className={styles.filterIcon} />
              Жанры
            </h3>
            <div className={styles.filterGroup}>
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={`${styles.filterOption} ${tempSelectedGenres.includes(genre) ? styles.active : ""}`}
                  onClick={() => toggleGenreSelection(genre)}
                >
                  <div className={styles.checkboxContainer}>
                    <div
                      className={`${styles.customCheckbox} ${tempSelectedGenres.includes(genre) ? styles.checked : ""}`}
                    >
                      {tempSelectedGenres.includes(genre) && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </div>
                  </div>
                  <span>{genreTranslations[genre] || genre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Рейтинг */}
          <div style={{ marginTop: "30px" }}>
            <h3 className={styles.modalSubtitle}>
              <img src={rateIcon} alt="Рейтинг" className={styles.filterIcon} />
              Рейтинг
            </h3>
            <div className={styles.ratingOptions}>
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  className={`${styles.filterOption} ${tempSelectedRatings.includes(rating) ? styles.active : ""}`}
                  onClick={() => toggleRatingSelection(rating)}
                >
                  <div className={styles.radioContainer}>
                    <div
                      className={`${styles.customRadio} ${tempSelectedRatings.includes(rating) ? styles.checked : ""}`}
                    >
                      {tempSelectedRatings.includes(rating) && (
                        <span className={styles.radioDot}></span>
                      )}
                    </div>
                  </div>
                  <span>{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Годы */}
          <div style={{ marginTop: "30px" }}>
            <h3 className={styles.modalSubtitle}>
              <img src={yearIcon} alt="Годы" className={styles.filterIcon} />
              Год
            </h3>
            <YearSlider
              minYear={1874}
              maxYear={2016}
              initialYearRange={tempYearRange}
              onChange={handleTempYearChange}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.resetApplyButton}
            onClick={handleApplyEmpty}
            disabled={isClosing}
          >
            Сбросить фильтры
          </button>
          <button
            className={styles.applyButton}
            onClick={handleApply}
            disabled={isClosing}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
