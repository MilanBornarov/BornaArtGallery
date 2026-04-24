import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'register' && password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (tab === 'register' && password.length < 10) {
      setError(t('auth.passwordLength'));
      return;
    }

    setLoading(true);

    try {
      const user = tab === 'login'
        ? await login(email, password)
        : await register(email, password);

      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell flex items-center justify-center px-6 py-12">
      <div className="auth-card">
        <div className="auth-tabs">
          {(['login', 'register'] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setError('');
              }}
              className={`auth-tab ${tab === item ? 'auth-tab-active' : ''}`}
            >
              {item === 'login' ? t('auth.login').toUpperCase() : t('auth.register').toUpperCase()}
            </button>
          ))}
        </div>

        <h1 className="section-title text-wrap-safe mb-2 text-center">
          {tab === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
        </h1>

        <p className="text-wrap-safe mx-auto max-w-full text-center text-sm leading-6 text-slate-300 mb-6">
          {tab === 'login' ? t('auth.loginBody') : t('auth.registerBody')}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-wider uppercase text-slate-300 mb-1.5">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-slate-300 mb-1.5">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="********"
              required
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-300 mb-1.5">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-field"
                placeholder="********"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : tab === 'login' ? t('auth.login') : t('auth.createAccountButton')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-300">
          <Link to="/" className="hover:text-white transition-colors">
            &larr; {t('auth.backToGallery')}
          </Link>
        </p>
      </div>
    </main>
  );
}
