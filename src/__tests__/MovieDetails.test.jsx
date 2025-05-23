import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MovieDetails from '../pages/MovieDetails';

// Мок для react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ movieId: '123' }),
  useLocation: () => ({ 
    pathname: '/movie/123',
    search: '',
    state: {
      fromMain: true,
      scrollPosition: 0,
      movies: []
    }
  })
}));

describe('MovieDetails Component', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  const renderMovieDetailsComponent = () => {
    return render(
      <BrowserRouter>
        <MovieDetails />
      </BrowserRouter>
    );
  };

  test('отображает оверлей загрузки при инициализации', async () => {
    // Имитируем долгий запрос
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      // Этот промис никогда не разрешится, имитируя длительный запрос
      setTimeout(resolve, 10000);
    }));
    
    renderMovieDetailsComponent();
    
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
    
    renderMovieDetailsComponent();
    
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

  test('отображает данные фильма при успешной загрузке', async () => {
    // Подготавливаем мок ответ для fetch
    const mockMovie = {
      movieId: 123,
      title: 'Тестовый фильм',
      average_rating: 4.5,
      poster_url: '/poster.jpg',
      year: 2020,
      genres: ['Драма', 'Комедия'],
      description: 'Описание тестового фильма'
    };
    
    mockFetchResponse(mockMovie);
    
    renderMovieDetailsComponent();
    
    // Проверяем, что данные фильма отображаются после загрузки
    await waitFor(() => {
      expect(screen.getByText('Тестовый фильм')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('Драма, Комедия')).toBeInTheDocument();
      expect(screen.getByText('Описание тестового фильма')).toBeInTheDocument();
    });
  });

  test('отображает сообщение об ошибке при неудачной загрузке', async () => {
    // Подготавливаем мок ответ с ошибкой
    mockFetchResponse({ message: 'Фильм не найден' }, { status: 404 });
    
    renderMovieDetailsComponent();
    
    // Проверяем, что сообщение об ошибке отображается
    await waitFor(() => {
      expect(screen.getByText('Фильм не найден')).toBeInTheDocument();
    });
  });

  test('загружает похожие фильмы при нажатии на кнопку', async () => {
    // Подготавливаем мок ответы для последовательных запросов
    const mockMovie = {
      movieId: 123,
      title: 'Тестовый фильм',
      average_rating: 4.5,
      poster_url: '/poster.jpg',
      year: 2020,
      genres: ['Драма', 'Комедия'],
      description: 'Описание тестового фильма'
    };
    
    const mockSimilarMovies = [
      {
        movieId: 456,
        title: 'Похожий фильм',
        average_rating: 4.2,
        poster_url: '/poster2.jpg',
        year: 2021,
        genres: ['Драма']
      }
    ];
    
    // Настраиваем моки для последовательных вызовов fetch
    mockFetchResponse(mockMovie);
    mockFetchResponse(mockSimilarMovies);
    
    renderMovieDetailsComponent();
    
    // Ждем загрузки основных данных фильма
    await waitFor(() => {
      expect(screen.getByText('Тестовый фильм')).toBeInTheDocument();
    });
    
    // Нажимаем кнопку "Похожие фильмы"
    const similarMoviesButton = screen.getByText('Похожие фильмы');
    fireEvent.click(similarMoviesButton);
    
    // Проверяем, что запрос на получение похожих фильмов был отправлен
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movies/123/similar'),
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });
    
    // Проверяем, что похожие фильмы отображаются
    await waitFor(() => {
      expect(screen.getByText('Похожий фильм')).toBeInTheDocument();
    });
  });
}); 