import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, favoriteAPI } from '../utils/api';
import fr from '../locales/fr';
import en from '../locales/en';

const AppCtx = createContext({});

export function AppProvider({ children }) {
  // ── Language ────────────────────────────────────────────
  const [lang, setLang] = useState(() => localStorage.getItem('lm_lang') || 'fr');
  const t = lang === 'fr' ? fr : en;
  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    localStorage.setItem('lm_lang', next);
  };

  // ── Toast ───────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  // ── Auth ────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lm_user')); } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('lm_token', data.token);
      localStorage.setItem('lm_user', JSON.stringify(data.user));
      setUser(data.user);
      showToast(`${t.auth.welcome}, ${data.user.fullname.split(' ')[0]}! 🎉`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t.common.error;
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setAuthLoading(false);
    }
  }, [t, showToast]);

  const register = useCallback(async (formData) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem('lm_token', data.token);
      localStorage.setItem('lm_user', JSON.stringify(data.user));
      setUser(data.user);
      showToast(`${t.auth.welcome}, ${data.user.fullname.split(' ')[0]}! 🎉`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t.common.error;
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setAuthLoading(false);
    }
  }, [t, showToast]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    setUser(null);
    setFavoriteIds([]);
    showToast(t.auth.loggedOut);
  }, [t, showToast]);

  // ── Favorites ───────────────────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'tenant') return;
    favoriteAPI.getAll()
      .then(({ data }) => setFavoriteIds(data.data.map(p => p._id)))
      .catch(() => {});
  }, [user]);

  const toggleFavorite = useCallback(async (propertyId) => {
    if (!user) return showToast(t.property.loginToFav, 'error');
    const isFav = favoriteIds.includes(propertyId);
    try {
      if (isFav) {
        await favoriteAPI.remove(propertyId);
        setFavoriteIds(ids => ids.filter(id => id !== propertyId));
        showToast(t.property.removeFav);
      } else {
        await favoriteAPI.add(propertyId);
        setFavoriteIds(ids => [...ids, propertyId]);
        showToast(t.property.addFav);
      }
    } catch (err) {
      showToast(err.response?.data?.message || t.common.error, 'error');
    }
  }, [user, favoriteIds, t, showToast]);

  // ── Modal state ─────────────────────────────────────────
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddListing, setShowAddListing] = useState(false);

  return (
    <AppCtx.Provider value={{
      // language
      lang, t, toggleLang,
      // auth
      user, authLoading, login, register, logout,
      // favorites
      favoriteIds, toggleFavorite,
      // toast
      toasts, showToast,
      // modals
      selectedProperty, setSelectedProperty,
      showAuth, setShowAuth,
      showAddListing, setShowAddListing,
    }}>
      {children}
      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
export default AppCtx;