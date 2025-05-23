import React, { useState, useEffect } from 'react';

// Функция для проверки поддержки WebP
const checkWebpSupport = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = function () {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Компонент для оптимизированной загрузки изображений
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className, 
  width, 
  height,
  fallbackSrc,
  loading = 'lazy' // По умолчанию используем ленивую загрузку
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [supportsWebp, setSupportsWebp] = useState(null);

  // Проверяем поддержку WebP при монтировании компонента
  useEffect(() => {
    const checkSupport = async () => {
      const isWebpSupported = await checkWebpSupport();
      setSupportsWebp(isWebpSupported);
    };
    
    checkSupport();
  }, []);

  // Обновляем источник изображения при изменении src или определении поддержки WebP
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setError(false);
      setImgSrc(src); // Сразу устанавливаем исходное изображение
      
      // В будущем, когда у вас будут WebP версии изображений, можно раскомментировать этот код
      /*
      // Если поддержка WebP определена и поддерживается
      if (supportsWebp && src.includes('/assets/')) {
        // Проверяем локально, есть ли WebP версия
        const baseName = src.split('/').pop().split('.')[0];
        const webpSrc = `/src/assets/webp/${baseName}.webp`;
        
        // Здесь можно будет использовать WebP версию, когда она будет доступна
        // setImgSrc(webpSrc);
      }
      */
    }
  }, [src, supportsWebp]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <>
      {isLoading && (
        <div 
          className={`${className} image-placeholder`} 
          style={{ 
            width: width || '100%', 
            height: height || '100%',
            background: '#1a1a1a'
          }}
        />
      )}
      <img
        src={imgSrc}
        alt={alt || ''}
        className={`${className} ${isLoading ? 'image-hidden' : 'image-visible'}`}
        style={{ display: isLoading ? 'none' : 'block' }}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
});

export default OptimizedImage;