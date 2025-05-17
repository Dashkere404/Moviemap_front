import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Welcome from './components/Welcome';
import Main from './components/Main';
import MovieDetails from './components/MovieDetails';
import Footer from './components/Footer';
import './styles/global.css';
import './styles/fix-scroll.css';

// Базовый URL API
export const API_BASE_URL = 'https://solid-ears-rush.loca.lt';

// Background component that shows stars on all pages and posters only on welcome page
function Background() {
  const location = useLocation();
  
  return (
    <>
      {/* Stars background on all pages */}
      <div className="background-stars" />
      
      {/* Posters background only on welcome page */}
      {location.pathname === '/' && (
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
            <Route path="/similar/:movieId" element={<Main />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
