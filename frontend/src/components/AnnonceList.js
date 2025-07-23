// Fichier : frontend/src/components/AnnonceList.js
import React, { useState, useEffect } from 'react';
import { getAnnonces } from '../api/annonce';
import { Link } from 'react-router-dom';
import './AnnonceList.css'; // Nous créerons ce fichier pour le style

const AnnonceList = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const data = await getAnnonces();
        setAnnonces(data);
      } catch (err) {
        setError('Impossible de charger les annonces.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchAnnonces();
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois, au montage

  if (loading) return <div className="loading">Chargement des annonces...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="annonce-list-container">
      <h1>Nos dernières annonces</h1>
      <div className="annonces-grid">
        {annonces.length > 0 ? (
          annonces.map(annonce => (
            <div key={annonce._id} className="annonce-card">
              {/* On peut ajouter une image ici plus tard */}
              <div className="annonce-card-body">
                <span className="annonce-card-categorie">{annonce.categorie}</span>
                <h3>{annonce.typeBien} à {annonce.emplacement.ville}</h3>
                <p className="annonce-card-prix">{annonce.prix.toLocaleString('fr-FR')} TND</p>
                <p className="annonce-card-description">{annonce.description.substring(0, 100)}...</p>

              </div>
            </div>
          ))
        ) : (
          <p>Aucune annonce disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default AnnonceList;
