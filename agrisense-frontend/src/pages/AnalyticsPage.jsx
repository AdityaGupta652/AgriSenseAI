import { useState, useEffect } from 'react';
import { getSensorData } from '../api';
import Charts from '../components/Charts';
import translations from '../i18n';

export default function AnalyticsPage({ lang }) {
    const t = translations[lang];
    const [history, setHistory] = useState([]);
    const [activeCrop, setActiveCrop] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getSensorData();
                setHistory(res.data.history);
                setActiveCrop(res.data.currentCrop);
            } catch (err) {
                console.error("Failed to fetch sensor data for analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="relative">
            {/* Using relative inside the App wrapper, App wrapper has bg-dark-900 */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5 pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <h2 className="text-3xl font-black text-emerald-950 dark:text-white">
                        {t.charts || 'Data Analytics'} {activeCrop && <span className="text-emerald-600 dark:text-neon-blue">({t[activeCrop] || activeCrop})</span>}
                    </h2>
                    <p className="text-sm text-emerald-700 dark:text-slate-400 mt-1">Detailed historical trends of all tracking metrics</p>
                </div>
                
                {loading ? (
                    <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 h-64 flex items-center justify-center">
                         <div className="w-8 h-8 border-2 border-neon-blue/40 border-t-neon-blue rounded-full animate-spin" />
                    </div>
                ) : history.length > 0 ? (
                    <Charts history={history} lang={lang} />
                ) : (
                    <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 text-center text-emerald-700 dark:text-slate-400">
                        Not enough data to display analytics. Generate some data from the Dashboard first.
                    </div>
                )}
            </div>
        </div>
    );
}
