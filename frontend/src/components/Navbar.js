import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo + nom + slogan */}
        <div className="navbar-logo-slogan">
          <Link to="/" className="navbar-logo">
            <span style={{ color: '#00C58E', fontWeight: 'bold', fontSize: 26 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#FFD166" style={{verticalAlign: 'middle', marginRight: 8}}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Aqarino
            </span>
          </Link>
          <div className="navbar-slogan">
            <div className="slogan-ar">عقارك في متناولك</div>
            <div className="slogan-fr">Votre bien, à portée de clic</div>
          </div>
        </div>



        {/* Liens centraux */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/annonces?type=vente" className="nav-links">Acheter</Link>
          </li>
          <li className="nav-item">
            <Link to="/annonces?type=location" className="nav-links">Louer</Link>
          </li>
          <li className="nav-item">
            <Link to="/publier" className="nav-links">Publier</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links">Contact</Link>
          </li>
        </ul>

        {/* Actions à droite */}
        <div className="navbar-actions">
          <Link to="/annonces/ajouter" className="nav-links-button nav-btn-publish">
            Publier une annonce
          </Link>
          <button onClick={handleLogout} className="nav-links-logout nav-btn-logout">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;