import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stars, Divider, Chip, Avatar } from '../common/UI';
import { useReviews } from '../../hooks/useData';
import { messageAPI } from '../../utils/api';
import { getImageUrl } from '../../utils/api'; // adjust relative path as needed

const BG_COLORS = ['#E8F5EE','#FEF3DC','#EEF2FF','#FFF1F0','#E0F7F4','#FDF4FF'];
const EMOJIS = { Appartement: '🏢', Studio: '🏠', Villa: '🏡', Chambre: '🛏️', Duplex: '🏰', Bureau: '🏗️' };

// ── Image Gallery with swipe ──────────────────────────────
function ImageGallery({ images, propertyType, status, bgIdx, t }) {
  const [imgIdx, setImgIdx] = useState(0);
  const emoji = EMOJIS[propertyType] || '🏠';
  const imgs = images || [];

  return (
    <div style={{
      position: 'relative', borderRadius: 'var(--radius-sm)',
      overflow: 'hidden', marginBottom: 16,
      background: BG_COLORS[bgIdx], height: 260,
    }}>
      {imgs.length > 0 ? (
        <>
          <img
            <img src={getImageUrl(imgs[imgIdx])} alt={`photo ${imgIdx + 1}`} />
            alt={`photo ${imgIdx + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Prev button */}
          {imgs.length > 1 && imgIdx > 0 && (
            <button
              onClick={() => setImgIdx(i => i - 1)}
              style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 38, height: 38, fontSize: '1.3rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
              }}>‹</button>
          )}

          {/* Next button */}
          {imgs.length > 1 && imgIdx < imgs.length - 1 && (
            <button
              onClick={() => setImgIdx(i => i + 1)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 38, height: 38, fontSize: '1.3rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
              }}>›</button>
          )}

          {/* Dot indicators */}
          {imgs.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6, zIndex: 2,
            }}>
              {imgs.map((_, i) => (
                <div key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: i === imgIdx ? 22 : 8, height: 8,
                    borderRadius: 4, cursor: 'pointer', transition: 'all .2s',
                    background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                  }} />
              ))}
            </div>
          )}

          {/* Counter badge */}
          {imgs.length > 1 && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.55)', color: '#fff',
              borderRadius: 20, padding: '3px 10px',
              fontSize: '0.78rem', fontWeight: 600, zIndex: 2,
            }}>
              {imgIdx + 1} / {imgs.length}
            </div>
          )}

          {/* Thumbnail strip */}
          {imgs.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex', gap: 4, padding: '4px 8px 36px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
            }}>
              {imgs.map((img, i) => (
                <img key={i}
                  <img key={i} src={getImageUrl(img)} alt="" />
                  alt=""
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: 44, height: 32, objectFit: 'cover',
                    borderRadius: 4, cursor: 'pointer',
                    border: i === imgIdx ? '2px solid #fff' : '2px solid transparent',
                    opacity: i === imgIdx ? 1 : 0.7,
                    transition: 'all .2s',
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '4rem',
        }}>
          {emoji}
        </div>
      )}

     {status === 'verified' && (
  <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, fontSize: '0.72rem', padding: '2px 8px' }} className="prop-verified-badge">
    ✓ {t.property.verified}
  </div>
)}
    </div>
  );
}

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
  const phone = p.landlord?.phone?.replace(/\D/g, '');
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par: ${p.title}`)}`;

  const handleSendMessage = async () => {
    if (!user) { setShowAuth('login'); return; }
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await messageAPI.send(p._id, msgText);
      showToast(t.lang === 'en' ? 'Message sent!' : 'Message envoyé!');
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
      showToast(t.lang === 'en' ? 'Review submitted!' : 'Avis soumis!');
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

          {/* Image Gallery */}
          <ImageGallery
            images={p.images}
            propertyType={p.propertyType}
            status={p.status}
            bgIdx={bgIdx}
            t={t}
          />

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
                {t.property.landlord} · {t.property.memberSince} {new Date(p.landlord?.createdAt || Date.now()).getFullYear()}
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
                + {t.lang === 'en' ? 'Review' : 'Avis'}
              </button>
            )}
          </div>

          {showReviewForm && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 12 }}>
              <div className="flex-center mb-1">
                {[1,2,3,4,5].map(n => (
                  <span key={n}
                    style={{ fontSize: '1.4rem', cursor: 'pointer', color: n <= reviewForm.rating ? 'var(--accent)' : '#ddd' }}
                    onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</span>
                ))}
              </div>
              <textarea className="form-textarea"
                placeholder={t.lang === 'en' ? 'Your comment...' : 'Votre commentaire...'}
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                style={{ minHeight: 72 }} />
              <button className="btn btn-primary btn-sm mt-1" onClick={handleReview}>
                {t.lang === 'en' ? 'Submit' : 'Soumettre'}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {t.lang === 'en' ? 'No reviews yet.' : 'Aucun avis pour le moment.'}
            </p>
          ) : reviews.map(r => (
            <div key={r._id} className="review-item">
              <div className="review-header">
                <div className="review-avatar">{r.tenant?.fullname?.[0] || '?'}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.tenant?.fullname}</div>
                  <Stars rating={r.rating} size="sm" />
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(r.createdAt).toLocaleDateString(t.lang === 'fr' ? 'fr-FR' : 'en-US')}
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
