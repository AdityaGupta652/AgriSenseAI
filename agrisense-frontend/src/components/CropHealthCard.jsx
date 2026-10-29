import translations from '../i18n';

function getHealthStatus(score, t) {
    if (score >= 75) return { label: t.excellent, color: '#39ff14', ring: 'shadow-neon-green' };
    if (score >= 50) return { label: t.good, color: '#00f0ff', ring: 'shadow-neon' };
    if (score >= 25) return { label: t.warning, color: '#f59e0b', ring: '' };
    return { label: t.critical, color: '#ef4444', ring: 'shadow-neon-red' };
}

export default function CropHealthCard({ data, lang }) {
    const t = translations[lang];
    if (!data) return null;
    const score = data.cropHealth ?? 0;
    const { label, color, ring } = getHealthStatus(score, t);

    const circumference = 2 * Math.PI * 40;
    const dashOffset = circumference * (1 - score / 100);

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 hover:border-neon-green/30 dark:hover:border-neon-green/30 transition-colors">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🌿</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.cropHealth}</h2>
            </div>

            <div className="flex flex-col items-center gap-4">
                {/* Radial gauge */}
                <div className={`relative w-32 h-32 ${ring}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2740" strokeWidth="10" />
                        <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke={color}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000"
                            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-emerald-950 dark:text-white">{score}</span>
                        <span className="text-xs text-emerald-700 dark:text-slate-400">/100</span>
                    </div>
                </div>

                <div className="text-center">
                    <span
                        className="px-4 py-1.5 rounded-full text-sm font-bold border"
                        style={{ color, borderColor: color + '60', background: color + '15' }}
                    >
                        {label}
                    </span>
                </div>

                <p className="text-xs text-emerald-700 dark:text-slate-400 text-center">{t.healthScore}</p>
            </div>
        </div>
    );
}
