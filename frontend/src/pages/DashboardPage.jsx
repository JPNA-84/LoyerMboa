import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMyProperties, useMessages } from '../hooks/useData';
import { authAPI, propertyAPI, adminAPI, messageAPI } from '../utils/api';
import AddListingModal from '../components/dashboard/AddListingModal';
import { StatusBadge, EmptyState, Spinner, Avatar, Divider } from '../components/common/UI';

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ value, label, delta }) {
  return (
    <div className="stat-card">
      <div className="stat-card-val">{value}</div>
      <div className="stat-card-lbl">{label}</div>
      {delta && <div className="stat-card-delta">↑ {delta}</div>}
    </div>
  );
}

// ── Overview (Landlord) ───────────────────────────────────
function LandlordOverview({ user, listings, t }) {
  const d = t.dashboard;
  const verified = listings.filter(p => p.status === 'verified').length;
  const recentActivity = [
    { icon: '👁️', text: `3 ${d.seen} Bastos`, time: `2${d.h}` },
    { icon: '💬', text: `${d.newMessage} Alice Mvogo`, time: `5${d.h}` },
    { icon: '❤️', text: `Villa ${d.saved} 2 ${d.times}`, time: d.yesterday },
    { icon: '✓',  text: `${d.verifiedMsg}: Studio Melen`, time: `2 ${d.days}` },
  ];
  return (
    <>
      <div className="stats-grid">
        <StatCard value={listings.length} label={d.totalListings} delta={d.thisMonth} />
        <StatCard value={verified} label={d.verified} delta={d.active} />
        <StatCard value={42} label={d.viewsMonth} delta={d.vsLast} />
        <StatCard value={8} label={d.contacts} delta={d.thisWeek} />
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16 }}>{d.recentActivity}</h4>
        {recentActivity.map((a, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '10px 0',
            borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem' }}>{a.text}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Overview (Tenant) ─────────────────────────────────────
function TenantOverview({ user, t }) {
  const d = t.dashboard;
  return (
    <>
      <div className="stats-grid">
        <StatCard value={12} label={d.propertiesViewed} delta={d.thisWeek} />
        <StatCard value={4}  label={d.favsSaved} />
        <StatCard value={2}  label={d.messagesSent} delta={d.thisMonth} />
        <StatCard value={3}  label={d.visits} />
      </div>
      <div style={{
        background: 'var(--green-light)', border: '1px solid var(--green)',
        borderRadius: 'var(--radius)', padding: 20,
      }}>
        <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 6, color: 'var(--green)' }}>
          {d.recommendation}
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {d.recommendationText}
        </p>
      </div>
    </>
  );
}

// ── My Listings Tab ───────────────────────────────────────
function MyListingsTab({ t, onAdd }) {
  const d = t.dashboard;
  const { data: listings, loading, refetch, remove } = useMyProperties();
  const { setSelectedProperty, showToast } = useApp();

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce? / Delete this listing?')) return;
    try {
      await remove(id);
      showToast('Annonce supprimée / Listing deleted');
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    }
  };

  return (
    <>
      <div className="flex-between mb-2">
        <div className="dash-header" style={{ margin: 0 }}>
          <h2>{d.myListings}</h2>
          <p className="text-muted">{listings.length} annonce{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ {d.addListing}</button>
      </div>

      {loading ? <Spinner /> : listings.length === 0 ? (
        <EmptyState icon="🏠" title={d.noListings} desc={d.noListingsDesc}
          action={<button className="btn btn-primary" onClick={onAdd}>{d.addFirst}</button>} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{d.property}</th>
                <th>{d.priceMonth}</th>
                <th>{d.quarter}</th>
                <th>{d.status}</th>
                <th>{d.actions}</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {p.propertyType} · {p.bedrooms} ch.
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--green)', fontFamily: 'Syne' }}>
                      {p.rentPrice?.toLocaleString()}
                    </strong>
                  </td>
                  <td>{p.quarter}</td>
                  <td><StatusBadge status={p.status} t={t} /></td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }}
                      onClick={() => setSelectedProperty(p)}>{d.view}</button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p._id)}>{d.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Admin Panel Tab ───────────────────────────────────────
// ── Admin Panel Tab ───────────────────────────────────────
function AdminTab({ t }) {
  const { showToast } = useApp();
  const d = t.dashboard;
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPending();
      const pending = (data.data || []).filter(p => p.status === 'pending');
      setListings(pending);
    } catch (e) {
      showToast('Failed to load pending listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleVerify = async (id, status) => {
    setActing(id);
    try {
      await adminAPI.verify(id, status);
      showToast(status === 'verified' ? d.adminApprove : d.adminReject);
      setListings(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <div className="dash-header">
        <h2>🛡️ {d.adminPanel}</h2>
        <p className="text-muted">{listings.length} {d.adminPending}</p>
      </div>

      {loading ? <Spinner /> : listings.length === 0 ? (
        <EmptyState
          icon="✅"
          title={d.adminAllApproved}
          desc={d.adminAllApprovedDesc}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{d.adminListing}</th>
                <th>{d.adminPrice}</th>
                <th>{d.adminQuarter}</th>
                <th>{d.adminOwner}</th>
                <th>{d.adminDate}</th>
                <th>{d.adminActions}</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {p.propertyType} · {p.bedrooms} ch. · {p.bathrooms} sdb
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--green)', fontFamily: 'Syne' }}>
                      {p.rentPrice?.toLocaleString()} FCFA
                    </strong>
                  </td>
                  <td>{p.quarter}, {p.city}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{p.landlord?.fullname || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.landlord?.email}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.createdAt).toLocaleDateString(t.lang === 'fr' ? 'fr-FR' : 'en-US')}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginRight: 6 }}
                      disabled={acting === p._id}
                      onClick={() => handleVerify(p._id, 'verified')}
                    >
                      {acting === p._id ? '...' : d.adminApprove}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={acting === p._id}
                      onClick={() => handleVerify(p._id, 'rejected')}
                    >
                      {acting === p._id ? '...' : d.adminReject}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="btn btn-outline"
        style={{ marginTop: 16 }}
        onClick={fetchPending}
      >
        {d.adminRefresh}
      </button>
    </>
  );
}

