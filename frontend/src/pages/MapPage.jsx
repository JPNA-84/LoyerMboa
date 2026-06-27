import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { useProperties } from '../hooks/useData';
import { Spinner } from '../components/common/UI';

// Fix default marker icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Yaoundé center
const YAOUNDE_CENTER = [3.8480, 11.5021];

// Fallback coordinates per quarter
const QUARTER_COORDS = {
  'Bastos': [3.8760, 11.5160],
  'Mvan': [3.8200, 11.5100],
  'Mvog-Ada': [3.8350, 11.5250],
  'Nlongkak': [3.8650, 11.5080],
  'Omnisports': [3.8550, 11.5000],
  'Biyem-Assi': [3.8100, 11.4850],
  'Mendong': [3.7950, 11.4900],
  'Essos': [3.8450, 11.5300],
  'Messa': [3.8780, 11.5050],
  'Ekounou': [3.8250, 11.5350],
  'Nkomo': [3.8150, 11.4950],
  'Obili': [3.8500, 11.4900],
  'Ngousso': [3.8900, 11.5200],
  'Odza': [3.8300, 11.5600],
  'Nkolbisson': [3.8700, 11.4700],
};

function getCoords(property) {
  if (property.latitude && property.longitude) {
    return [property.latitude, property.longitude];
  }
  // fallback to quarter lookup
  const match = Object.keys(QUARTER_COORDS).find(q =>
    property.quarter?.toLowerCase().includes(q.toLowerCase())
  );
  return match ? QUARTER_COORDS[match] : null;
}

export default function MapPage() {
  const { t, setSelectedProperty } = useApp();
  const m = t.map;
  const { data: listings, loading } = useProperties({ limit: 50 });
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="section">
      <div className="dash-header">
        <h2>{m.title}</h2>
        <p className="text-muted">{m.subtitle}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Real Interactive Map */}
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 28, border: '1px solid var(--border)' }}>
            <MapContainer
              center={YAOUNDE_CENTER}
              zoom={13}
              style={{ height: 520, width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {listings.map(prop => {
                const coords = getCoords(prop);
                if (!coords) return null;
                return (
                  <Marker
                    key={prop._id}
                    position={coords}
                    eventHandlers={{ click: () => setActiveId(prop._id) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                          {prop.title}
                        </div>
                        <div style={{ color: '#2d7a4f', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>
                          {prop.rentPrice?.toLocaleString()} FCFA/mois
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 10 }}>
                          📍 {prop.quarter} · 🛏️ {prop.bedrooms} ch. · 🚿 {prop.bathrooms} sdb
                        </div>
                        <button
                          style={{
                            width: '100%', padding: '8px',
                            background: '#2d7a4f', color: '#fff',
                            border: 'none', borderRadius: 7,
                            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          }}
                          onClick={() => setSelectedProperty(prop)}
                        >
                          Voir l'annonce →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Property list below map */}
          <div className="grid-3">
            {listings.slice(0, 9).map((prop, i) => (
              <div key={prop._id}
                style={{
                  background: '#fff',
                  border: `2px solid ${activeId === prop._id ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', padding: '12px 14px',
                  cursor: 'pointer', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
                onClick={() => setActiveId(prop._id)}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: activeId === prop._id ? 'var(--green)' : 'var(--green-light)',
                  color: activeId === prop._id ? '#fff' : 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 800, fontSize: '0.82rem',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '0.88rem',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {prop.title}
                  </div>
                  <div style={{ color: 'var(--green)', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.88rem' }}>
                    {prop.rentPrice?.toLocaleString()} FCFA
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📍 {prop.quarter} · 🛏️ {prop.bedrooms}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={e => { e.stopPropagation(); setSelectedProperty(prop); }}>
                  →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}