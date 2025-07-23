// Fichier : frontend/src/hooks/useAuth.js (Version corrigée)
import { useState, useEffect, useContext, createContext } from 'react';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au démarrage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Décoder le token JWT pour vérifier s'il n'est pas expiré
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Vérifier si le token n'est pas expiré
        if (payload.exp * 1000 > Date.now()) {
          // Utiliser les données utilisateur stockées dans localStorage
          setUser(JSON.parse(userData));
        } else {
          // Token expiré, supprimer les données
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
