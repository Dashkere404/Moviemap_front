import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Welcome from "./pages/Welcome";
import Main from "./pages/Main";
import MovieDetails from "./pages/MovieDetails";
import SimilarMovies from "./pages/SimilarMovies";
import Footer from "./components/Footer";
import "./styles/global.css";
import "./styles/fix-scroll.css";

// Базовый URL API
<<<<<<< HEAD
export const API_BASE_URL = 'https://thirty-cars-knock.loca.lt';
=======
export const API_BASE_URL = "http://127.0.0.1:8000";
>>>>>>> d81d734 (test husky)

// Background component that shows stars on all pages and posters only on welcome page
function Background() {
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
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Background />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/main" element={<Main />} />
            <Route path="/movie/:movieId" element={<MovieDetails />} />
            <Route path="/similar/:movieId" element={<SimilarMovies />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
