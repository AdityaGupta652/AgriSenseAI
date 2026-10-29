import translations from '../i18n';

export default function AIInsightsPanel({ data, lang }) {
    const t = translations[lang];
    if (!data) return null;

    const { recommendation, cropHealth, pestRisk } = data;

    const dynamicT = translations.dynamic[lang];
    const insights = [];

    if (recommendation) {
        // Split multi-sentence recommendations into bullet points
        const sentences = recommendation.split(/\.\s+/).filter(Boolean);
        insights.push(...sentences.map(s => {
            const cleanS = s.replace(/\.$/, '').trim();
            return dynamicT[cleanS] || cleanS;
        }));
    }

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-neon-blue/20 p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🧠</span>
                <div>
                    <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.aiInsights}</h2>
                    <p className="text-xs text-neon-blue/70">{t.aiPowered}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-neon-blue/10 border border-neon-blue/20 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    <span className="text-xs text-neon-blue font-medium">LIVE</span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-100/50 dark:bg-dark-900/40 rounded-xl p-3 text-center border border-green-300 dark:border-white/5">
                    <div className="text-2xl font-black text-emerald-950 dark:text-white">{cropHealth ?? '--'}</div>
                    <div className="text-xs text-emerald-700 dark:text-slate-400 mt-1">{t.healthScore}</div>
                </div>
                <div className={`rounded-xl p-3 text-center border ${pestRisk === 'High' ? 'bg-red-500/10 border-red-500/30' :
                    pestRisk === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-green-500/10 border-green-500/30'
                    }`}>
                    <div className={`text-lg font-black ${pestRisk === 'High' ? 'text-red-400' :
                        pestRisk === 'Medium' ? 'text-yellow-400' : 'text-neon-green'
                        }`}>{pestRisk ?? '--'}</div>
                    <div className="text-xs text-slate-400 mt-1">{t.pestRisk}</div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2.5">
                <p className="text-xs font-semibold text-emerald-700 dark:text-slate-400 uppercase tracking-wider">{t.recommendation}</p>
                {insights.length > 0 ? (
                    insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-green-100/50 dark:bg-dark-900/40 rounded-lg p-3 border border-green-300 dark:border-white/5">
                            <span className="text-neon-blue mt-0.5 text-lg flex-shrink-0">
                                {i === 0 ? '💡' : i === 1 ? '🌾' : '📋'}
                            </span>
                            <p className="text-emerald-800 dark:text-slate-300 text-sm leading-relaxed">{insight}</p>
                        </div>
                    ))
                ) : (
                    <div className="bg-green-100/50 dark:bg-dark-900/40 rounded-lg p-3 border border-green-300 dark:border-white/5">
                        <p className="text-emerald-700 dark:text-slate-400 text-sm">{dynamicT['Crop conditions are optimal. Continue regular monitoring.'] || 'Crop conditions are optimal. Continue regular monitoring.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
