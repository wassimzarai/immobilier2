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
        <p><strong>Adresse :</strong> {annonce.emplacement?.adresse}, {annonce.emplacement?.ville}, {annonce.emplacement?.region}</p>
        <hr />
        <h3>Description</h3>
        <p>{annonce.description}</p>
        <hr />
        <h3>Détails du bien</h3>
        <ul>
          <li><strong>Surface construite :</strong> {annonce.surfaceConstruite || '-'} m²</li>
          <li><strong>Année de construction :</strong> {annonce.annees || '-'}</li>
          <li><strong>Type de sol :</strong> {annonce.typeSol || '-'}</li>
          <li><strong>Étage :</strong> {annonce.etage || '-'}</li>
          <li><strong>Orientation :</strong> {annonce.orientation || '-'}</li>
          <li><strong>Nombre de pièces :</strong> {annonce.pieces || '-'}</li>
          <li><strong>Nombre de chambres :</strong> {annonce.chambres || '-'}</li>
          <li><strong>Nombre de salles de bains :</strong> {annonce.sallesDeBains || '-'}</li>
          <li><strong>Façade extérieure :</strong> {annonce.facadeExterieure || '-'}</li>
        </ul>
        <h3>Caractéristiques</h3>
        <ul>
          {annonce.caracteristiques && Object.entries(annonce.caracteristiques).map(([key, value]) => (
            <li key={key}><strong>{key} :</strong> {value ? 'Oui' : 'Non'}</li>
          ))}
        </ul>
        <h3>Intérieur</h3>
        <ul>
          {annonce.interieur && Object.entries(annonce.interieur).map(([key, value]) => (
            <li key={key}><strong>{key} :</strong> {value ? 'Oui' : 'Non'}</li>
          ))}
        </ul>
        <h3>Options supplémentaires</h3>
        <ul>
          {annonce.optionsSupplementaires && Object.entries(annonce.optionsSupplementaires).map(([key, value]) => (
            <li key={key}><strong>{key} :</strong> {value ? 'Oui' : 'Non'}</li>
          ))}
        </ul>
        <hr />
        <p><strong>Publié par :</strong> {annonce.auteur?.nom || 'Utilisateur'}</p>
        <p><strong>Date de publication :</strong> {annonce.createdAt ? new Date(annonce.createdAt).toLocaleDateString('fr-FR') : '-'}</p>
      </div>
    </div>
  );
};

export default AnnonceDetail;
