import translations from '../i18n';

function ProgressBar({ value, max = 100, color = 'green' }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const colorMap = {
        blue: 'from-neon-blue to-cyan-400',
        green: 'from-neon-green to-green-400',
        yellow: 'from-yellow-400 to-orange-400',
        red: 'from-red-500 to-red-400',
        purple: 'from-purple-500 to-fuchsia-400'
    };
    return (
        <div className="w-full bg-green-100 dark:bg-dark-900/60 rounded-full h-2 overflow-hidden">
            <div
                className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-700`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function getNColor(v) { return v < 40 ? 'red' : v > 200 ? 'yellow' : 'green'; }
function getPColor(v) { return v < 20 ? 'red' : v > 100 ? 'yellow' : 'purple'; }
function getKColor(v) { return v < 100 ? 'red' : v > 300 ? 'yellow' : 'blue'; }

export default function NPKCard({ data, lang }) {
    const t = translations[lang];
    if (!data) return null;
    
    // Provide sensible defaults if n, p, k are not present in older history data
    const n = data.n ?? 80;
    const p = data.p ?? 40;
    const k = data.k ?? 150;

    const metrics = [
        {
            label: t.nitrogen,
            value: Math.round(n),
            unit: ' mg/kg',
            icon: '🌱',
            max: 200,
            color: getNColor(n),
        },
        {
            label: t.phosphorus,
            value: Math.round(p),
            unit: ' mg/kg',
            icon: '🧬',
            max: 120,
            color: getPColor(p),
        },
        {
            label: t.potassium,
            value: Math.round(k),
            unit: ' mg/kg',
            icon: '🍌',
            max: 350,
            color: getKColor(k),
        },
    ];

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 hover:border-neon-green/30 dark:hover:border-neon-green/30 transition-colors">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">📊</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.npkReport}</h2>
            </div>
            <div className="space-y-5">
                {metrics.map(({ label, value, unit, icon, max, color }) => (
                    <div key={label}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-slate-300 text-sm">
                                <span>{icon}</span> {label}
                            </span>
                            <span className={`font-bold text-lg ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'green' ? 'text-neon-green' : color === 'purple' ? 'text-purple-400' : 'text-neon-blue'}`}>
                                {value}<span className="text-xs font-normal opacity-70">{unit}</span>
                            </span>
                        </div>
                        <ProgressBar value={value} max={max} color={color} />
                    </div>
                ))}
            </div>
        </div>
    );
}
