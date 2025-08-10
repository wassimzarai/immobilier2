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

  // Types de biens pour la sidebar
  const typesBien = [
    'Appartements',
    'Maisons',
    'Villas & maisons de luxe',
    'Locaux commerciaux',
    'Bureaux',
    'Terrains',
    'Fermes',
  ];
  const [selectedType, setSelectedType] = useState(typesBien[0]);

  // Filtrage des stats pour le type sélectionné
  const filteredType = selectedType;
  const filteredStatsType = statsType.filter(s => s._id === filteredType);
  const pieDataType = {
    labels: filteredStatsType.map(s => s._id),
    datasets: [{
      label: `Annonces pour ${filteredType}`,
      data: filteredStatsType.map(s => s.count),
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a']
    }]
  };
  // Optionnel : filtrage des autres stats si besoin
  // const filteredStatsMonth = ...
  // const filteredStatsCategorie = ...


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

  const barDataMonth = {
    labels: statsMonth.map(s => s._id),
    datasets: [{
      label: 'Annonces par mois',
      data: statsMonth.map(s => s.count),
      backgroundColor: '#667eea',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };
  const pieDataCategorie = {
    labels: statsCategorie.map(s => s._id),
    datasets: [{
      label: 'Annonces par catégorie',
      data: statsCategorie.map(s => s.count),
      backgroundColor: ['#4facfe', '#00f2fe', '#43e97b']
    }]
  };

  // Styles


  const mainContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#2d3748',
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const sectionStyle = {
    marginBottom: '50px',
    padding: '30px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '25px',
    paddingBottom: '10px',
    borderBottom: '3px solid #667eea'
  };

  const formStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap',
    alignItems: 'end'
  };

  const inputStyle = {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    minWidth: '150px',
    flex: '1'
  };



  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    background: '#ffffff'
  };

  const buttonStyle = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const deleteButtonStyle = {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  };

  const thStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px'
  };

  const tdStyle = {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#4a5568'
  };

  const chartContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginTop: '20px'
  };

  const chartCardStyle = {
    background: '#ffffff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  };

  const chartTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const errorStyle = {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    color: 'white',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '500'
  };

  // Styles sidebar
  const sidebarContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };
  const sidebarStyle = {
    minWidth: '260px',
    background: '#f7f7fa',
    borderRight: '2px solid #e2e8f0',
    padding: '30px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    boxShadow: '8px 0 20px rgba(102,126,234,0.05)'
  };
  const sidebarItemStyle = isActive => ({
    padding: '18px 32px',
    background: isActive ? '#7b7b7b' : 'transparent',
    color: isActive ? '#fff' : '#2d3748',
    fontWeight: isActive ? '700' : '500',
    fontSize: '1.07rem',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s, color 0.2s',
    marginBottom: '2px',
    borderRadius: isActive ? '0 20px 20px 0' : '0'
  });

  return (
    <div style={sidebarContainerStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {typesBien.map(type => (
          <button
            key={type}
            style={sidebarItemStyle(selectedType === type)}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </aside>
      {/* Main content */}
      <div style={{...mainContentStyle, flex: 1}}>

        <h1 style={headerStyle}>Dashboard Admin</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Gestion des utilisateurs</h2>
          
          <form onSubmit={handleCreateUser} style={formStyle}>
            <input 
              required 
              value={newUser.nom} 
              onChange={e => setNewUser({ ...newUser, nom: e.target.value })} 
              placeholder="Nom complet"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <input 
              required 
              type="email" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
              placeholder="Adresse email"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <input 
              required 
              type="password" 
              value={newUser.password} 
              onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
              placeholder="Mot de passe"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <select 
              value={newUser.role} 
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              style={selectStyle}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
            <button 
              type="submit" 
              style={buttonStyle}
              onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              Créer utilisateur
            </button>
          </form>
          
          {loadingUsers ? (
            <div style={loadingStyle}>Chargement des utilisateurs...</div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rôle</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={tdStyle}>{u.nom}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: (u.role || (u.isAdmin ? 'admin' : 'user')) === 'admin' ? '#667eea' : '#48bb78',
                        color: 'white'
                      }}>
                        {u.role || (u.isAdmin ? 'admin' : 'user')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: u.isActive ? '#48bb78' : '#ed8936',
                        color: 'white'
                      }}>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleDeleteUser(u._id)} 
                        style={deleteButtonStyle}
                        onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
                        onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Statistiques des annonces</h2>
          
          <div style={chartContainerStyle}>
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Répartition par type de bien</h3>
              <Pie data={pieDataType} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  }
                }
              }} />
            </div>
            
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Publications par mois</h3>
              <Bar data={barDataMonth} options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: '#e2e8f0'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }} />
            </div>
            
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Répartition par catégorie</h3>
              <Pie data={pieDataCategorie} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  }
                }
              }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardAdmin;
