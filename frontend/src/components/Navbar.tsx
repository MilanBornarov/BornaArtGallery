import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      onClick={() => setMenuOpen(false)}
      className={`nav-premium-link ${isActive(path) ? 'nav-premium-link-active' : ''}`}
    >
      {label.toUpperCase()}
    </Link>
  );

  const languageToggle = (
    <div
      className="nav-language-toggle"
      role="group"
      aria-label={t('nav.language')}
    >
      {(['en', 'mk'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={`nav-language-option ${
            locale === option ? 'nav-language-option-active' : ''
          }`}
          aria-pressed={locale === option}
          title={`${t('nav.language')}: ${option.toUpperCase()}`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <nav className="nav-premium-shell">
      <div className="nav-premium-bar">
        <Link to="/" className="nav-logo-link">
          <img src="/logo.png" alt="" className="nav-logo-image" aria-hidden="true" />
          <div className="nav-logo-copy hidden lg:flex">
            <span className="nav-logo-title">{t('common.brand')}</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10">
          {navLink('/gallery', t('nav.gallery'))}
          {navLink('/about', t('nav.about'))}
          {navLink('/contact', t('nav.contact'))}
          {isAdmin && navLink('/admin', t('nav.dashboard'))}
        </div>

        <div className="hidden md:flex items-center justify-end gap-3 lg:gap-5">
          {languageToggle}

          {isLoggedIn ? (
            <div className="flex items-center gap-3 lg:gap-5">
              <span className="nav-user-email hidden xl:inline">{user?.email}</span>
              {!isAdmin && (
                <Link to="/favorites" className="nav-premium-link nav-premium-link-compact">
                  {t('nav.favorites')}
                </Link>
              )}
              <button onClick={() => void handleLogout()} className="nav-action-btn">
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-action-btn">
              {t('nav.signIn')}
            </Link>
          )}
        </div>

        <button
          className="nav-mobile-toggle md:hidden ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('nav.toggleMenu')}
          aria-expanded={menuOpen}
        >
          <span
            className={`nav-mobile-toggle-line ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`nav-mobile-toggle-line ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`nav-mobile-toggle-line ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-panel md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.68rem] uppercase tracking-[0.26em] text-[rgba(246,240,232,0.48)]">
              {t('nav.language')}
            </span>
            {languageToggle}
          </div>

          {navLink('/', t('nav.home'))}
          {navLink('/gallery', t('nav.gallery'))}
          {navLink('/about', t('nav.about'))}
          {navLink('/contact', t('nav.contact'))}
          {isAdmin && navLink('/admin', t('nav.dashboard'))}
          {isLoggedIn && !isAdmin && navLink('/favorites', t('nav.favorites'))}

          <div className="border-t border-white/10 pt-4">
            {isLoggedIn ? (
              <button onClick={() => void handleLogout()} className="nav-action-btn w-full justify-center">
                {t('nav.signOut')}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="nav-action-btn w-full justify-center"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
