import translations from '../i18n';

const riskConfig = {
    Low: {
        color: '#39ff14',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        icon: '🌿',
        pulse: 'bg-neon-green',
    },
    Medium: {
        color: '#f59e0b',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        icon: '⚠️',
        pulse: 'bg-yellow-400',
    },
    High: {
        color: '#ef4444',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: '🐛',
        pulse: 'bg-red-500',
    },
};

export default function PestRiskCard({ data, lang }) {
    const t = translations[lang];
    if (!data) return null;

    const risk = data.pestRisk || 'Low';
    const cfg = riskConfig[risk] || riskConfig.Low;
    const riskLabel = { Low: t.low, Medium: t.medium, High: t.high }[risk] || risk;

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 hover:border-yellow-500/30 dark:hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🐛</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.pestRisk}</h2>
            </div>

            <div className="flex flex-col items-center gap-4">
                {/* Pulsing indicator */}
                <div className="relative flex items-center justify-center w-28 h-28">
                    {risk === 'High' && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                            <div className="absolute inset-4 rounded-full bg-red-500/10 animate-ping" style={{ animationDelay: '0.5s' }} />
                        </>
                    )}
                    <div className={`w-24 h-24 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center text-5xl`}
                        style={{ boxShadow: `0 0 20px ${cfg.color}40` }}>
                        {cfg.icon}
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-5 py-2 rounded-full border ${cfg.border} ${cfg.bg}`}>
                    <div className={`w-2 h-2 rounded-full ${cfg.pulse} ${risk === 'High' ? 'animate-pulse' : ''}`} />
                    <span className="font-bold text-lg" style={{ color: cfg.color }}>{riskLabel}</span>
                </div>

                {/* Humidity */}
                {data.humidity != null && (
                    <div className="w-full flex justify-between text-sm text-emerald-700 dark:text-slate-400 border-t border-green-300 dark:border-white/5 pt-3">
                        <span>{t.humidity}</span>
                        <span className="text-neon-blue font-semibold">{data.humidity}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
