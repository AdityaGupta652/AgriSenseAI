import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getSensorData } from './api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import WeatherPage from './pages/WeatherPage';
import NewsPage from './pages/NewsPage';
import DiseaseDetection from './pages/DiseaseDetection';
import Navbar from './components/Navbar';

function AppContent() {
  const { user } = useAuth();
  const [lang, setLang] = useState('en');
  const [activeCrop, setActiveCrop] = useState('Wheat'); // Global layout hoist

  useEffect(() => {
     if (user) {
         getSensorData()
           .then(res => setActiveCrop(res.data.currentCrop || 'Wheat'))
           .catch(() => {});
     }
  }, [user]);

  const toggleLang = () => {
    const langs = ['en', 'hi', 'kn'];
    const idx = langs.indexOf(lang);
    setLang(langs[(idx + 1) % langs.length]);
  };

  if (!user) return <AuthPage lang={lang} />;

  return (
    <div className="min-h-screen bg-green-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar lang={lang} onToggleLang={toggleLang} activeCrop={activeCrop} setActiveCrop={setActiveCrop} />
      <Routes>
        <Route path="/" element={<Dashboard lang={lang} activeCrop={activeCrop} setActiveCrop={setActiveCrop} />} />
        <Route path="/analytics" element={<AnalyticsPage lang={lang} activeCrop={activeCrop} setActiveCrop={setActiveCrop} />} />
        <Route path="/weather" element={<WeatherPage lang={lang} />} />
        <Route path="/news" element={<NewsPage lang={lang} />} />
        <Route path="/disease-detection" element={<DiseaseDetection lang={lang} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
