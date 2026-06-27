import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stars, Divider, Chip, Avatar } from '../common/UI';
import { useReviews } from '../../hooks/useData';
import { messageAPI } from '../../utils/api';

const BG_COLORS = ['#E8F5EE','#FEF3DC','#EEF2FF','#FFF1F0','#E0F7F4','#FDF4FF'];
const EMOJIS = { Appartement: '🏢', Studio: '🏠', Villa: '🏡', Chambre: '🛏️', Duplex: '🏰', Bureau: '🏗️' };

export default function PropertyModal() {
  const { selectedProperty: p, setSelectedProperty, t, favoriteIds, toggleFavorite, user, showToast, setShowAuth } = useApp();
  const { data: reviews, submit: submitReview } = useReviews(p?._id);
  const [msgText, setMsgText] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  if (!p) return null;

  const isFav = favoriteIds.includes(p._id);
  const bgIdx = p._id ? p._id.charCodeAt(p._id.length - 1) % BG_COLORS.length : 0;
  const emoji = EMOJIS[p.propertyType] || '🏠';
  const phone = p.landlord?.phone?.replace(/\D/g, '');
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par: ${p.title}`)}`;

  const handleSendMessage = async () => {
    if (!user) { setShowAuth('login'); return; }
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await messageAPI.send(p._id, msgText);
      showToast(t.common.save + '!');
      setMsgText('');
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReview = async () => {
    if (!user) { setShowAuth('login'); return; }
    try {
      await submitReview(reviewForm.rating, reviewForm.comment);
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      showToast('Avis soumis! / Review submitted!');
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    }
  };

  return (
    <div className="overlay" onClick={() => setSelectedProperty(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ paddingRight: 16 }}>{p.title}</h3>
          <button className="modal-close" onClick={() => setSelectedProperty(null)}>✕</button>
        </div>
        <div className="modal-body">
          {/* Image */}
          <div className="prop-detail-img" style={{ background: BG_COLORS[bgIdx] }}>
            {p.images?.length > 0
              ? <img src={`http://localhost:5000${p.images[0]}`} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              : <span>{emoji}</span>}
            {p.status === 'verified' && (
              <div style={{ position: 'absolute', top: 12, left: 12 }} className="prop-verified-badge">
                ✓ {t.property.verified}
              </div>
            )}
          </div>

          {/* Price + fav */}
          <div className="flex-between">
            <div>
              <div className="prop-detail-price">
                {p.rentPrice?.toLocaleString()} FCFA
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
                  {' '}{t.property.perMonth}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
                📍 {p.quarter}, {p.city}
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer' }}
              onClick={() => toggleFavorite(p._id)}>
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Chips */}
          <div className="prop-detail-chips mt-2">
            <Chip>🛏️ {p.bedrooms} {p.bedrooms === 1 ? t.property.bedrooms : t.property.bedroomsPlural}</Chip>
            <Chip>🚿 {p.bathrooms} {p.bathrooms === 1 ? t.property.bathrooms : t.property.bathroomsPlural}</Chip>
            <Chip>{p.propertyType}</Chip>
            <Chip>{p.furnished ? t.property.furnished : t.property.unfurnished}</Chip>
          </div>

          {/* Rating */}
          {p.averageRating > 0 && (
            <div className="flex-center mt-1">
              <Stars rating={p.averageRating} size="lg" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {p.averageRating}/5 · {p.reviewCount} {t.property.reviews}
              </span>
            </div>
          )}

          {/* Description */}
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: '14px 0' }}>
            {p.description}
          </p>

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <div className="mb-2">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>{t.property.amenities}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.amenities.map((a, i) => <Chip key={i} variant="accent">✓ {a}</Chip>)}
              </div>
            </div>
          )}

          {/* Landlord */}
          <div className="landlord-card">
            <Avatar name={p.landlord?.fullname || '?'} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.landlord?.fullname}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.property.landlord} · {t.property.memberSince} 2023
              </div>
            </div>
            <Chip>{t.property.responsive}</Chip>
          </div>

          {/* Contact buttons */}
          <div className="contact-btns">
            <button className="contact-btn contact-call"
              onClick={() => showToast(`📞 +${phone}`)}>
              {t.property.call}
            </button>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
              <button className="contact-btn contact-wa" style={{ width: '100%' }}>
                {t.property.whatsapp}
              </button>
            </a>
          </div>

          {/* In-app message */}
          <div className="mt-2">
            <textarea
              className="form-textarea"
              placeholder={t.property.message + '...'}
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              style={{ minHeight: 72 }}
            />
            <button className="btn btn-primary btn-sm mt-1" style={{ width: '100%' }}
              onClick={handleSendMessage} disabled={sendingMsg}>
              {sendingMsg ? t.common.loading : t.property.message}
            </button>
          </div>

          <Divider />

          {/* Reviews */}
          <div className="flex-between mb-2">
            <h4 style={{ fontFamily: 'Syne', fontWeight: 700 }}>{t.property.tenantReviews}</h4>
            {user?.role === 'tenant' && (
              <button className="btn btn-outline btn-sm"
                onClick={() => setShowReviewForm(v => !v)}>
                + Avis / Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 12 }}>
              <div className="flex-center mb-1">
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontSize: '1.4rem', cursor: 'pointer', color: n <= reviewForm.rating ? 'var(--accent)' : '#ddd' }}
                    onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</span>
                ))}
              </div>
              <textarea className="form-textarea"
                placeholder="Votre commentaire / Your comment..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                style={{ minHeight: 72 }} />
              <button className="btn btn-primary btn-sm mt-1" onClick={handleReview}>
                Soumettre / Submit
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun avis / No reviews yet</p>
          ) : reviews.map(r => (
            <div key={r._id} className="review-item">
              <div className="review-header">
                <div className="review-avatar">{r.tenant?.fullname?.[0] || '?'}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.tenant?.fullname}</div>
                  <Stars rating={r.rating} size="sm" />
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
