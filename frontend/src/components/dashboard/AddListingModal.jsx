import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { propertyAPI } from '../../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const YAOUNDE_CENTER = [3.8480, 11.5021];

// Fly map to a position
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15);
  }, [position, map]);
  return null;
}

// Click to pick location
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng); }
  });
  return null;
}

// Reverse geocode coordinates → quarter name
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data.address;
    return addr.suburb || addr.neighbourhood || addr.quarter ||
           addr.city_district || addr.town || addr.village || '';
  } catch { return ''; }
}

// Forward geocode quarter name → coordinates
async function geocodeQuarter(quarter, city = 'Yaoundé') {
  try {
    const query = `${quarter}, ${city}, Cameroon`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch { return null; }
}

export default function AddListingModal({ onSuccess }) {
  const { showAddListing, setShowAddListing, t, showToast } = useApp();
  const a = t.addListing;
  const [form, setForm] = useState({
    title: '', description: '', propertyType: t.types[0],
    rentPrice: '', quarter: t.quarters[0], city: t.cities[0],
    bedrooms: '1', bathrooms: '1', furnished: true,
    amenities: '', latitude: '', longitude: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const fileRef = useRef();

  if (!showAddListing) return null;

  // When landlord clicks map → reverse geocode to get quarter name
  const handleMapPick = async ({ lat, lng }) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    setMarkerPos([lat, lng]);
    setForm(f => ({ ...f, latitude: roundedLat, longitude: roundedLng }));

    // Reverse geocode to fill quarter name
    setGeocoding(true);
    const quarter = await reverseGeocode(lat, lng);
    if (quarter) {
      setForm(f => ({ ...f, latitude: roundedLat, longitude: roundedLng, quarter }));
      showToast(`📍 ${quarter}`);
    }
    setGeocoding(false);
  };

  // When landlord selects quarter from dropdown → geocode to move map pin
  const handleQuarterChange = async (quarter) => {
    setForm(f => ({ ...f, quarter }));
    if (!quarter) return;
    setGeocoding(true);
    const coords = await geocodeQuarter(quarter, form.city);
    if (coords) {
      setMarkerPos([coords.lat, coords.lng]);
      setFlyTo([coords.lat, coords.lng]);
      setForm(f => ({
        ...f, quarter,
        latitude: Math.round(coords.lat * 10000) / 10000,
        longitude: Math.round(coords.lng * 10000) / 10000,
      }));
      if (!showMap) setShowMap(true);
    }
    setGeocoding(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.rentPrice || !form.description) {
      setError(t.common.error); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') {
          v.split(',').filter(Boolean).forEach(a => fd.append('amenities[]', a.trim()));
        } else {
          fd.append(k, v);
        }
      });
      files.forEach(f => fd.append('images', f));
      await propertyAPI.create(fd);
      showToast(a.published);
      setShowAddListing(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={() => setShowAddListing(false)}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{a.title}</h3>
          <button className="modal-close" onClick={() => setShowAddListing(false)}>✕</button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          {error && <div className="form-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">{a.titleLabel}</label>
            <input className="form-input" placeholder={a.titlePlaceholder}
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{a.type}</label>
              <select className="form-select" value={form.propertyType}
                onChange={e => setForm({ ...form, propertyType: e.target.value })}>
                {t.types.map(type => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{a.price}</label>
              <input className="form-input" type="number" placeholder={a.pricePlaceholder}
                value={form.rentPrice} onChange={e => setForm({ ...form, rentPrice: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {a.quarter} {geocoding && <span style={{ color: 'var(--green)', fontSize: '0.78rem' }}>📍 locating...</span>}
              </label>
              {/* Quarter — both dropdown AND free text */}
              <input
                className="form-input"
                list="quarters-list"
                placeholder={t.lang === 'en' ? 'Type or select neighbourhood' : 'Tapez ou choisissez un quartier'}
                value={form.quarter}
                onChange={e => handleQuarterChange(e.target.value)}
              />
              <datalist id="quarters-list">
                {t.quarters.map(q => <option key={q} value={q} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">{a.city}</label>
              <select className="form-select" value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}>
                {t.cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{a.bedrooms}</label>
              <select className="form-select" value={form.bedrooms}
                onChange={e => setForm({ ...form, bedrooms: e.target.value })}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{a.bathrooms}</label>
              <select className="form-select" value={form.bathrooms}
                onChange={e => setForm({ ...form, bathrooms: e.target.value })}>
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{a.furnishedLabel}</label>
            <div className="role-selector">
              <div className={`role-option ${form.furnished ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, furnished: true })}
                style={{ padding: '10px 16px', fontSize: '0.9rem' }}>{a.yes}</div>
              <div className={`role-option ${!form.furnished ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, furnished: false })}
                style={{ padding: '10px 16px', fontSize: '0.9rem' }}>{a.no}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{a.amenities}</label>
            <input className="form-input" placeholder="WiFi, Parking, Générateur..."
              value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} />
          </div>

          {/* Location Picker */}
          <div className="form-group">
            <label className="form-label">
              📍 {t.lang === 'en' ? 'Property Location on Map' : 'Localisation sur la carte'}
            </label>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={() => setShowMap(v => !v)}
            >
              {showMap
                ? (t.lang === 'en' ? '🗺️ Hide map' : '🗺️ Masquer la carte')
                : (t.lang === 'en' ? '🗺️ Pick location on map' : '🗺️ Choisir sur la carte')}
            </button>

            {showMap && (
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 8 }}>
                <div style={{ padding: '6px 10px', background: 'var(--green-light)', fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>
                  {t.lang === 'en' ? '👆 Click anywhere on the map to drop a pin' : '👆 Cliquez sur la carte pour placer un marqueur'}
                </div>
                <MapContainer
                  center={markerPos || YAOUNDE_CENTER}
                  zoom={13}
                  style={{ height: 280, width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onPick={handleMapPick} />
                  {flyTo && <FlyTo position={flyTo} />}
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>
            )}

            {form.latitude && form.longitude && (
              <div style={{
                background: 'var(--green-light)', border: '1px solid var(--green)',
                borderRadius: 6, padding: '6px 12px', fontSize: '0.82rem',
                color: 'var(--green)', fontWeight: 600,
              }}>
                ✅ {t.lang === 'en' ? 'Location set:' : 'Position:'} {form.latitude}, {form.longitude}
                {geocoding && <span> · 📍 {t.lang === 'en' ? 'detecting area...' : 'détection du quartier...'}</span>}
                <button
                  type="button"
                  style={{ marginLeft: 10, background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => { setForm(f => ({ ...f, latitude: '', longitude: '' })); setMarkerPos(null); setFlyTo(null); }}
                >✕</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{a.description}</label>
            <textarea className="form-textarea" placeholder={a.descPlaceholder}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">{a.photos}</label>
            <div className="upload-zone" onClick={() => fileRef.current.click()}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{a.photoHint}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4 }}>{a.photoSub}</div>
              {files.length > 0 && (
                <div style={{ marginTop: 8, color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {files.length} photo{files.length > 1 ? 's' : ''} sélectionnée{files.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
              onChange={e => setFiles(Array.from(e.target.files))} />
          </div>

          <button className="form-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? t.common.loading : a.submit}
          </button>
        </div>
      </div>
    </div>
  );
}