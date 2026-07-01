import React from 'react';
import { useApp } from '../../context/AppContext';
import { Stars } from '../common/UI';
import { getImageUrl } from '../../utils/api'; // adjust relative path 

const BG_COLORS = ['#E8F5EE','#FEF3DC','#EEF2FF','#FFF1F0','#E0F7F4','#FDF4FF'];
const EMOJIS = { Appartement: '🏢', Studio: '🏠', Villa: '🏡', Chambre: '🛏️', Duplex: '🏰', Bureau: '🏗️' };

export default function PropertyCard({ property, onClick }) {
  const { t, favoriteIds, toggleFavorite, user } = useApp();
  const p = property;
  const isFav = favoriteIds.includes(p._id);
  const bgIdx = p._id ? p._id.charCodeAt(p._id.length - 1) % BG_COLORS.length : 0;
  const emoji = EMOJIS[p.propertyType] || '🏠';

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(p._id);
  };

  return (
    <div className="prop-card" onClick={onClick}>
      {/* Image */}
      <div className="prop-img">
        {p.images && p.images.length > 0 ? (
          <img src={getImageUrl(p.images[0])} alt={p.title} />
        ) : (
          <div className="prop-img-bg" style={{ background: BG_COLORS[bgIdx] }}>
            <span>{emoji}</span>
          </div>
        )}
        <div className="prop-badge">{p.propertyType}</div>
        <button className="prop-fav-btn" onClick={handleFav}>
          {isFav ? '❤️' : '🤍'}
        </button>
        {p.status === 'verified' && (
          <div className="prop-verified-badge">✓ {t.property.verified}</div>
        )}
      </div>

      {/* Body */}
      <div className="prop-body">
        <div className="prop-price">
          {p.rentPrice?.toLocaleString()} FCFA{' '}
          <span>{t.property.perMonth}</span>
        </div>
        <div className="prop-title">{p.title}</div>
        <div className="prop-loc">📍 {p.quarter}, {p.city}</div>
        {p.averageRating > 0 && (
          <div className="prop-rating">
            <Stars rating={p.averageRating} size="sm" />
            <span className="rating-count">
              {p.averageRating} ({p.reviewCount} {t.property.reviews})
            </span>
          </div>
        )}
        <div className="prop-meta">
          <span>🛏️ {p.bedrooms} {p.bedrooms === 1 ? t.property.bedrooms : t.property.bedroomsPlural}</span>
          <span>🚿 {p.bathrooms}</span>
          <span>{p.furnished ? t.property.furnished : t.property.unfurnished}</span>
        </div>
      </div>
    </div>
  );
}
