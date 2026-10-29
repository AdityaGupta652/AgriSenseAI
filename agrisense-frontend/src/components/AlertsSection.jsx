import translations from '../i18n';

const severityConfig = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500', label: '🔴' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400', label: '🟡' },
    info: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-neon-green', label: '🟢' },
};

export default function AlertsSection({ alerts, lang }) {
    const t = translations[lang];
    const dynamicT = translations.dynamic[lang];

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🚨</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.alerts}</h2>
                {alerts?.length > 0 && (
                    <span className="ml-auto bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                        {alerts.filter(a => a.severity !== 'info').length}
                    </span>
                )}
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scroll">
                {(!alerts || alerts.length === 0) ? (
                    <div className="text-emerald-700 dark:text-slate-400 text-sm text-center py-6">{t.noAlerts}</div>
                ) : (
                    alerts.map((alert) => {
                        const cfg = severityConfig[alert.severity] || severityConfig.info;
                        return (
                            <div
                                key={alert.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} transition-all duration-300`}
                            >
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot} ${alert.severity === 'critical' ? 'animate-pulse' : ''}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${cfg.text}`}>{dynamicT[alert.message] || alert.message}</p>
                                    {alert.time && (
                                        <p className="text-xs text-emerald-600 mt-0.5">
                                            {new Date(alert.time).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
