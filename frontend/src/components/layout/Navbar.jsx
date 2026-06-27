import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/UI';

export default function Navbar() {
  const { user, logout, t, lang, toggleLang, showAuth, setShowAuth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (p) => path === p || path.startsWith(p + '/');

  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          🏠 Loyer<span>Mboa</span>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links">
          <button className={`nav-link ${isActive('/listings') ? 'active' : ''}`}
            onClick={() => navigate('/listings')}>{t.nav.listings}</button>
          <button className={`nav-link ${isActive('/map') ? 'active' : ''}`}
            onClick={() => navigate('/map')}>{t.nav.map}</button>
          {user && (
            <button className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
              onClick={() => navigate('/favorites')}>{t.nav.favorites}</button>
          )}
          {user && (
            <button className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}>{t.nav.dashboard}</button>
          )}
        </div>

        <div className="nav-spacer" />

        {/* Right side */}
        <div className="nav-actions">
          {/* Language toggle */}
          <button className="lang-btn" onClick={toggleLang} title="Switch language">
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              → {lang === 'fr' ? 'EN' : 'FR'}
            </span>
          </button>

          {user ? (
            <>
              {/* Notification bell */}
              <div className="notif-wrapper">
                <button className="btn btn-sm" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔔
                </button>
                <div className="notif-dot" />
              </div>
              {/* Avatar */}
              <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <Avatar name={user.fullname} size={34} />
              </div>
              {/* Logout */}
              <button className="btn btn-outline btn-sm" onClick={logout}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAuth('login')}>
                {t.nav.login}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth('register')}>
                {t.nav.register}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
