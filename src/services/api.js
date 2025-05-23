import axios from 'axios';
import { API_BASE_URL, POSTER_BASE_URL } from '../App';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Функция для форматирования URL постера
export const formatPosterUrl = (posterPath) => {
  if (!posterPath) return null;
  if (posterPath.startsWith('http')) return posterPath;
  return `${POSTER_BASE_URL}${posterPath}`;
};

// Экспортируем объект API
export default api; 