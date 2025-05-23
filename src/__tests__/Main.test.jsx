import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Main from '../pages/Main';

// Мок для react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ movieId: null }),
  useLocation: () => ({ 
    pathname: '/main',
    search: '',
    state: null
  })
}));

// Мок для импортированных изображений
jest.mock('../assets/search.svg', () => 'search-icon');
jest.mock('../assets/genre.svg', () => 'genre-icon');
jest.mock('../assets/rate.svg', () => 'rate-icon');
jest.mock('../assets/year.svg', () => 'year-icon');
jest.mock('../assets/clear.svg', () => 'clear-icon');
jest.mock('../assets/filter.svg', () => 'filter-icon');
jest.mock('../assets/tape.png', () => 'tape-image');
jest.mock('../assets/poster1.jpg', () => 'poster1-image');
jest.mock('../assets/poster2.jpg', () => 'poster2-image');
jest.mock('../assets/poster3.jpg', () => 'poster3-image');
jest.mock('../assets/poster4.jpg', () => 'poster4-image');
jest.mock('../assets/poster5.jpg', () => 'poster5-image');

describe('Main Component', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  const renderMainComponent = () => {
    return render(
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    );
  };

  test('рендерит компонент Main без ошибок', () => {
    renderMainComponent();
    expect(screen.getByText('Кино на любой вкус')).toBeInTheDocument();
    expect(screen.getByText('Персональные рекомендации')).toBeInTheDocument();
    expect(screen.getByText('Популярно у пользователей с похожим вкусом')).toBeInTheDocument();
  });

  test('отображает плейсхолдер при инициализации', () => {
    renderMainComponent();
    expect(screen.getByText('Введите название фильма или ID пользователя для поиска фильмов')).toBeInTheDocument();
  });

  test('выполняет поиск фильмов при нажатии Enter в поле поиска', async () => {
    // Подготавливаем мок ответ для fetch
    const mockMovies = [
      {
        movieId: 1,
        title: 'Тестовый фильм',
        average_rating: 4.5,
        poster_url: '/poster.jpg',
        year: 2020,
        genres: ['Драма', 'Комедия']
      }
    ];
    
    mockFetchResponse(mockMovies);
    
    renderMainComponent();
    
    // Находим поле поиска и вводим запрос
    const searchInput = screen.getByPlaceholderText('Поиск по названию...');
    fireEvent.change(searchInput, { target: { value: 'Тестовый фильм' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // Проверяем, что fetch был вызван с правильными параметрами
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movies/search?query=Тестовый%20фильм'),
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });
    
    // Проверяем, что результаты отображаются
    await waitFor(() => {
      expect(screen.getByText('Результаты поиска по запросу "Тестовый фильм"')).toBeInTheDocument();
    });
  });

  test('отменяет загрузку при нажатии на кнопку "Отменить"', async () => {
    // Имитируем долгий запрос
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      // Этот промис никогда не разрешится, имитируя длительный запрос
      setTimeout(resolve, 10000);
    }));
    
    renderMainComponent();
    
    // Находим поле поиска и вводим запрос
    const searchInput = screen.getByPlaceholderText('Поиск по названию...');
    fireEvent.change(searchInput, { target: { value: 'Долгий запрос' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
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
    
    // Проверяем, что метод abort был вызван
    expect(abortControllerRef.current.abort).toHaveBeenCalled();
  });

  test('переключает вкладки и загружает соответствующие рекомендации', async () => {
    // Подготавливаем мок ответы для разных запросов
    const mockPersonalMovies = [
      {
        movieId: 1,
        title: 'Персональный фильм',
        average_rating: 4.5,
        poster_url: '/poster1.jpg',
        year: 2020,
        genres: ['Драма']
      }
    ];
    
    const mockPopularMovies = [
      {
        movieId: 2,
        title: 'Популярный фильм',
        average_rating: 4.8,
        poster_url: '/poster2.jpg',
        year: 2021,
        genres: ['Комедия']
      }
    ];
    
    // Настраиваем моки для последовательных вызовов fetch
    mockFetchResponse(mockPersonalMovies);
    mockFetchResponse(mockPopularMovies);
    
    renderMainComponent();
    
    // Вводим ID пользователя
    const userIdInput = screen.getByPlaceholderText('Выбрать id пользователя...');
    fireEvent.change(userIdInput, { target: { value: '123' } });
    fireEvent.keyDown(userIdInput, { key: 'Enter', code: 'Enter' });
    
    // Проверяем первый запрос (персональные рекомендации)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommend/by-ratings/123'),
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });
    
    // Переключаемся на вкладку "Популярно у пользователей с похожим вкусом"
    fireEvent.click(screen.getByText('Популярно у пользователей с похожим вкусом'));
    
    // Проверяем второй запрос (популярные рекомендации)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommend/by-similar-ones/123'),
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });
  });
}); 