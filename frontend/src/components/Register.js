// Contenu pour : src/components/Register.js
import React, { useState } from 'react';
import { register } from '../api/auth';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { nom, email, password, confirmPassword } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await register({ nom, email, password, confirmPassword });
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response.data.msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Créer un compte</h2>
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" name="nom" value={nom} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Création...' : 'S\'inscrire'}
        </button>
      </form>
      <p className="auth-link">Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
      <p className="auth-link">Compte créé ? <Link to="/activate">Activez-le ici</Link></p>
    </div>
  );
};

export default Register;
