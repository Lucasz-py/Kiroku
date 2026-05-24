import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { AnimeDetails } from './pages/AnimeDetails';
import { Profile } from './pages/Profile';
import { RankingPage } from './pages/RankingPage';
import { SeasonalPage } from './pages/SeasonalPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { UserDataProvider } from './contexts/UserDataContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// Animación de entrada/salida por ruta (#16)
const AnimatedRoutes = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key !== prevKey.current) {
      setTransitionStage('exit');
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
        prevKey.current = location.key;
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div
      key={displayLocation.key}
      className={transitionStage === 'enter' ? 'page-enter' : 'page-exit'}
      style={{ minHeight: '100%' }}
    >
      <Routes location={displayLocation}>
        <Route path="/"             element={<Home />} />
        <Route path="/search"       element={<Search />} />
        <Route path="/anime/:id"    element={<AnimeDetails />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/top/:filter"  element={<RankingPage />} />
        <Route path="/seasonal"     element={<SeasonalPage />} />
        <Route path="/watchlist"    element={<WatchlistPage />} />
        <Route path="/u/:username"  element={<PublicProfilePage />} />
      </Routes>
    </div>
  );
};

const AppContent = () => (
  <div className="min-h-screen bg-[#080A0F] text-zinc-100 flex flex-col font-sans relative">
    <Header />
    <main className="flex-1 w-full relative">
      <AnimatedRoutes />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <UserDataProvider>
        <ScrollToTop />
        <AppContent />
      </UserDataProvider>
    </Router>
  );
}

export default App;
