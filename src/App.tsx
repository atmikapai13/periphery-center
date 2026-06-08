import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
      
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
