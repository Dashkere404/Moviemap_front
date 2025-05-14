import { useState, useEffect, useRef } from 'react';
import styles from './FilterModal.module.css';

export default function FilterModal({ isOpen, onClose, title, children, onApply, onReset }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.resetButton} onClick={onReset}>Сбросить</button>
          <button className={styles.applyButton} onClick={onApply}>Применить</button>
        </div>
      </div>
    </div>
  );
} 