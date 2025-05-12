import { useState, useEffect, useRef } from 'react';
import styles from './FilterModal.module.css';

export default function YearSlider({ minYear = 1874, maxYear = 2016, onChange }) {
  const [minValue, setMinValue] = useState(minYear);
  const [maxValue, setMaxValue] = useState(maxYear);
  const [activeThumb, setActiveThumb] = useState(null);
  const sliderRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);

  useEffect(() => {
    onChange({ minYear: minValue, maxYear: maxValue });
  }, [minValue, maxValue, onChange]);

  useEffect(() => {
    // Add global event listeners when a thumb is active
    if (activeThumb) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [activeThumb, minValue, maxValue]);

  // Convert value to percentage position
  const getPercent = (value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  };

  // Convert position to value
  const getValueFromPosition = (position) => {
    if (!sliderRef.current) return 0;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const percent = (position - sliderRect.left) / sliderRect.width;
    const value = Math.round(minYear + percent * (maxYear - minYear));
    
    return Math.max(minYear, Math.min(maxYear, value));
  };

  const handleMinInputChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (newValue < maxValue) {
      setMinValue(newValue);
    }
  };

  const handleMaxInputChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (newValue > minValue) {
      setMaxValue(newValue);
    }
  };

  const handleThumbMouseDown = (e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
  };

  const handleMouseMove = (e) => {
    if (!activeThumb || !sliderRef.current) return;
    
    const newValue = getValueFromPosition(e.clientX);
    
    if (activeThumb === 'min' && newValue < maxValue) {
      setMinValue(newValue);
    } else if (activeThumb === 'max' && newValue > minValue) {
      setMaxValue(newValue);
    }
  };

  const handleTouchMove = (e) => {
    if (!activeThumb || !sliderRef.current || !e.touches[0]) return;
    
    const newValue = getValueFromPosition(e.touches[0].clientX);
    
    if (activeThumb === 'min' && newValue < maxValue) {
      setMinValue(newValue);
    } else if (activeThumb === 'max' && newValue > minValue) {
      setMaxValue(newValue);
    }
  };

  const handleMouseUp = () => {
    setActiveThumb(null);
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
          onTouchStart={(e) => handleThumbMouseDown(e, 'min')}
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
          onTouchStart={(e) => handleThumbMouseDown(e, 'max')}
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