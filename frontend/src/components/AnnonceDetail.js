// =================================================================
// FICHIER : frontend/src/components/AnnonceDetail.js
// NOUVEAU FICHIER À CRÉER
// =================================================================
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnnonceById } from '../api/annonce'; // On aura besoin de cette fonction
import './AnnonceDetail.css'; // On créera ce fichier pour le style

const AnnonceDetail = () => {
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // useParams() est un hook qui récupère les paramètres de l'URL, comme l'ID de l'annonce
  const { id } = useParams();

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        console.log(`Tentative de chargement de l'annonce avec l'ID : ${id}`);
        const data = await getAnnonceById(id);
        setAnnonce(data);
        console.log("Annonce chargée :", data);
      } catch (err) {
        setError('Annonce non trouvée ou erreur de chargement.');
        console.error(err);
      }
      setLoading(false);
    };

    if (id) {
      fetchAnnonce();
    }
  }, [id]); // Cet effet se relance si l'ID dans l'URL change

  if (loading) return <div className="loading-container"><p>Chargement de l'annonce...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;
  if (!annonce) return <div className="no-results"><p>Aucune annonce à afficher.</p></div>;

  // Affichage des détails de l'annonce
  return (
    <div className="annonce-detail-container">
      <div className="annonce-detail-header">
        <h1>{annonce.typeBien} à {annonce.emplacement.ville}</h1>
        <span className="annonce-detail-prix">
          {annonce.prix.toLocaleString('fr-FR')} TND
        </span>
      </div>
      <div className="annonce-detail-body">
        <p><strong>Catégorie :</strong> {annonce.categorie}</p>
        <p><strong>État du bien :</strong> {annonce.etat}</p>
        <p><strong>Adresse :</strong> {annonce.emplacement.adresse}, {annonce.emplacement.ville}, {annonce.emplacement.region}</p>
        <hr />
        <h3>Description</h3>
        <p>{annonce.description}</p>
        <hr />
        <p><strong>Publié par :</strong> {annonce.auteur?.nom || 'Utilisateur'}</p>
        <p><strong>Date de publication :</strong> {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  );
};

export default AnnonceDetail;
