// Contenu pour : src/components/Activate.js
import React, { useState } from 'react';
import { activate } from '../api/auth';
import { Link } from 'react-router-dom';

const Activate = () => {
  const [formData, setFormData] = useState({ email: '', code: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, code } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await activate({ email, code });
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response.data.msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Activer votre compte</h2>
      <p>Veuillez entrer votre e-mail et le code que vous avez reçu.</p>
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Code d'activation</label>
          <input type="text" name="code" value={code} onChange={onChange} required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Activation...' : 'Activer'}
        </button>
      </form>
      {message && <p className="auth-link"><Link to="/login">Procéder à la connexion</Link></p>}
    </div>
  );
};

export default Activate;
