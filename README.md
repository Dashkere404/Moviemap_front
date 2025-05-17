# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# MovieMap — система рекомендаций фильмов

Веб-приложение для получения персонализированных рекомендаций фильмов.

## Возможности

- Просмотр персональных рекомендаций по ID пользователя
- Популярные фильмы у пользователей с похожим вкусом
- Поиск по названию фильма
- Фильтрация рекомендаций по жанрам, рейтингу и годам
- Просмотр похожих фильмов

## Последние изменения (28.10.2023)

1. Добавлена поддержка новых API-эндпоинтов:
   - `/recommend/similar-movies/{movie_id}` - похожие фильмы
   - `/recommend/by-similar-ones/{user_id}` - популярные у пользователей с похожим вкусом
   - `/movies/search?query=...` - поиск по названию
   - `/recommend/by-ratings/{user_id}/filter` - фильтрация для рекомендаций на основе оценок
   - `/recommend/by-similar-ones/{user_id}/filter` - фильтрация для популярных фильмов

2. Реализована серверная фильтрация рекомендаций
3. Добавлена поддержка переключения между различными типами рекомендаций
4. Базовый URL API вынесен в константу для облегчения обновления
5. Удалена опция "Сначала лучшие", так как сервер автоматически сортирует результаты по рейтингу
