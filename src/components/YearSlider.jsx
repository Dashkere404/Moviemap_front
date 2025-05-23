import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./FilterModal.module.css";

const YearSlider = ({
  minYear = 1874,
  maxYear = 2016,
  onChange,
  initialYearRange,
}) => {
  // Состояния для текущих значений ползунков
  const [minValue, setMinValue] = useState(
    initialYearRange?.minYear || minYear,
  );
  const [maxValue, setMaxValue] = useState(
    initialYearRange?.maxYear || maxYear,
  );
  const [activeThumb, setActiveThumb] = useState(null);

  // Рефы для DOM-элементов
  const sliderRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);

  // Флаг для отслеживания состояния перетаскивания
  const isDraggingRef = useRef(false);

  // Обновляем значения при изменении initialYearRange извне
  useEffect(() => {
    if (initialYearRange && !isDraggingRef.current) {
      setMinValue(initialYearRange.minYear);
      setMaxValue(initialYearRange.maxYear);
    }
  }, [initialYearRange]);

  // Мемоизируем функцию обновления значений для предотвращения лишних рендеров
  const handleChange = useCallback(() => {
    // Уведомляем родительский компонент об изменениях
    onChange({
      minYear: minValue,
      maxYear: maxValue,
    });
  }, [minValue, maxValue, onChange]);

  // Явно вызываем onChange при изменении значений
  useEffect(() => {
    handleChange();
  }, [handleChange]);

  // Вычисляем процент для позиционирования ползунков
  const getPercent = useCallback((value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  }, [minYear, maxYear]);

  // Вычисляем значение из позиции курсора
  const getValueFromPosition = useCallback((position) => {
    if (!sliderRef.current) return 0;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const percent = (position - sliderRect.left) / sliderRect.width;
    const value = Math.round(minYear + percent * (maxYear - minYear));

    return Math.max(minYear, Math.min(maxYear, value));
  }, [minYear, maxYear]);

  // Обработчик нажатия на ползунок (мышь)
  const handleThumbMouseDown = useCallback((e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;

    // Обработчик перемещения мыши
    const handleMouseMove = (moveEvent) => {
      if (!sliderRef.current) return;

      const newValue = getValueFromPosition(moveEvent.clientX);

      if (thumb === "min" && newValue < maxValue) {
        setMinValue(newValue);
      } else if (thumb === "max" && newValue > minValue) {
        setMaxValue(newValue);
      }
    };

    // Обработчик отпускания кнопки мыши
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Задержка для предотвращения мерцания
      setTimeout(() => {
        isDraggingRef.current = false;
        setActiveThumb(null);
      }, 50);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [getValueFromPosition, maxValue, minValue]);

  // Обработчик нажатия на ползунок (тач)
  const handleTouchStart = useCallback((e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;

    // Обработчик перемещения пальца
    const handleTouchMove = (moveEvent) => {
      if (!sliderRef.current || !moveEvent.touches[0]) return;

      const newValue = getValueFromPosition(moveEvent.touches[0].clientX);

      if (thumb === "min" && newValue < maxValue) {
        setMinValue(newValue);
      } else if (thumb === "max" && newValue > minValue) {
        setMaxValue(newValue);
      }
    };

    // Обработчик отпускания пальца
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      // Задержка для предотвращения мерцания
      setTimeout(() => {
        isDraggingRef.current = false;
        setActiveThumb(null);
      }, 50);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  }, [getValueFromPosition, maxValue, minValue]);

  return (
    <div className={styles.rangeContainer}>
      <div className={styles.yearSlider} ref={sliderRef}>
        {/* Track background */}
        <div className={styles.sliderBackground}></div>

        {/* Active track */}
        <div
          className={styles.sliderTrack}
          style={{
            left: `${getPercent(minValue)}%`,
            width: `${getPercent(maxValue) - getPercent(minValue)}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={`${styles.sliderThumb} ${activeThumb === "min" ? styles.active : ""}`}
          ref={minThumbRef}
          style={{ left: `${getPercent(minValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={minValue}
          tabIndex={0}
        >
          <div className={styles.valueLabel}>{minValue}</div>
        </div>

        {/* Max thumb */}
        <div
          className={`${styles.sliderThumb} ${activeThumb === "max" ? styles.active : ""}`}
          ref={maxThumbRef}
          style={{ left: `${getPercent(maxValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, "max")}
          onTouchStart={(e) => handleTouchStart(e, "max")}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={maxValue}
          tabIndex={0}
        >
          <div className={styles.valueLabel}>{maxValue}</div>
        </div>
      </div>

      {/* Отображение текущего диапазона - скрываем */}
      {/*
      <div className={styles.yearRangeDisplay}>
        Выбран диапазон: {minValue} - {maxValue}
      </div>
      */}

      {/* Hidden inputs for form submission and accessibility */}
      <input type="hidden" name="min-year" value={minValue} />
      <input type="hidden" name="max-year" value={maxValue} />
    </div>
  );
};

// Используем React.memo для предотвращения ненужных перерисовок
export default React.memo(YearSlider);
