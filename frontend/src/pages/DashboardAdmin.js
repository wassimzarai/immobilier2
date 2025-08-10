import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin';

const DashboardAdmin = () => {
  // Utilisateurs
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ nom: '', email: '', password: '', role: 'user' });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  // Statistiques annonces
  const [statsType, setStatsType] = useState([]);
  const [statsMonth, setStatsMonth] = useState([]);
  const [statsCategorie, setStatsCategorie] = useState([]);

  // Token admin (à adapter selon ton auth)
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (e) {
      setError(e.response?.data?.msg || 'Erreur chargement utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
    } catch (e) {
      alert(e.response?.data?.msg || 'Erreur suppression');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers([...users, res.data]);
      setNewUser({ nom: '', email: '', password: '', role: 'user' });
    } catch (e) {
      alert(e.response?.data?.msg || 'Erreur création utilisateur');
    }
  };

  const fetchStats = async () => {
    try {
      const [typeRes, monthRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/stats/by-type`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats/by-month`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats/by-categorie`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStatsType(typeRes.data);
      setStatsMonth(monthRes.data);
      setStatsCategorie(catRes.data);
    } catch (e) {
      setError('Erreur chargement statistiques');
    }
  };

  // Préparation des données pour les graphiques
  const pieDataType = {
    labels: statsType.map(s => s._id),
    datasets: [{
      label: 'Annonces par type',
      data: statsType.map(s => s.count),
      backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1']
    }]
  };
  const barDataMonth = {
    labels: statsMonth.map(s => s._id),
    datasets: [{
      label: 'Annonces par mois',
      data: statsMonth.map(s => s.count),
      backgroundColor: '#4e79a7'
    }]
  };
  const pieDataCategorie = {
    labels: statsCategorie.map(s => s._id),
    datasets: [{
      label: 'Annonces par catégorie',
      data: statsCategorie.map(s => s.count),
      backgroundColor: ['#76b7b2', '#e15759', '#edc949']
    }]
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
      <h1>Dashboard Admin</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <section style={{ marginBottom: 32 }}>
        <h2>Gestion des utilisateurs</h2>
        <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input required value={newUser.nom} onChange={e => setNewUser({ ...newUser, nom: e.target.value })} placeholder="Nom" />
          <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" />
          <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Mot de passe" />
          <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Créer</button>
        </form>
        {loadingUsers ? <div>Chargement...</div> : (
          <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.role || (u.isAdmin ? 'admin' : 'user')}</td>
                  <td>{u.isActive ? 'Oui' : 'Non'}</td>
                  <td>
                    <button onClick={() => handleDeleteUser(u._id)} style={{ color: 'red' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2>Statistiques sur les annonces</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3>Par type de bien</h3>
            <Pie data={pieDataType} />
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3>Par mois de publication</h3>
            <Bar data={barDataMonth} />
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3>Par catégorie</h3>
            <Pie data={pieDataCategorie} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardAdmin;
