import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import translations from '../i18n';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#39ff14', '#f59e0b', '#ef4444'];
const PEST_LABELS = ['Low', 'Medium', 'High'];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass border border-green-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-950 dark:text-white shadow-xl">
            <p className="text-emerald-700 dark:text-slate-400 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
            ))}
        </div>
    );
}

export default function Charts({ history, lang }) {
    const t = translations[lang];
    const { theme } = useTheme();
    const [showSummary, setShowSummary] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!history || !history.length) return null;

    const generateSummary = () => {
        setIsGenerating(true);
        // Fake generation delay for better UX
        setTimeout(() => {
            setShowSummary(true);
            setIsGenerating(false);
        }, 800);
    };

    const speakText = () => {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis not supported in this browser');
            return;
        }

        try {
            window.speechSynthesis.cancel();
            
            // Strip emojis using a simpler, more compatible method
            let cleanText = summaryText;
            cleanText = cleanText.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
            cleanText = cleanText.replace(/[^\p{L}\p{N}\s.,:!?'\-]/gu, ''); // Keep only letters, numbers, spaces, punctuation
            
            if (!cleanText.trim()) {
                alert('No text to read after emoji removal');
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
            utterance.lang = langMap[lang] || 'en-US';
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                alert(`Error: ${event.error}`);
            };
            
            utterance.onend = () => {
                console.log('Speech ended');
            };
            
            window.speechSynthesis.speak(utterance);
            console.log('Speaking started');
        } catch (error) {
            console.error('Speech synthesis error:', error);
            alert(`Error: ${error.message}`);
        }
    };

    let summaryText = "";
    if (showSummary) {
        if (history.length < 2) {
            summaryText = "Not enough data to calculate a trend. Please generate more readings.";
        } else {
            const first = history[0];
            const latest = history[history.length - 1];

            summaryText = t.sumIntro || "Here is a detailed breakdown of how your farm is doing:\n\n";
            
            // 1. Overall Health
            summaryText += `${t.sumHealthScore || '📊 Crop Health Score: '}${latest.cropHealth}/100. `;
            if (latest.cropHealth >= 75) {
                summaryText += t.sumHealthGood;
            } else if (latest.cropHealth >= 50) {
                summaryText += t.sumHealthOk;
            } else {
                summaryText += t.sumHealthBad;
            }

            // 2. Water / Moisture
            summaryText += `${t.sumMoistureTemp1 || '\n💧 Soil Moisture & Temp: The moisture level is currently measuring at '}${latest.soilMoisture}${t.sumMoistureTemp2 || '%, with a temperature of '}${latest.temperature}${t.sumTempSuffix || '°C. '}`;
            if (latest.soilMoisture < 40) {
                summaryText += t.sumWaterDry;
            } else if (latest.soilMoisture > 75) {
                summaryText += t.sumWaterWet;
            } else {
                summaryText += t.sumWaterOk;
            }

            // 3. Bugs / Pest Risk
            const translatedPestRisk = t[latest.pestRisk] || latest.pestRisk;
            summaryText += `${t.sumPestThreat || '\n🐛 Pest Risk Analysis: Current threat level is '}${translatedPestRisk}. `;
            if (latest.pestRisk === 'High') {
                summaryText += t.sumBugHigh;
            } else if (latest.pestRisk === 'Medium') {
                summaryText += t.sumBugMed;
            } else {
                summaryText += t.sumPestSafe || 'Your crops are currently safe from any immediate pest threats. ';
            }

            // 4. Soil Food (Nutrients / NPK)
            summaryText += `${t.sumNutrients || '\n🧪 Soil Nutrients (Nitrogen: '}${latest.n}${t.sumPhos || ', Phosphorus: '}${latest.p}${t.sumPotas || ', Potassium: '}${latest.k}${t.sumEnd || '): '}`;
            let missingNutrients = [];
            if (latest.n < 40) missingNutrients.push(t.sumN);
            if (latest.p < 20) missingNutrients.push(t.sumP);
            if (latest.k < 150) missingNutrients.push(t.sumK);

            if (missingNutrients.length > 0) {
                summaryText += `${t.sumHungryPrefix}${missingNutrients.join(', ')}${t.sumHungrySuffix}`;
            } else {
                summaryText += t.sumRich;
            }
        }
    }

    const chartData = history.map((item, i) => ({
        name: `#${i + 1}`,
        [t.moisture]: item.soilMoisture,
        [t.temperature]: item.temperature,
        [t.healthScore]: item.cropHealth,
        [t.nitrogen]: Math.round(item.n ?? 80),
        [t.phosphorus]: Math.round(item.p ?? 40),
        [t.potassium]: Math.round(item.k ?? 150),
    }));

    const pestCounts = { Low: 0, Medium: 0, High: 0 };
    history.forEach((h) => { if (pestCounts[h.pestRisk] !== undefined) pestCounts[h.pestRisk]++; });
    const pieData = PEST_LABELS.map((lbl, i) => ({
        name: lbl, value: pestCounts[lbl], color: COLORS[i],
    })).filter((d) => d.value > 0);

    const axisStyle = { fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 };
    const gridStyle = { stroke: theme === 'dark' ? '#1a2740' : '#e2e8f0', strokeDasharray: '3 3' };

    return (
        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📈</span>
                <h2 className="text-emerald-950 dark:text-white font-bold text-lg">{t.charts}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Moisture Line Chart */}
                <div>
                    <h3 className="text-emerald-700 dark:text-slate-400 text-sm font-medium mb-3">{t.moistureTrend}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData}>
                            <CartesianGrid {...gridStyle} />
                            <XAxis dataKey="name" tick={axisStyle} />
                            <YAxis tick={axisStyle} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey={t.moisture} stroke="#00f0ff" strokeWidth={2} dot={{ fill: '#00f0ff', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Temperature Line Chart */}
                <div>
                    <h3 className="text-emerald-700 dark:text-slate-400 text-sm font-medium mb-3">{t.tempTrend}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData}>
                            <CartesianGrid {...gridStyle} />
                            <XAxis dataKey="name" tick={axisStyle} />
                            <YAxis tick={axisStyle} domain={[0, 50]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey={t.temperature} stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Crop Health Bar Chart */}
                <div>
                    <h3 className="text-emerald-700 dark:text-slate-400 text-sm font-medium mb-3">{t.healthHistory}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData}>
                            <CartesianGrid {...gridStyle} />
                            <XAxis dataKey="name" tick={axisStyle} />
                            <YAxis tick={axisStyle} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey={t.healthScore} radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, i) => {
                                    const v = entry[t.healthScore];
                                    const color = v >= 75 ? '#39ff14' : v >= 50 ? '#00f0ff' : v >= 25 ? '#f59e0b' : '#ef4444';
                                    return <Cell key={i} fill={color} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pest Risk Pie Chart */}
                <div>
                    <h3 className="text-emerald-700 dark:text-slate-400 text-sm font-medium mb-3">{t.pestDistribution}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%" cy="50%"
                                innerRadius={45} outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color})` }} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* NPK Values Line Chart */}
                <div className="lg:col-span-2 mt-4">
                    <h3 className="text-emerald-700 dark:text-slate-400 text-sm font-medium mb-3">{t.npkReport}</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid {...gridStyle} />
                            <XAxis dataKey="name" tick={axisStyle} />
                            <YAxis tick={axisStyle} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Line type="monotone" name={t.nitrogen} dataKey={t.nitrogen} stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" name={t.phosphorus} dataKey={t.phosphorus} stroke="#bf5fff" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" name={t.potassium} dataKey={t.potassium} stroke="#00f0ff" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-5 border-t border-green-300 dark:border-white/10 pt-6">
                <button
                    onClick={generateSummary}
                    disabled={isGenerating}
                    className="px-6 py-2.5 rounded-xl bg-neon-blue text-dark-900 font-bold hover:shadow-neon transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                            Analyzing Data...
                        </>
                    ) : (
                        <>
                            <span className="text-xl">✨</span> {t.summarizeAnalytics || 'Generate Data Summary'}
                        </>
                    )}
                </button>

                {showSummary && !isGenerating && (
                    <div className="glass w-full max-w-4xl rounded-2xl border border-green-300 dark:border-neon-blue/30 p-5 text-emerald-950 dark:text-white leading-relaxed flex items-start gap-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex flex-shrink-0 items-center justify-center text-2xl border border-neon-blue/40 shadow-neon">
                            🤖
                        </div>
                        <div className="flex-1 mt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                <p className="text-sm font-bold text-neon-blue uppercase tracking-widest">
                                    {t.aiInsights || 'AI Insight Summary'}
                                </p>
                                <button
                                    onClick={speakText}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-dark-900 bg-neon-blue rounded-full hover:bg-white hover:text-neon-blue transition-colors shadow-sm"
                                    title="Read Aloud"
                                >
                                    🔊 Play Audio
                                </button>
                            </div>
                            <p className="font-medium text-[15px] whitespace-pre-wrap">{summaryText}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
