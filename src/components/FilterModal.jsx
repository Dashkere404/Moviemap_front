import { useState, useEffect, useRef } from 'react';
import styles from './FilterModal.module.css';

export default function FilterModal({ isOpen, onClose, title, children, onApply, onReset }) {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 50);
  };

  const handleApply = () => {
    onApply();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  const handleReset = () => {
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={styles.resetButton} 
            onClick={handleReset}
            disabled={isClosing}
          >
            Сбросить
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