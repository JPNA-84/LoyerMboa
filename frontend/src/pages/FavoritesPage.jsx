import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { favoriteAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import { Spinner, EmptyState } from '../components/common/UI';

export default function FavoritesPage() {
  const { t, user, setSelectedProperty, setShowAuth } = useApp();
  const f = t.favorites;
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    favoriteAPI.getAll()
      .then(res => setFavorites(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="section">
        <EmptyState
          icon="🔒"
          title={t.common.loginRequired}
          desc={t.common.loginRequiredDesc}
          action={
            <button className="btn btn-primary" onClick={() => setShowAuth('login')}>
              {t.nav.login}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="dash-header">
        <h2>{f.title}</h2>
        <p className="text-muted">{favorites.length} {f.subtitle}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="🤍"
          title={f.empty}
          desc={f.emptyDesc}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/listings')}>
              {t.sections.seeAll}
            </button>
          }
        />
      ) : (
        <div className="grid-3">
          {favorites.map(p => (
            <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
