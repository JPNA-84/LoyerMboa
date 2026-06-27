import React from 'react';

export function Stars({ rating, size = 'md' }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : 'empty'}`}
          style={{ fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.1rem' : '0.85rem' }}>
          {i <= Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status, t }) {
  const map = {
    verified: { cls: 'status-verified', label: t ? '✓ ' + t.property.verified : '✓ Verified' },
    pending:  { cls: 'status-pending',  label: t ? t.property.pending : '⏳ Pending' },
    rejected: { cls: 'status-rejected', label: t ? t.property.rejected : '✗ Rejected' },
  };
  const s = map[status] || map.pending;
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

export function Avatar({ name = '?', size = 34, bg = 'var(--green)', style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 700,
      fontSize: size * 0.35 + 'px', flexShrink: 0, ...style,
    }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function Chip({ children, variant = 'green' }) {
  return (
    <span className={`chip ${variant === 'accent' ? 'accent' : ''}`}>
      {children}
    </span>
  );
}

export function Divider() {
  return <div className="divider" />;
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      {page > 1 && <button className="page-btn" onClick={() => onChange(page - 1)}>‹</button>}
      {Array.from({ length: pages }, (_, i) => (
        <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`}
          onClick={() => onChange(i + 1)}>
          {i + 1}
        </button>
      ))}
      {page < pages && <button className="page-btn" onClick={() => onChange(page + 1)}>›</button>}
    </div>
  );
}
