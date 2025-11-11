import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="dashboard-error" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="error-content" style={{ textAlign: 'center' }}>
          <div className="error-icon">404</div>
          <h2>Pagina non trovata</h2>
          <p>L'URL richiesto non esiste.</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => navigate('/')}>Ritorna alla Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
