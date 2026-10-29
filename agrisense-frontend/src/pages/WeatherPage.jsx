import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import translations from '../i18n';

export default function WeatherPage({ lang }) {
    const t = translations[lang];
    const { user } = useAuth();
    const { theme } = useTheme();
    const [weather, setWeather] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);

    // Mock weather data
    const mockWeatherData = {
        location: user?.location || 'Bangalore',
        current: {
            temp: 28,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly Cloudy',
            feelsLike: 30
        },
        alerts: [
            {
                message: 'Heavy rainfall predicted for next 3 days',
                severity: 'warning',
                date: new Date().toISOString()
            },
            {
                message: 'Strong wind warning in effect',
                severity: 'normal',
                date: new Date().toISOString()
            }
        ],
        forecast: [
            {
                day: 'Today',
                date: new Date().toLocaleDateString(),
                temp: 28,
                condition: 'Partly Cloudy',
                humidity: 65,
                windSpeed: 12,
                precipitation: 0,
                severity: 'normal'
            },
            {
                day: 'Tomorrow',
                date: new Date(Date.now() + 86400000).toLocaleDateString(),
                temp: 26,
                condition: 'Rainy',
                humidity: 85,
                windSpeed: 18,
                precipitation: 25,
                severity: 'warning'
            },
            {
                day: 'Day 3',
                date: new Date(Date.now() + 172800000).toLocaleDateString(),
                temp: 24,
                condition: 'Heavy Rain',
                humidity: 90,
                windSpeed: 22,
                precipitation: 40,
                severity: 'warning'
            },
            {
                day: 'Day 4',
                date: new Date(Date.now() + 259200000).toLocaleDateString(),
                temp: 27,
                condition: 'Cloudy',
                humidity: 70,
                windSpeed: 15,
                precipitation: 5,
                severity: 'normal'
            }
        ]
    };

    useEffect(() => {
        // Simulate loading delay
        setTimeout(() => {
            setWeather(mockWeatherData);
        }, 500);
    }, [user?.location]);

    const getWeatherIcon = (condition) => {
        const cond = condition.toLowerCase();
        if (cond.includes('sunny')) return '☀️';
        if (cond.includes('rainy') || cond.includes('rain')) return '🌧️';
        if (cond.includes('cloudy') || cond.includes('cloud')) return '☁️';
        if (cond.includes('heavy')) return '⛈️';
        if (cond.includes('wind')) return '💨';
        return '🌤️';
    };

    const getRecommendations = () => {
        const recs = [];
        const alerts = weather?.alerts || [];

        if (alerts.some(a => a.message.includes('rainfall'))) {
            recs.push({
                title: t.heavyRainWarning,
                message: t.reduceIrrigation,
                color: 'blue'
            });
        }

        if (alerts.some(a => a.message.includes('wind'))) {
            recs.push({
                title: t.strongWindWarning,
                message: t.secureTrellises,
                color: 'cyan'
            });
        }

        if (!alerts.length) {
            recs.push({
                title: '✅ ' + t.favorableConditions,
                message: t.idealWeather,
                color: 'green'
            });
        }

        return recs;
    };

    if (!weather) {
        return (
            <div className="min-h-screen bg-green-50 dark:bg-dark-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-5xl mb-4">🌍</div>
                    <p className="text-emerald-700 dark:text-slate-400">Loading weather...</p>
                </div>
            </div>
        );
    }

    const current = weather.current;
    const forecast = weather.forecast;
    const alerts = weather.alerts;
    const recommendations = getRecommendations();

    return (
        <div className="min-h-screen bg-green-50 dark:bg-dark-900 p-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-emerald-950 dark:text-white mb-2">
                        🌤️ {t.liveWeatherAlerts}
                    </h1>
                    <p className="text-emerald-700 dark:text-slate-400 flex items-center gap-4">
                        <span>📍 {weather.location}</span>
                        <span>🔄 {t.weatherUpdated}: {new Date().toLocaleTimeString()}</span>
                    </p>
                </div>

                {/* Current Weather Card */}
                <div className="glass rounded-2xl border border-green-300 dark:border-neon-blue/30 p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">{t.currentWeather}</h2>
                        <div className="text-7xl">{getWeatherIcon(current.condition)}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-green-300 dark:border-white/10">
                            <p className="text-sm text-emerald-700 dark:text-slate-400 font-semibold mb-1">{t.temperature}</p>
                            <p className="text-3xl font-bold text-emerald-950 dark:text-white">{current.temp}°C</p>
                            <p className="text-xs text-emerald-700 dark:text-slate-400 mt-1">Feels like {current.feelsLike}°C</p>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-green-300 dark:border-white/10">
                            <p className="text-sm text-emerald-700 dark:text-slate-400 font-semibold mb-1">{t.humidity}</p>
                            <p className="text-3xl font-bold text-emerald-950 dark:text-white">{current.humidity}%</p>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-green-300 dark:border-white/10">
                            <p className="text-sm text-emerald-700 dark:text-slate-400 font-semibold mb-1">{t.windSpeed}</p>
                            <p className="text-3xl font-bold text-emerald-950 dark:text-white">{current.windSpeed} km/h</p>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-green-300 dark:border-white/10">
                            <p className="text-sm text-emerald-700 dark:text-slate-400 font-semibold mb-1">{t.condition}</p>
                            <p className="text-lg font-bold text-emerald-950 dark:text-white">{current.condition}</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-emerald-950 dark:text-white">🚨 {t.weatherAlerts}</h2>
                        {alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className={`glass rounded-xl border p-4 flex items-start gap-4 ${
                                    alert.severity === 'warning'
                                        ? 'bg-yellow-500/10 border-yellow-400 dark:border-yellow-400/30'
                                        : 'bg-green-500/10 border-green-400 dark:border-green-400/30'
                                }`}
                            >
                                <span className="text-3xl">⚠️</span>
                                <div className="flex-1">
                                    <p className={`font-bold mb-1 ${
                                        alert.severity === 'warning'
                                            ? 'text-yellow-600 dark:text-yellow-300'
                                            : 'text-green-600 dark:text-green-300'
                                    }`}>
                                        {alert.message}
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-slate-400">
                                        {new Date(alert.date).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                <div className="space-y-3">
                    <h2 className="text-xl font-bold text-emerald-950 dark:text-white">💡 {t.farmingRecommendations}</h2>
                    {recommendations.map((rec, idx) => (
                        <div
                            key={idx}
                            className={`glass rounded-xl border p-4 ${
                                rec.color === 'red' ? 'bg-red-500/10 border-red-400 dark:border-red-400/30' :
                                rec.color === 'blue' ? 'bg-blue-500/10 border-blue-400 dark:border-blue-400/30' :
                                rec.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-400 dark:border-cyan-400/30' :
                                'bg-green-500/10 border-green-400 dark:border-green-400/30'
                            }`}
                        >
                            <p className={`font-bold mb-2 ${
                                rec.color === 'red' ? 'text-red-600 dark:text-red-300' :
                                rec.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                                rec.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-300' :
                                'text-green-600 dark:text-green-300'
                            }`}>
                                {rec.title}
                            </p>
                            <p className="text-emerald-700 dark:text-slate-400 text-sm">
                                {rec.message}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 4-Day Forecast */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-emerald-950 dark:text-white">📅 {t.fourDayForecast}</h2>
                    
                    {/* Forecast Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {forecast.map((day, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedDay(idx)}
                                className={`glass rounded-xl border p-4 cursor-pointer transition-all transform hover:scale-105 ${
                                    selectedDay === idx
                                        ? 'border-neon-blue/50 bg-neon-blue/10 shadow-neon'
                                        : 'border-green-300 dark:border-white/10 hover:border-neon-blue/30'
                                } ${day.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}
                            >
                                <div className="text-center">
                                    <p className="font-semibold text-emerald-950 dark:text-white text-sm mb-2">
                                        {day.day}
                                    </p>
                                    <p className="text-3xl mb-2">{getWeatherIcon(day.condition)}</p>
                                    <p className="text-2xl font-bold text-emerald-950 dark:text-white mb-1">
                                        {day.temp}°C
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-slate-400 mb-2">
                                        {day.condition}
                                    </p>
                                    <div className="space-y-1 text-xs text-emerald-700 dark:text-slate-400">
                                        <div>💧 {day.humidity}%</div>
                                        <div>💨 {day.windSpeed} km/h</div>
                                        {day.precipitation > 0 && <div>🌧️ {day.precipitation}mm</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Day View */}
                    {forecast[selectedDay] && (
                        <div className="glass rounded-2xl border border-neon-blue/30 dark:border-white/10 p-6 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-6xl">{getWeatherIcon(forecast[selectedDay].condition)}</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-white mb-1">
                                        {forecast[selectedDay].day}
                                    </h3>
                                    <p className="text-emerald-700 dark:text-slate-400">
                                        {forecast[selectedDay].date}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-slate-400 mb-1">Temperature</p>
                                    <p className="text-3xl font-bold text-emerald-950 dark:text-white">
                                        {forecast[selectedDay].temp}°C
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-slate-400 mb-1">Humidity</p>
                                    <p className="text-3xl font-bold text-emerald-950 dark:text-white">
                                        {forecast[selectedDay].humidity}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-slate-400 mb-1">Wind Speed</p>
                                    <p className="text-3xl font-bold text-emerald-950 dark:text-white">
                                        {forecast[selectedDay].windSpeed} km/h
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-slate-400 mb-1">Rainfall</p>
                                    <p className="text-3xl font-bold text-emerald-950 dark:text-white">
                                        {forecast[selectedDay].precipitation}mm
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
