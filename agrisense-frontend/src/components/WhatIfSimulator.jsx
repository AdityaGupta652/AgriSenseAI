import { useState, useEffect } from 'react';
import { predict } from '../api';
import translations from '../i18n';

export default function WhatIfSimulator({ lang, initialData }) {
    const t = translations[lang];
    const [values, setValues] = useState({
        soilMoisture: initialData?.soilMoisture || 50,
        temperature: initialData?.temperature || 25,
        ph: initialData?.ph || 6.5,
        humidity: initialData?.humidity || 60,
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPrediction = async () => {
            setLoading(true);
            try {
                const res = await predict(values);
                setPrediction(res.data);
            } catch (err) {
                console.error('Prediction failed', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchPrediction, 500);
        return () => clearTimeout(timer);
    }, [values]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const reset = () => {
        if (initialData) {
            setValues({
                soilMoisture: initialData.soilMoisture,
                temperature: initialData.temperature,
                ph: initialData.ph,
                humidity: initialData.humidity,
            });
        }
    };

    const getHealthColor = (score) => {
        if (score > 80) return 'text-neon-green';
        if (score > 60) return 'text-yellow-400';
        return 'text-red-500';
    };

    const getPestColor = (risk) => {
        if (risk === 'Low') return 'text-neon-green';
        if (risk === 'Medium') return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-emerald-950 dark:text-white flex items-center gap-2">
                        <span className="text-neon-blue">🧪</span> {t.simulator}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{t.simulationDesc}</p>
                </div>
                <button
                    onClick={reset}
                    className="text-xs font-bold text-neon-blue hover:underline bg-neon-blue/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    {t.reset}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sliders */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-emerald-800 dark:text-slate-300 font-medium">{t.moisture}</label>
                            <span className="text-neon-blue font-bold">{values.soilMoisture}%</span>
                        </div>
                        <input
                            type="range" name="soilMoisture" min="0" max="100"
                            value={values.soilMoisture} onChange={handleChange}
                            className="w-full accent-neon-blue h-1.5 bg-green-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-slate-300 font-medium">{t.temperature}</label>
                            <span className="text-neon-green font-bold">{values.temperature}°C</span>
                        </div>
                        <input
                            type="range" name="temperature" min="0" max="60"
                            value={values.temperature} onChange={handleChange}
                            className="w-full accent-neon-green h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-slate-300 font-medium">{t.ph}</label>
                            <span className="text-neon-purple font-bold">{values.ph}</span>
                        </div>
                        <input
                            type="range" name="ph" min="0" max="14" step="0.1"
                            value={values.ph} onChange={handleChange}
                            className="w-full accent-neon-purple h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-slate-300 font-medium">{t.humidity}</label>
                            <span className="text-blue-400 font-bold">{values.humidity}%</span>
                        </div>
                        <input
                            type="range" name="humidity" min="0" max="100"
                            value={values.humidity} onChange={handleChange}
                            className="w-full accent-blue-400 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="bg-green-100/50 dark:bg-white/5 rounded-2xl p-5 border border-green-300 dark:border-white/5 flex flex-col justify-center relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-dark-900/40 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                            <div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                        </div>
                    )}

                    <div className="space-y-6 text-center">
                        <div>
                            <p className="text-xs text-emerald-700 dark:text-slate-400 uppercase tracking-widest mb-1">{t.predictedHealth}</p>
                            <div className={`text-4xl font-black ${prediction ? getHealthColor(prediction.cropHealth) : 'text-slate-400 dark:text-emerald-700'}`}>
                                {prediction ? `${prediction.cropHealth}%` : '--%'}
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-green-200 dark:via-white/10 to-transparent" />

                        <div>
                            <p className="text-xs text-emerald-700 dark:text-slate-400 uppercase tracking-widest mb-1">{t.predictedPest}</p>
                            <div className={`text-2xl font-bold ${prediction ? getPestColor(prediction.pestRisk) : 'text-slate-400 dark:text-emerald-700'}`}>
                                {prediction ? (lang === 'hi' ? (prediction.pestRisk === 'Low' ? t.low : prediction.pestRisk === 'Medium' ? t.medium : t.high) : prediction.pestRisk) : '---'}
                            </div>
                        </div>

                        {prediction?.recommendation && (
                            <div className="mt-4 p-3 bg-white dark:bg-white/5 rounded-xl border border-green-300 dark:border-white/5 text-left">
                                <p className="text-[10px] text-neon-blue font-bold uppercase mb-1">{t.recommendation}</p>
                                <p className="text-xs text-emerald-800 dark:text-slate-300 leading-relaxed italic">
                                    "{prediction.recommendation}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
