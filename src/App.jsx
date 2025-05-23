import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/global.css";
import "./styles/fix-scroll.css";

// Ленивая загрузка страниц
const Welcome = lazy(() => import("./pages/Welcome"));
const Main = lazy(() => import("./pages/Main"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const SimilarMovies = lazy(() => import("./pages/SimilarMovies"));

// Компонент для отображения загрузки
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

// Базовый URL API
export const API_BASE_URL = "/api";

// URL для постеров TMDB
export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Background component that shows stars on all pages and posters only on welcome page
const Background = React.memo(function Background() {
  const location = useLocation();

  return (
    <>
      {/* Stars background on all pages */}
      <div className="background-stars" />

      {/* Posters background only on welcome page */}
      {location.pathname === "/" && (
        <>
          <div className="posters-shadow" />
          <div className="background-posters" />
        </>
      )}
    </>
  );
});

function App() {
  return (
    <Router>
      <div className="app-container">
        <Background />
        <Header />
        <main className="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/main" element={<Main />} />
              <Route path="/movie/:movieId" element={<MovieDetails />} />
              <Route path="/similar/:movieId" element={<SimilarMovies />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
