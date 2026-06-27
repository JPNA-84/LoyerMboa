import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProperties } from '../hooks/useData';
import PropertyCard from '../components/property/PropertyCard';
import Footer from '../components/layout/Footer';
import { Spinner } from '../components/common/UI';

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
  const { t, setSelectedProperty, setShowAuth, user } = useApp();
  const navigate = useNavigate();
  const h = t.hero;
  const s = t.sections;

  const [search, setSearch] = useState({ quarter: '', minPrice: '', maxPrice: '', propertyType: '' });

  const { data: allProps, loading } = useProperties({ limit: 9 });
  const featured = allProps.filter(p => p.status === 'verified').slice(0, 3);
  const recent = [...allProps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const handleSearch = () => navigate('/listings?' + new URLSearchParams(Object.fromEntries(Object.entries(search).filter(([, v]) => v))).toString());

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-tag">🇨🇲 {h.tag}</div>
          <h1>{h.title} <em>{h.titleAccent}</em> {h.titleEnd}</h1>
          <p className="hero-sub">{h.subtitle}</p>
          <div className="hero-search">
            <select value={search.quarter} onChange={e => setSearch({ ...search, quarter: e.target.value })}>
              <option value="">{h.searchQuarter}</option>
              {t.quarters.map(q => <option key={q}>{q}</option>)}
            </select>
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
          <div className="hero-stats">
            {[
              { v: h.stat1Value, l: h.stat1Label },
              { v: h.stat2Value, l: h.stat2Label },
              { v: h.stat3Value, l: h.stat3Label },
              { v: h.stat4Value, l: h.stat4Label },
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <strong>{s.v}</strong><span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{s.featuredTitle} <span>{s.featuredAccent}</span></h2>
          <button className="see-all-btn" onClick={() => navigate('/listings')}>{s.seeAll}</button>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid-3">
            {featured.map(p => <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />)}
          </div>
        )}
      </div>

      {/* Map preview */}
      <MapPreview listings={allProps} />

      {/* Recent */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{s.recentTitle} <span>{s.recentAccent}</span></h2>
          <button className="see-all-btn" onClick={() => navigate('/listings')}>{s.seeAll}</button>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid-3">
            {recent.map(p => <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />)}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{s.testiTitle} <span>{s.testiAccent}</span></h2>
        </div>
        <div className="grid-3">
          {t.testimonials.map((testi, i) => (
            <div key={i} className="testi-card">
              <div style={{ display: 'flex', gap: 2, color: 'var(--accent)', marginBottom: 12 }}>
                {'★★★★★'}
              </div>
              <p className="testi-text">"{testi.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{testi.init}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{testi.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{testi.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
