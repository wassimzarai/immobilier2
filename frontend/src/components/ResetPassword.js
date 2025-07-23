// =================================================================
// FICHIER : frontend/src/components/ResetPassword.js
// =================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ email: '', token: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, token, newPassword } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // On appelle la deuxième route backend que vous avez testée
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', formData );
      setMessage(res.data.msg + " Vous serez redirigé vers la page de connexion.");
      
      // On attend 4 secondes pour que l'utilisateur lise le message, puis on le redirige.
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Une erreur est survenue.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Réinitialiser le mot de passe</h2>
      <p>Veuillez entrer votre e-mail, le code reçu, et votre nouveau mot de passe.</p>
      
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="token">Code reçu par e-mail</label>
          <input type="text" name="token" id="token" value={token} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nouveau mot de passe</label>
          <input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={onChange} required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Modification...' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
