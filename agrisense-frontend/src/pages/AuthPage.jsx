import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, signup } from '../api';
import translations from '../i18n';

export default function AuthPage({ lang }) {
    const t = translations[lang];
    const { loginUser } = useAuth();
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
        if (tab === 'signup' && !form.name) { setError('Please enter your name.'); return; }
        if (tab === 'signup' && !form.location) { setError('Please enter your location.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setLoading(true);
        try {
            const res = tab === 'login'
                ? await login({ email: form.email, password: form.password })
                : await signup({ name: form.name, email: form.email, password: form.password, location: form.location });
            loginUser(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 dark:bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Animated background orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass border border-neon-blue/30 mb-4 animate-float shadow-neon">
                        <span className="text-4xl">🌱</span>
                    </div>
                    <h1 className="text-3xl font-bold text-emerald-950 dark:text-white">{t.appName}</h1>
                    <p className="text-neon-blue mt-1 text-sm font-medium tracking-wider uppercase">{t.tagline}</p>
                    <p className="text-emerald-700 dark:text-slate-400 mt-2 text-sm">{t.subtitle}</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-8 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex bg-green-100/60 dark:bg-dark-900/60 rounded-xl p-1 mb-6">
                        {['login', 'signup'].map((t2) => (
                            <button
                                key={t2}
                                onClick={() => { setTab(t2); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 
                  ${tab === t2 ? 'bg-neon-blue/20 text-neon-blue shadow-neon border border-neon-blue/30' : 'text-emerald-700 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white'}`}
                            >
                                {t2 === 'login' ? t.login : t.signup}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'signup' && (
                            <div>
                                <label className="block text-xs font-medium text-emerald-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t.name}</label>
                                <input
                                    type="text" name="name" value={form.name} onChange={handleChange}
                                    placeholder="John Farmer"
                                    className="input-field"
                                    autoComplete="name"
                                />
                            </div>
                        )}
                        {tab === 'signup' && (
                            <div>
                                <label className="block text-xs font-medium text-emerald-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">📍 Location</label>
                                <input
                                    type="text" name="location" value={form.location} onChange={handleChange}
                                    placeholder="e.g., Maharashtra, India"
                                    className="input-field"
                                    autoComplete="address-level1"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-emerald-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t.email}</label>
                            <input
                                type="email" name="email" value={form.email} onChange={handleChange}
                                placeholder="farmer@agrisense.ai"
                                className="input-field"
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-emerald-700 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t.password}</label>
                            <input
                                type="password" name="password" value={form.password} onChange={handleChange}
                                placeholder="••••••••"
                                className="input-field"
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-dark-900 bg-gradient-to-r from-neon-blue to-neon-green hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 mt-2 shadow-neon"
                        >
                            {loading ? '⏳ Please wait...' : (tab === 'login' ? t.loginBtn : t.signupBtn)}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
