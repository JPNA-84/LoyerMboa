import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProperties } from '../hooks/useData';
import PropertyCard from '../components/property/PropertyCard';
import Footer from '../components/layout/Footer';
import { Spinner } from '../components/common/UI';
import api from '../utils/api';

function MapPreview({ listings }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const s = t.sections;
  const pins = [
    { top: 32, left: 40 }, { top: 50, left: 58 }, { top: 24, left: 66 },
    { top: 64, left: 34 }, { top: 42, left: 72 }, { top: 20, left: 50 },
    { top: 76, left: 54 }, { top: 58, left: 44 },
  ];
  return (
    <div className="map-section">
      <div className="map-inner">
        <div className="map-text">
          <h2>{s.mapTitle}</h2>
          <p>{s.mapDesc}</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/map')}>
            {s.openMap}
          </button>
        </div>
        <div className="map-canvas">
          <svg style={{ position: 'absolute', inset: 0, opacity: .12, width: '100%', height: '100%' }} viewBox="0 0 400 320">
            {[50,100,150,200,250,300].map(y => <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeWidth="1"/>)}
            {[50,100,150,200,250,300,350].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="320" stroke="white" strokeWidth="1"/>)}
          </svg>
          {listings.slice(0, 8).map((p, i) => {
            const pin = pins[i] || { top: 50, left: 50 };
            return (
              <div key={p._id} className="map-pin" style={{ top: `${pin.top}%`, left: `${pin.left}%` }}>
                <div className="map-pin-dot" style={{ background: p.status === 'verified' ? 'var(--accent)' : '#aaa' }}>
                  <span className="map-pin-inner">{i + 1}</span>
                </div>
              </div>
            );
          })}
          <div className="map-overlay-label">
            Yaoundé, Cameroun<br />
            <span style={{ fontSize: '0.8rem' }}>🏠 {listings.length} {t.map.available}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t, lang, setSelectedProperty } = useApp();
  const navigate = useNavigate();
  const h = t.hero;
  const s = t.sections;

  const [search, setSearch] = useState({ quarter: '', minPrice: '', maxPrice: '', propertyType: '' });
  const [stats, setStats] = useState({ total: 0, quarters: 0 });
  const [realReviews, setRealReviews] = useState([]);

  const { data: allProps, loading } = useProperties({ limit: 9 });
  const featured = allProps.filter(p => p.status === 'verified').slice(0, 3);
  const recent = [...allProps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  // Fetch real stats
  useEffect(() => {
    api.get('/properties/search?limit=100')
      .then(res => {
        const props = res.data.data || [];
        const uniqueQuarters = [...new Set(props.map(p => p.quarter).filter(Boolean))];
        setStats({ total: res.data.total || props.length, quarters: uniqueQuarters.length });
      })
      .catch(() => {});
  }, []);

  // Fetch real reviews
  useEffect(() => {
    if (allProps.length === 0) return;
    const promises = allProps.slice(0, 5).map(p =>
      api.get(`/reviews/${p._id}`).then(r => r.data.data || []).catch(() => [])
    );
    Promise.all(promises).then(results => {
      setRealReviews(results.flat().slice(0, 3));
    });
  }, [allProps.length]);

  const handleSearch = () => navigate('/listings?' + new URLSearchParams(
    Object.fromEntries(Object.entries(search).filter(([, v]) => v))
  ).toString());

  const avgRating = allProps.filter(p => p.averageRating > 0).length > 0
    ? (allProps.reduce((sum, p) => sum + (p.averageRating || 0), 0) / allProps.filter(p => p.averageRating > 0).length).toFixed(1)
    : null;

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-tag">🇨🇲 {h.tag}</div>
          <h1>{h.title} <em>{h.titleAccent}</em> {h.titleEnd}</h1>
          <p className="hero-sub">{h.subtitle}</p>
          <div className="hero-search">
            <input
              list="hero-quarters"
              placeholder={h.searchQuarter}
              value={search.quarter}
              onChange={e => setSearch({ ...search, quarter: e.target.value })}
            />
            <datalist id="hero-quarters">
              {t.quarters.map(q => <option key={q} value={q} />)}
            </datalist>
            <input type="number" placeholder={h.searchMinRent}
              value={search.minPrice} onChange={e => setSearch({ ...search, minPrice: e.target.value })} />
            <input type="number" placeholder={h.searchMaxRent}
              value={search.maxPrice} onChange={e => setSearch({ ...search, maxPrice: e.target.value })} />
            <select value={search.propertyType} onChange={e => setSearch({ ...search, propertyType: e.target.value })}>
              <option value="">{h.searchType}</option>
              {t.types.map(ty => <option key={ty}>{ty}</option>)}
            </select>
            <button className="hero-search-btn" onClick={handleSearch}>🔍 {h.searchBtn}</button>
          </div>

          {/* Real stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{stats.total > 0 ? `${stats.total}+` : '—'}</strong>
              <span>{h.stat1Label}</span>
            </div>
            <div className="hero-stat">
              <strong>{stats.quarters > 0 ? stats.quarters : '—'}</strong>
              <span>{h.stat2Label}</span>
            </div>
            <div className="hero-stat">
              <strong>{avgRating ? `${avgRating}★` : lang === 'fr' ? 'Nouveau' : 'New'}</strong>
              <span>{h.stat4Label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured listings */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{s.featuredTitle} <span>{s.featuredAccent}</span></h2>
          <button className="see-all-btn" onClick={() => navigate('/listings')}>{s.seeAll}</button>
        </div>
        {loading ? <Spinner /> : featured.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            {lang === 'en' ? 'No listings yet.' : 'Aucune annonce pour le moment.'}
          </p>
        ) : (
          <div className="grid-3">
            {featured.map(p => <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />)}
          </div>
        )}
      </div>

      {/* Map preview */}
      <MapPreview listings={allProps} />

      {/* Recent listings */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{s.recentTitle} <span>{s.recentAccent}</span></h2>
          <button className="see-all-btn" onClick={() => navigate('/listings')}>{s.seeAll}</button>
        </div>
        {loading ? <Spinner /> : recent.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            {lang === 'en' ? 'No listings yet.' : 'Aucune annonce pour le moment.'}
          </p>
        ) : (
          <div className="grid-3">
            {recent.map(p => <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />)}
          </div>
        )}
      </div>

      {/* Real reviews — only shown if they exist */}
      {realReviews.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">{s.testiTitle} <span>{s.testiAccent}</span></h2>
          </div>
          <div className="grid-3">
            {realReviews.map((review, i) => (
              <div key={review._id || i} className="testi-card">
                <div style={{ display: 'flex', gap: 2, color: 'var(--accent)', marginBottom: 12 }}>
                  {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                </div>
                <p className="testi-text">"{review.comment}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">
                    {(review.tenant?.fullname || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {review.tenant?.fullname || (lang === 'en' ? 'Tenant' : 'Locataire')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lang === 'en' ? '✓ Verified tenant' : '✓ Locataire vérifié'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}