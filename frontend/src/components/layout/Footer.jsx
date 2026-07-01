import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useApp();
  const navigate = useNavigate();
  const f = t.footer;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Loyer<span>Mboa</span></div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
          <div>
            <h4>{f.nav}</h4>
            <span className="footer-link" onClick={() => navigate('/')}>{f.home}</span>
            <span className="footer-link" onClick={() => navigate('/listings')}>{f.listings}</span>
            <span className="footer-link" onClick={() => navigate('/map')}>{f.map}</span>
            <span className="footer-link" onClick={() => navigate('/favorites')}>{f.favorites}</span>
          </div>
          <div>
            <h4>{f.landlords}</h4>
            <span className="footer-link">{f.publish}</span>
            <span className="footer-link" onClick={() => navigate('/dashboard')}>{f.dashboard}</span>
            <span className="footer-link">{f.pricing}</span>
            <span className="footer-link">{f.help}</span>
          </div>
          <div>
            <h4>{f.contact}</h4>
            <span className="footer-link">{f.address}</span>
            <span className="footer-link">{f.phone}</span>
            <span className="footer-link">{f.email}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>©  LoyerMboa. {f.rights}</span>
          <span>{f.made}</span>
        </div>
      </div>
    </footer>
  );
}
