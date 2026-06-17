import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';



function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/' || location.pathname === '/about';
  const isFixedPage = location.pathname === '/';

  return (
    <div className="app">
      {!hideNav && <Navigation />}
      <main className={isFixedPage ? 'main-full' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
