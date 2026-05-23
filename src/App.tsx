import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { AnimeDetails } from './pages/AnimeDetails';
import { Profile } from './pages/Profile';
import { RankingPage } from './pages/RankingPage';
import { SeasonalPage } from './pages/SeasonalPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// Envuelve las rutas y aplica un fade-in al montar cada página.
// key={pathname} hace que el div se remonte en cada cambio de ruta,
// disparando la animación CSS de entrada.
const AppContent = () => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[#080A0F] text-zinc-100 flex flex-col font-sans relative">
      <Header />
      <main className="flex-1 w-full relative">
        <div key={pathname} className="animate-in fade-in duration-200 h-full">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/search"     element={<Search />} />
            <Route path="/anime/:id"  element={<AnimeDetails />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/top/:filter" element={<RankingPage />} />
            <Route path="/seasonal"    element={<SeasonalPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
