import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage1';
import HomePage2 from './pages/HomePage2';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/App.css';
import './styles/Navigation.css';

function AppContent() {
  const location = useLocation();
  const isFullPage = location.pathname === '/' || location.pathname === '/home2';

  return (
    <div className="app">
      {!isFullPage && <Navigation />}
      <main className={isFullPage ? 'main-full' : ''}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home2" element={<HomePage2 />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
