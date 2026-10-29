import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import translations from '../i18n';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ lang, onToggleLang }) {
    const { user, logoutUser } = useAuth();
    const t = translations[lang];
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="glass border-b border-green-300 dark:border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-lg shadow-neon">
                    🌱
                </div>
                <div>
                    <h1 className="font-bold text-emerald-950 dark:text-white text-lg leading-tight">{t.appName}</h1>
                    <p className="text-xs text-blue-600 dark:text-neon-blue/80 leading-none tracking-wide">{t.smartFarmMonitor}</p>
                </div>

                {user && (
                    <div className="flex items-center gap-1 mx-4 p-1 bg-green-100/50 dark:bg-white/5 rounded-xl border border-green-300 dark:border-white/5">
                        <Link 
                            to="/" 
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/' ? 'bg-white dark:bg-white/10 text-emerald-950 dark:text-white shadow-md' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white hover:bg-green-200 dark:hover:bg-white/5'}`}
                        >
                            {t.dashboard || 'Dashboard'}
                        </Link>
                        <Link 
                            to="/analytics" 
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/analytics' ? 'bg-white dark:bg-white/10 text-emerald-950 dark:text-white shadow-md' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white hover:bg-green-200 dark:hover:bg-white/5'}`}
                        >
                            {t.charts || 'Analytics'}
                        </Link>
                        <Link 
                            to="/weather" 
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/weather' ? 'bg-white dark:bg-white/10 text-emerald-950 dark:text-white shadow-md' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white hover:bg-green-200 dark:hover:bg-white/5'}`}
                        >
                            🌤️ {t.weather}
                        </Link>
                        <Link 
                            to="/news" 
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/news' ? 'bg-white dark:bg-white/10 text-emerald-950 dark:text-white shadow-md' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white hover:bg-green-200 dark:hover:bg-white/5'}`}
                        >
                            📰 {t.news}
                        </Link>
                        <Link 
                            to="/disease-detection" 
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/disease-detection' ? 'bg-white dark:bg-white/10 text-emerald-950 dark:text-white shadow-md' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white hover:bg-green-200 dark:hover:bg-white/5'}`}
                        >
                            🔍 {t.diseaseDetection}
                        </Link>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-green-300 dark:border-neon-purple/30 text-emerald-700 dark:text-neon-purple text-lg hover:bg-green-100 dark:hover:bg-neon-purple/10 transition-all duration-300 active:scale-95 flex items-center justify-center"
                    title={t.toggleTheme}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {user && (
                    <span className="hidden sm:flex items-center gap-1.5 text-sm text-emerald-600 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                        {user.name}
                    </span>
                )}

                <button
                    onClick={onToggleLang}
                    className="px-4 py-2 rounded-xl border border-neon-blue/30 text-neon-blue text-xs font-bold hover:bg-neon-blue/10 hover:shadow-neon transition-all duration-300 active:scale-95"
                >
                    {lang === 'en' ? t.hindiLabel : lang === 'hi' ? t.kannadaLabel : t.englishLabel}
                </button>

                {user && (
                    <button
                        onClick={logoutUser}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
                    >
                        {t.logout}
                    </button>
                )}
            </div>
        </nav>
    );
}
