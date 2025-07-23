
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assurez-vous que ce chemin est correct

import './Navbar.css';

const Navbar = () => {
  // La logique du hook useAuth est maintenant plus simple
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // La fonction de déconnexion est maintenant fournie par le hook
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Le logo redirige toujours vers la page d'accueil principale */}
        <Link to="/" className="navbar-logo">
          MonApp
        </Link>

        {/* La liste des liens de navigation */}
        <ul className="nav-menu">
          
          {/* --- DÉBUT DE LA NOUVELLE LOGIQUE D'AFFICHAGE --- */}

          {/* Si l'utilisateur est connecté... */}
          {isLoggedIn ? (
            <>
              {/* ...on affiche le bouton "Publier une annonce" */}
              <li className="nav-item">
                <Link to="/annonces/ajouter" className="nav-links-button">
                  Publier une annonce
                </Link>
              </li>

              {/* Si l'utilisateur est aussi un admin, on affiche le lien du dashboard */}
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-links">
                    Dashboard Admin
                  </Link>
                </li>
              )}

              {/* Et on affiche le bouton de déconnexion */}
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-links-logout">
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            // --- Si l'utilisateur N'EST PAS connecté... ---
            <>
              {/* ...on affiche les liens pour s'inscrire et se connecter */}
              <li className="nav-item">
                <Link to="/register" className="nav-links">
                  S'inscrire
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-links">
                  Se Connecter
                </Link>
              </li>
            </>
          )}
          
          {/* --- FIN DE LA NOUVELLE LOGIQUE D'AFFICHAGE --- */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
