import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';

// True on mobile-width viewports. Used to skip the landing animation on phones.
function useIsMobile() {
  const query = '(max-width: 768px)';
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

function AppContent() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const hideNav = location.pathname === '/' || location.pathname === '/about';
  // The landing intro only shows at '/' on desktop; on mobile '/' is the About page.
  const isFixedPage = location.pathname === '/' && !isMobile;

  return (
    <div className="app">
      {!hideNav && <Navigation />}
      <main className={isFixedPage ? 'main-full' : ''}>
        <Routes>
          {/* Mobile skips the binary-matrix landing and loads About directly. */}
          <Route path="/" element={isMobile ? <AboutPage /> : <LandingPage />} />
          <Route path="/about" element={<AboutPage />} />

        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}

export default App;
