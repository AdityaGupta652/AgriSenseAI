import translations from '../i18n';

function ProgressBar({ value, max = 100, color = 'blue' }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const colorMap = {
        blue: 'from-neon-blue to-cyan-400',
        green: 'from-neon-green to-green-400',
        yellow: 'from-yellow-400 to-orange-400',
        red: 'from-red-500 to-red-400',
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

function getMoistureColor(v) { return v < 35 ? 'red' : v < 55 ? 'yellow' : 'blue'; }
function getTempColor(v) { return v > 40 ? 'red' : v > 35 ? 'yellow' : 'blue'; }
function getPhColor(v) { return (v < 5.5 || v > 7.5) ? 'red' : (v < 6 || v > 7) ? 'yellow' : 'green'; }

export default function SoilCard({ data, lang }) {
    const t = translations[lang];
    if (!data) return null;
    const { soilMoisture, temperature, ph } = data;

    const metrics = [
        {
            label: t.moisture,
            value: soilMoisture,
            unit: '%',
            icon: '💧',
            max: 100,
            color: getMoistureColor(soilMoisture),
        },
        {
            label: t.temperature,
            value: temperature,
            unit: '°C',
            icon: '🌡️',
            max: 50,
            color: getTempColor(temperature),
        },
        {
            label: t.ph,
            value: ph,
            unit: '',
            icon: '🧪',
            max: 14,
            color: getPhColor(ph),
        },
    ];

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6 hover:border-neon-blue/30 dark:hover:border-neon-blue/30 transition-colors">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🌍</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.soilData}</h2>
            </div>
            <div className="space-y-5">
                {metrics.map(({ label, value, unit, icon, max, color }) => (
                    <div key={label}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-slate-300 text-sm">
                                <span>{icon}</span> {label}
                            </span>
                            <span className={`font-bold text-lg ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'green' ? 'text-neon-green' : 'text-neon-blue'}`}>
                                {value}{unit}
                            </span>
                        </div>
                        <ProgressBar value={value} max={max} color={color} />
                    </div>
                ))}
            </div>
        </div>
    );
}
