// =================================================================
// FICHIER : frontend/src/components/ForgotPassword.js
// =================================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // On appelle la route backend que vous avez testée avec Postman
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email } );
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Une erreur est survenue.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Mot de passe oublié</h2>
      <p>Entrez votre adresse e-mail pour recevoir un code de réinitialisation.</p>
      
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer le code'}
        </button>
      </form>
      
      {/* Ce lien apparaît seulement après une demande réussie */}
      {message && (
        <p className="auth-link" style={{ marginTop: '20px' }}>
          <Link to="/reset-password">J'ai reçu mon code, passer à l'étape suivante →</Link>
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;
