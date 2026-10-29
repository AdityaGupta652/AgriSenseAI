import { useState, useEffect, useCallback, useRef } from 'react';
import { getSensorData, simulate, getAlerts, uploadDataset, setCrop } from '../api';
import SoilCard from '../components/SoilCard';
import NPKCard from '../components/NPKCard';
import CropHealthCard from '../components/CropHealthCard';
import PestRiskCard from '../components/PestRiskCard';
import AlertsSection from '../components/AlertsSection';
import AIInsightsPanel from '../components/AIInsightsPanel';
import WhatIfSimulator from '../components/WhatIfSimulator';
import translations from '../i18n';

export default function Dashboard({ lang }) {
    const t = translations[lang];
    const [activeCrop, setActiveCrop] = useState('Wheat');
    const [current, setCurrent] = useState(null);
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const fetchAll = useCallback(async () => {
        try {
            const [sensorRes, alertsRes] = await Promise.all([
                getSensorData(),
                getAlerts(),
            ]);
            setActiveCrop(sensorRes.data.currentCrop || 'Wheat');
            setCurrent(sensorRes.data.current);
            setHistory(sensorRes.data.history);
            setAlerts(alertsRes.data.alerts);
            setLastUpdated(new Date());
            setError('');
        } catch {
            setError('Cannot connect to backend. Make sure the server is running on port 5000.');
        }
    }, []);

    // Initial load
    useEffect(() => {
        setLoading(true);
        fetchAll().finally(() => setLoading(false));
    }, [fetchAll]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await simulate();
            setActiveCrop(res.data.currentCrop || activeCrop);
            setCurrent(res.data.current);
            setHistory(res.data.history);
            const alertsRes = await getAlerts();
            setAlerts(alertsRes.data.alerts);
            setLastUpdated(new Date());
            setError('');
        } catch {
            setError('Cannot connect to backend. Make sure the server is running on port 5000.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCropSwitch = async (e) => {
        const selected = e.target.value;
        setGenerating(true);
        try {
            const res = await setCrop(selected);
            setActiveCrop(res.data.currentCrop);
            setCurrent(res.data.current);
            setHistory(res.data.history);
            const alertsRes = await getAlerts();
            setAlerts(alertsRes.data.alerts);
            setLastUpdated(new Date());
            setError('');
        } catch {
            setError('Failed to switch crop.');
        } finally {
            setGenerating(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const res = await uploadDataset(json);
                setCurrent(res.data.current);
                setHistory(res.data.history);
                const alertsRes = await getAlerts();
                setAlerts(alertsRes.data.alerts);
                setLastUpdated(new Date());
                // Clear input
                e.target.value = '';
            } catch (err) {
                setError('Failed to import dataset: ' + (err.response?.data?.error || err.message));
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="w-full relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5 pointer-events-none" />
            {/* Background orbs */}
            <div className="fixed top-1/3 left-10 w-80 h-80 bg-neon-blue/3 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-1/4 right-10 w-80 h-80 bg-neon-green/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-emerald-950 dark:text-white">{t.dashboard}</h2>
                        {lastUpdated && (
                            <p className="text-xs text-emerald-600 mt-0.5">
                                {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            value={activeCrop} 
                            onChange={handleCropSwitch} 
                            disabled={generating || importing}
                            className="bg-white dark:bg-dark-800 border border-green-300 dark:border-white/10 text-emerald-950 dark:text-white font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50 disabled:opacity-60 cursor-pointer shadow-sm"
                        >
                            {['Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane'].map(c => (
                                <option key={c} value={c}>{t[c] || c}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleImportClick}
                            disabled={importing || generating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-emerald-900 dark:text-white border border-green-300 dark:border-white/10 hover:bg-green-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-200 disabled:opacity-60 text-sm"
                        >
                            {importing ? 'Importing...' : 'Import Dataset'}
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || importing}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-neon-blue to-neon-green hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60 shadow-neon text-sm"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-900/40 dark:border-dark-900/40 border-t-slate-900 dark:border-t-dark-900 rounded-full animate-spin" />
                                    {t.generating}
                                </>
                            ) : t.generateData}
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && !current && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 h-64 animate-pulse">
                                <div className="h-4 w-24 bg-green-200 dark:bg-white/10 rounded mb-4" />
                                <div className="space-y-3">
                                    <div className="h-3 bg-green-100 dark:bg-white/10 rounded" />
                                    <div className="h-3 bg-green-100 dark:bg-white/10 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {current && (
                    <>
                        {/* Top stats cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <SoilCard data={current} lang={lang} />
                            <NPKCard data={current} lang={lang} />
                            <CropHealthCard data={current} lang={lang} />
                            <PestRiskCard data={current} lang={lang} />
                        </div>

                        {/* What-If Simulator */}
                        <WhatIfSimulator lang={lang} initialData={current} />

                        {/* Alerts + AI Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AlertsSection alerts={alerts} lang={lang} />
                            <AIInsightsPanel data={current} lang={lang} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
