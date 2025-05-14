import { useState, useEffect, useRef } from 'react';
import styles from './FilterModal.module.css';

export default function YearSlider({ minYear = 1874, maxYear = 2016, onChange, initialYearRange }) {
  const valueRef = useRef({
    min: initialYearRange?.minYear || minYear,
    max: initialYearRange?.maxYear || maxYear
  });
  
  const [minValue, setMinValue] = useState(valueRef.current.min);
  const [maxValue, setMaxValue] = useState(valueRef.current.max);
  const [activeThumb, setActiveThumb] = useState(null);
  
  const sliderRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);
  
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (initialYearRange && !isDraggingRef.current) {
      valueRef.current = {
        min: initialYearRange.minYear,
        max: initialYearRange.maxYear
      };
      setMinValue(initialYearRange.minYear);
      setMaxValue(initialYearRange.maxYear);
    }
  }, [initialYearRange]);

  const getPercent = (value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  };

  const getValueFromPosition = (position) => {
    if (!sliderRef.current) return 0;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const percent = (position - sliderRect.left) / sliderRect.width;
    const value = Math.round(minYear + percent * (maxYear - minYear));
    
    return Math.max(minYear, Math.min(maxYear, value));
  };

  const handleThumbMouseDown = (e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;
    
    const handleMouseMove = (moveEvent) => {
      if (!sliderRef.current) return;
      
      const newValue = getValueFromPosition(moveEvent.clientX);
      
      if (thumb === 'min' && newValue < valueRef.current.max) {
        valueRef.current.min = newValue;
        setMinValue(newValue);
      } else if (thumb === 'max' && newValue > valueRef.current.min) {
        valueRef.current.max = newValue;
        setMaxValue(newValue);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      setActiveThumb(null);
      isDraggingRef.current = false;
      
      onChange({ 
        minYear: valueRef.current.min, 
        maxYear: valueRef.current.max 
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleTouchStart = (e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;
    
    const handleTouchMove = (moveEvent) => {
      if (!sliderRef.current || !moveEvent.touches[0]) return;
      
      const newValue = getValueFromPosition(moveEvent.touches[0].clientX);
      
      if (thumb === 'min' && newValue < valueRef.current.max) {
        valueRef.current.min = newValue;
        setMinValue(newValue);
      } else if (thumb === 'max' && newValue > valueRef.current.min) {
        valueRef.current.max = newValue;
        setMaxValue(newValue);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      setActiveThumb(null);
      isDraggingRef.current = false;
      
      onChange({ 
        minYear: valueRef.current.min, 
        maxYear: valueRef.current.max 
      });
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

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
            width: `${getPercent(maxValue) - getPercent(minValue)}%`
          }}
        />
        
        {/* Min thumb */}
        <div 
          className={styles.sliderThumb}
          ref={minThumbRef}
          style={{ left: `${getPercent(minValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, 'min')}
          onTouchStart={(e) => handleTouchStart(e, 'min')}
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
          className={styles.sliderThumb}
          ref={maxThumbRef}
          style={{ left: `${getPercent(maxValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, 'max')}
          onTouchStart={(e) => handleTouchStart(e, 'max')}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={maxValue}
          tabIndex={0}
        >
          <div className={styles.valueLabel}>{maxValue}</div>
        </div>
      </div>
      
      {/* Hidden inputs for form submission and accessibility */}
      <input
        type="hidden"
        name="min-year"
        value={minValue}
      />
      <input
        type="hidden"
        name="max-year"
        value={maxValue}
      />
    </div>
  );
} 