// ── Profile Tab ───────────────────────────────────────────
function ProfileTab({ user, t }) {
  const d = t.dashboard;
  const { showToast } = useApp();
  const [form, setForm] = useState({ fullname: user.fullname, phone: user.phone || '', preferredLang: user.preferredLang || 'fr' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      showToast(d.profileUpdated);
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    } finally { setSaving(false); }
  };

  const handlePw = async () => {
    try {
      await authAPI.changePassword(pwForm);
      showToast(d.profileUpdated);
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    }
  };

  return (
    <>
      <div className="dash-header"><h2>{d.profile}</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <Avatar name={user.fullname} size={56} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.fullname}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {user.role === 'landlord' ? '🔑' : user.role === 'admin' ? '🛡️' : '🏠'} {t.auth[user.role] || user.role} · {user.email}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t.auth.fullname}</label>
            <input className="form-input" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">{t.auth.phone}</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Langue / Language</label>
            <select className="form-select" value={form.preferredLang} onChange={e => setForm({ ...form, preferredLang: e.target.value })}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <button className="form-btn" onClick={handleSave} disabled={saving}>
            {saving ? t.common.loading : d.saveProfile}
          </button>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 16 }}>{d.changePassword}</h4>
          <div className="form-group">
            <label className="form-label">{d.currentPassword}</label>
            <input className="form-input" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">{d.newPassword}</label>
            <input className="form-input" type="password" value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <button className="form-btn" onClick={handlePw}>{d.changePassword}</button>
        </div>
      </div>
    </>
  );
}

