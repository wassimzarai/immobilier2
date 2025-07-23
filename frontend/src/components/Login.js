// =================================================================
// FICHIER : frontend/src/components/Login.js
// VERSION CORRIGÉE AVEC REDIRECTION FIABLE + LIEN MDP OUBLIÉ
// =================================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 
  const { login: authLogin } = useAuth(); 

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login({ email, password });
      authLogin(res.data.token, res.data.user);
      console.log("Connexion réussie. Redirection vers la page d'accueil...");
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.msg || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="auth-link">Pas de compte ? <Link to="/register">Inscrivez-vous</Link></p>

      {/* --- AJOUTÉ --- */}
      <p className="auth-link" style={{ marginTop: '10px' }}>
        <Link to="/forgot-password">Mot de passe oublié ?</Link>
      </p>
    </div>
  );
};

export default Login;
