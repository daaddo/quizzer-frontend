import React from 'react';

/**
 * Component to display user profile information
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {number} props.user.id - User ID
 * @param {string} props.user.username - Username
 */
const UserInfo = ({ user }) => {
  if (!user) {
    return (
      <div className="user-info-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento informazioni utente...</p>
      </div>
    );
  }

  return (
    <div className="user-info">
      <div className="user-info-header">
        <div className="user-avatar">
          <span className="user-avatar-icon">👤</span>
        </div>
        <div className="user-details">
          <h2 className="user-name">{user.username}</h2>
          <p className="user-id">ID Utente: #{user.id}</p>
        </div>
      </div>

      <div className="user-info-actions">
        <div className="info-section">
          <h3>🎯 Il Tuo Profilo</h3>
          <p>
            Benvenuto nella tua area personale! Qui puoi accedere alle tue 
            informazioni e utilizzare le funzionalità della piattaforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;