// ── Saved Searches Tab ────────────────────────────────────
function SavedSearchesTab({ user, t }) {
  const d = t.dashboard;
  const searches = user.savedSearches || [];
  return (
    <>
      <div className="dash-header"><h2>{d.savedSearchesTitle}</h2><p className="text-muted">{d.savedSearchesDesc}</p></div>
      {searches.length === 0 ? (
        <EmptyState icon="🔔" title="Aucune recherche" desc="Sauvegardez vos critères de recherche pour recevoir des alertes." />
      ) : searches.map((s, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '1.5rem' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{s.quarter} · {s.type || 'Tous types'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max {s.maxRent?.toLocaleString()} FCFA</div>
          </div>
          <span className="badge-new">2 {d.newListings}</span>
        </div>
      ))}
    </>
  );
}

// ── Messages Tab ──────────────────────────────────────────────────────────────
function MessagesTab({ t }) {
  const d = t.dashboard;
  const { data: messages, loading } = useMessages();
  const { showToast, user } = useApp();
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);

const openThread = async (msg) => {
    setSelected(msg);
    setLoadingThread(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/thread/${msg._id}`,
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('lm_token') } }
      );
      const replyData = await res.json();
      const replies = replyData.data || [];
      const combined = [msg, ...replies].filter((m, i, arr) =>
        arr.findIndex(x => x._id === m._id) === i
      );
      setReplies(combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (e) {
      setReplies([msg]);
    } finally {
      setLoadingThread(false);
    }
  };
  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await messageAPI.reply(selected._id, replyText);
      setReplies(prev => [...prev, data.data]);
      setReplyText('');
      showToast(t.lang === 'en' ? 'Reply sent!' : 'Réponse envoyée!');
    } catch (e) {
      showToast(e.response?.data?.message || t.common.error, 'error');
    } finally {
      setSending(false);
    }
  };

  if (selected) {
    return (
      <>
        <div className="dash-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>
            ← {t.lang === 'en' ? 'Back' : 'Retour'}
          </button>
          <div>
            <h2>🏠 {selected.property?.title}</h2>
            <p className="text-muted">
              {t.lang === 'en' ? 'Conversation with' : 'Conversation avec'}{' '}
              {selected.sender?._id === user?._id ? selected.recipient?.fullname : selected.sender?.fullname}
            </p>
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 20, marginBottom: 16,
          minHeight: 300, maxHeight: 400, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {loadingThread ? <Spinner /> : replies.map((msg, i) => {
            const isMe = msg.sender?._id === user?._id;
            return (
              <div key={msg._id || i} style={{
                display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
                gap: 10, alignItems: 'flex-end',
              }}>
                <Avatar name={msg.sender?.fullname || '?'} size={32} />
                <div style={{
                  maxWidth: '70%', padding: '10px 14px',
                  borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMe ? 'var(--green)' : 'var(--bg)',
                  color: isMe ? '#fff' : 'var(--text)',
                  fontSize: '0.9rem',
                }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 4 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            placeholder={t.lang === 'en' ? 'Type your reply...' : 'Votre réponse...'}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReply()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleReply}
            disabled={sending || !replyText.trim()}
          >
            {sending ? '...' : (t.lang === 'en' ? '📤 Send' : '📤 Envoyer')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="dash-header">
        <h2>{d.messagesTitle}</h2>
        <p className="text-muted">{d.messagesDesc}</p>
      </div>
      {loading ? <Spinner /> : messages.length === 0 ? (
        <EmptyState icon="✉️" title={d.noMessages} desc="Contactez un propriétaire pour démarrer une conversation." />
      ) : messages.map(m => {
        const other = m.sender?._id === user?._id ? m.recipient : m.sender;
        return (
          <div key={m._id} style={{
            background: '#fff', border: `1px solid ${!m.isRead ? 'var(--green)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: 16, marginBottom: 10,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          }} onClick={() => openThread(m)}>
            <Avatar name={other?.fullname || '?'} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{other?.fullname}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--green)', marginBottom: 2 }}>
                🏠 {m.property?.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.content}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {new Date(m.createdAt).toLocaleDateString()}
              </div>
              {!m.isRead && (
                <span style={{ background: 'var(--green)', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {d.unread}
                </span>
              )}
              <div style={{ fontSize: '0.78rem', color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
                {t.lang === 'en' ? 'Open →' : 'Ouvrir →'}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
// ── Main Dashboard ────────────────────────────────────────
export default function DashboardPage() {
  const { user, t, setShowAuth, setShowAddListing } = useApp();
  const navigate = useNavigate();
  const d = t.dashboard;
  const [activeTab, setActiveTab] = useState('overview');
  const { data: listings } = useMyProperties();

  if (!user) {
    return (
      <div className="section">
        <EmptyState
          icon="🔒"
          title={t.common.loginRequired}
          desc={t.common.loginRequiredDesc}
          action={<button className="btn btn-primary" onClick={() => setShowAuth('login')}>{t.nav.login}</button>}
        />
      </div>
    );
  }

  const isLandlord = user.role === 'landlord';
 const isAdmin = user.role === 'admin';
//console.log('DEBUG user:', user, 'isAdmin:', isAdmin, 'role:', user.role);

  const navItems = isAdmin ? [
    { id: 'overview', icon: '📊', label: d.overview },
    { id: 'admin',    icon: '🛡️', label: 'Admin Panel' },
    { id: 'messages', icon: '✉️', label: d.messages },
    { id: 'profile',  icon: '👤', label: d.profile },
  ] : isLandlord ? [
    { id: 'overview', icon: '📊', label: d.overview },
    { id: 'listings', icon: '🏠', label: d.myListings },
    { id: 'messages', icon: '✉️', label: d.messages },
    { id: 'profile',  icon: '👤', label: d.profile },
  ] : [
    { id: 'overview', icon: '📊', label: d.overview },
    { id: 'searches', icon: '🔔', label: d.savedSearches },
    { id: 'messages', icon: '✉️', label: d.messages },
    { id: 'profile',  icon: '👤', label: d.profile },
  ];

  const handleNav = (id) => {
    if (id === 'add') { setShowAddListing(true); return; }
    setActiveTab(id);
  };

  return (
    <>
      <div className="dash-layout">
        {/* Sidebar */}
        <div className="dash-sidebar">
          <div className="dash-user">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={user.fullname} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {user.fullname.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? '🛡️ Admin' : isLandlord ? '🔑 ' + t.auth.landlord : '🏠 ' + t.auth.tenant}
                </div>
              </div>
            </div>
          </div>

          <div className="dash-nav-label">Menu</div>
          {navItems.map(item => (
            <button key={item.id}
              className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}

          {isLandlord && (
            <>
              <Divider />
              <button className="dash-nav-item" style={{ color: 'var(--green)', fontWeight: 700 }}
                onClick={() => setShowAddListing(true)}>
                <span>➕</span> {d.addListing}
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="dash-content">
          {activeTab === 'overview' && (
            <div className="dash-header">
              <h2>{d.greeting}, {user.fullname.split(' ')[0]}! 👋</h2>
              <p className="text-muted">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}

          {activeTab === 'overview' && (
            isAdmin
              ? <AdminTab t={t} />
              : isLandlord
                ? <LandlordOverview user={user} listings={listings} t={t} />
                : <TenantOverview user={user} t={t} />
          )}
          {activeTab === 'admin'    && <AdminTab t={t} />}
          {activeTab === 'listings' && <MyListingsTab t={t} onAdd={() => setShowAddListing(true)} />}
          {activeTab === 'profile'  && <ProfileTab user={user} t={t} />}
          {activeTab === 'searches' && <SavedSearchesTab user={user} t={t} />}
          {activeTab === 'messages' && <MessagesTab t={t} />}
        </div>
      </div>

      <AddListingModal onSuccess={() => setActiveTab('listings')} />
    </>
  );
}