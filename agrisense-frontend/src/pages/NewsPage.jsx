import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import translations from '../i18n';

export default function NewsPage({ lang }) {
    const t = translations[lang];
    const { user } = useAuth();
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Mock news data - now uses translation keys
    const mockNews = [
        {
            id: 1,
            title: t.news1Title,
            category: 'crop',
            date: new Date().toLocaleDateString(),
            image: '🌾',
            content: t.news1Content,
            source: t.news1Source
        },
        {
            id: 2,
            title: t.news2Title,
            category: 'policy',
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            image: '🌱',
            content: t.news2Content,
            source: t.news2Source
        },
        {
            id: 3,
            title: t.news3Title,
            category: 'weather',
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            image: '🌧️',
            content: t.news3Content,
            source: t.news3Source
        },
        {
            id: 4,
            title: t.news4Title,
            category: 'crop',
            date: new Date(Date.now() - 259200000).toLocaleDateString(),
            image: '🌾',
            content: t.news4Content,
            source: t.news4Source
        },
        {
            id: 5,
            title: t.news5Title,
            category: 'technology',
            date: new Date(Date.now() - 345600000).toLocaleDateString(),
            image: '🤖',
            content: t.news5Content,
            source: t.news5Source
        },
        {
            id: 6,
            title: t.news6Title,
            category: 'market',
            date: new Date(Date.now() - 432000000).toLocaleDateString(),
            image: '🛒',
            content: t.news6Content,
            source: t.news6Source
        }
    ];

    const categories = [
        { id: 'all', label: t.allNews, icon: '📰' },
        { id: 'crop', label: t.cropNews, icon: '🌾' },
        { id: 'weather', label: t.weatherNews, icon: '🌤️' },
        { id: 'policy', label: t.policies, icon: '📋' },
        { id: 'technology', label: t.technologyNews, icon: '🤖' },
        { id: 'market', label: t.markets, icon: '🛒' }
    ];

    const filteredNews = selectedCategory === 'all' 
        ? mockNews 
        : mockNews.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-green-50 dark:bg-dark-900 p-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-emerald-950 dark:text-white mb-2">
                        📰 {t.farmingNews}
                    </h1>
                    <p className="text-emerald-700 dark:text-slate-400">
                        {t.newsUpdatesDesc}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-slate-300 mb-4">{t.filterByCategory}</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                        : 'bg-white/50 dark:bg-white/5 text-emerald-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-white/10'
                                }`}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map(news => (
                        <div
                            key={news.id}
                            className="glass rounded-2xl border border-green-300 dark:border-white/10 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                        >
                            {/* News Image Section */}
                            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-emerald-900/20 dark:to-green-900/20 p-6 flex items-center justify-center border-b border-green-300 dark:border-white/10">
                                <span className="text-6xl">{news.image}</span>
                            </div>

                            {/* News Content */}
                            <div className="p-6 space-y-4">
                                {/* Category Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-400/30">
                                        {categories.find(c => c.id === news.category)?.icon} {categories.find(c => c.id === news.category)?.label.split(' ')[1]}
                                    </span>
                                    <span className="text-xs text-emerald-600 dark:text-slate-400 font-semibold">
                                        📅 {news.date}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-emerald-950 dark:text-white line-clamp-2">
                                    {news.title}
                                </h3>

                                {/* Content Preview */}
                                <p className="text-emerald-700 dark:text-slate-400 text-sm line-clamp-3">
                                    {news.content}
                                </p>

                                {/* Source */}
                                <div className="pt-2 border-t border-green-300 dark:border-white/10">
                                    <p className="text-xs text-emerald-600 dark:text-slate-500 font-semibold">
                                        🔗 {news.source}
                                    </p>
                                </div>

                                {/* Read More Button */}
                                <button className="w-full mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
                                    {t.readMore}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No News Found */}
                {filteredNews.length === 0 && (
                    <div className="glass rounded-2xl border border-yellow-300 dark:border-yellow-400/30 p-8 text-center">
                        <p className="text-yellow-600 dark:text-yellow-400 text-lg font-semibold mb-2">
                            📭 {t.noNewsAvailable}
                        </p>
                        <p className="text-emerald-700 dark:text-slate-400">
                            {t.noNewsMessage}
                        </p>
                    </div>
                )}

                {/* Featured Tips Section */}
                <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-8 mt-12">
                    <h2 className="text-2xl font-bold text-emerald-950 dark:text-white mb-6">
                        💡 {t.farmingTips}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '💧',
                                title: t.waterManagement,
                                tips: [t.dripIrrigation, t.monitorMoisture, t.rainwaterCollection]
                            },
                            {
                                icon: '🌾',
                                title: t.cropRotation,
                                tips: [t.rotateAnnually, t.useLegumes, t.interCropping]
                            },
                            {
                                icon: '🐛',
                                title: t.pestManagement,
                                tips: [t.organicControl, t.stickyTraps, t.removeAffected]
                            }
                        ].map((tip, idx) => (
                            <div key={idx} className="bg-white/50 dark:bg-white/5 rounded-xl p-6 border border-green-300 dark:border-white/10">
                                <p className="text-3xl mb-3">{tip.icon}</p>
                                <h3 className="font-bold text-emerald-950 dark:text-white mb-3">{tip.title}</h3>
                                <ul className="space-y-2">
                                    {tip.tips.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-emerald-700 dark:text-slate-400">
                                            <span>✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
