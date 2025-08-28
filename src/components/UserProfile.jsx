import React from 'react';

/**
 * Componente per visualizzare le informazioni profilo utente
 */
const UserProfile = ({ user }) => {
  if (!user) {
    return (
      <div className="user-profile-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento profilo...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-content">
        <div className="profile-avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user.username || 'Utente'}</h2>
          <p className="profile-email">📧 {user.email || 'Email non disponibile'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
