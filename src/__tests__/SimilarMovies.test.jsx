import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimilarMovies from '../pages/SimilarMovies';

// Мок для react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ movieId: '123' }),
  useLocation: () => ({ 
    pathname: '/movie/123/similar',
    search: '',
    state: {
      fromDetails: true,
      movie: {
        id: 123,
        title: 'Тестовый фильм',
        year: 2020,
        genres: ['Драма', 'Комедия'],
        rating: '4.5',
        poster: '/poster.jpg',
        description: 'Описание тестового фильма'
      }
    }
  })
}));

describe('SimilarMovies Component', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  const renderSimilarMoviesComponent = () => {
    return render(
      <BrowserRouter>
        <SimilarMovies />
      </BrowserRouter>
    );
  };

  test('отображает оверлей загрузки при инициализации', async () => {
    // Имитируем долгий запрос
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      // Этот промис никогда не разрешится, имитируя длительный запрос
      setTimeout(resolve, 10000);
    }));
    
    renderSimilarMoviesComponent();
    
    // Проверяем, что оверлей загрузки отображается
    await waitFor(() => {
      expect(screen.getByText('Загрузка')).toBeInTheDocument();
    });
  });

  test('отменяет загрузку при нажатии на кнопку "Отменить"', async () => {
    // Имитируем долгий запрос
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      // Этот промис никогда не разрешится, имитируя длительный запрос
      setTimeout(resolve, 10000);
    }));
    
    renderSimilarMoviesComponent();
    
    // Проверяем, что оверлей загрузки отображается
    await waitFor(() => {
      expect(screen.getByText('Загрузка')).toBeInTheDocument();
    });
    
    // Нажимаем кнопку "Отменить"
    fireEvent.click(screen.getByText('Отменить'));
    
    // Проверяем, что оверлей загрузки исчез
    await waitFor(() => {
      expect(screen.queryByText('Загрузка')).not.toBeInTheDocument();
    });
  });

  test('отображает похожие фильмы при успешной загрузке', async () => {
    // Подготавливаем мок ответ для fetch
    const mockSimilarMovies = [
      {
        movieId: 456,
        title: 'Похожий фильм 1',
        average_rating: 4.2,
        poster_url: '/poster2.jpg',
        year: 2021,
        genres: ['Драма']
      },
      {
        movieId: 789,
        title: 'Похожий фильм 2',
        average_rating: 4.0,
        poster_url: '/poster3.jpg',
        year: 2019,
        genres: ['Комедия']
      }
    ];
    
    mockFetchResponse(mockSimilarMovies);
    
    renderSimilarMoviesComponent();
    
    // Проверяем, что заголовок страницы отображается
    expect(screen.getByText('Фильмы, похожие на "Тестовый фильм"')).toBeInTheDocument();
    
    // Проверяем, что похожие фильмы отображаются после загрузки
    await waitFor(() => {
      expect(screen.getByText('Похожий фильм 1')).toBeInTheDocument();
      expect(screen.getByText('Похожий фильм 2')).toBeInTheDocument();
    });
  });

  test('отображает сообщение об ошибке при неудачной загрузке', async () => {
    // Подготавливаем мок ответ с ошибкой
    mockFetchError('Не удалось загрузить похожие фильмы');
    
    renderSimilarMoviesComponent();
    
    // Проверяем, что сообщение об ошибке отображается
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить похожие фильмы')).toBeInTheDocument();
    });
  });

  test('возвращается к деталям фильма при нажатии на кнопку "Назад"', () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    renderSimilarMoviesComponent();
    
    // Нажимаем кнопку "Назад"
    const backButton = screen.getByText('Назад к фильму');
    fireEvent.click(backButton);
    
    // Проверяем, что navigate был вызван с правильными параметрами
    expect(navigateMock).toHaveBeenCalledWith('/movie/123', expect.any(Object));
  });

  test('отображает пустой результат, если нет похожих фильмов', async () => {
    // Подготавливаем пустой массив как ответ
    mockFetchResponse([]);
    
    renderSimilarMoviesComponent();
    
    // Проверяем, что отображается сообщение о пустом результате
    await waitFor(() => {
      expect(screen.getByText('Нет похожих фильмов')).toBeInTheDocument();
    });
  });
}); 