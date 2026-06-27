import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AuthModal() {
  const { showAuth, setShowAuth, login, register, authLoading, t } = useApp();
  const [tab, setTab] = useState(showAuth === 'register' ? 'register' : 'login');
  const [role, setRole] = useState('tenant');
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  if (!showAuth) return null;
  const a = t.auth;

  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) { setError(a.requiredFields); return; }
    const res = await login({ email: form.email, password: form.password });
    if (res.success) setShowAuth(false);
    else setError(res.message);
  };

  const handleRegister = async () => {
    setError('');
    if (!form.fullname || !form.email || !form.phone || !form.password) {
      setError(a.requiredFields); return;
    }
    const res = await register({ ...form, role });
    if (res.success) setShowAuth(false);
    else setError(res.message);
  };

  return (
    <div className="overlay" onClick={() => setShowAuth(false)}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏠 LoyerMboa</h3>
          <button className="modal-close" onClick={() => setShowAuth(false)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}>{a.loginTab}</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}>{a.registerTab}</button>
          </div>

          {error && <div className="form-error">⚠️ {error}</div>}

          {tab === 'login' ? (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, background: 'var(--green-light)', padding: '8px 12px', borderRadius: 6 }}>
                💡 {a.demoHint}
              </p>
              <div className="form-group">
                <label className="form-label">{a.emailLabel}</label>
                <input className="form-input" type="email" placeholder={a.emailPlaceholder}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="form-group">
                <label className="form-label">{a.passwordLabel}</label>
                <input className="form-input" type="password" placeholder={a.passwordPlaceholder}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className="form-btn" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? t.common.loading : a.loginBtn}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">{a.iAm}</label>
                <div className="role-selector">
                  <div className={`role-option ${role === 'tenant' ? 'selected' : ''}`}
                    onClick={() => setRole('tenant')}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🏠</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{a.tenant}</div>
                  </div>
                  <div className={`role-option ${role === 'landlord' ? 'selected' : ''}`}
                    onClick={() => setRole('landlord')}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🔑</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{a.landlord}</div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{a.fullname}</label>
                <input className="form-input" placeholder={a.fullnamePlaceholder}
                  value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{a.emailLabel}</label>
                <input className="form-input" type="email" placeholder={a.emailPlaceholder}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{a.phone}</label>
                <input className="form-input" placeholder={a.phonePlaceholder}
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{a.passwordLabel}</label>
                <input className="form-input" type="password" placeholder={a.passwordPlaceholder}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="form-btn" onClick={handleRegister} disabled={authLoading}>
                {authLoading ? t.common.loading : a.registerBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
