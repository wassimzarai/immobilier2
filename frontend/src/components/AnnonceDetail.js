// =================================================================
// FICHIER : frontend/src/components/AnnonceDetail.js
// =================================================================
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnnonceById } from '../api/annonce';
import './AnnonceDetail.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Adresse de base pour ton backend (adapter si besoin)
const BASE_URL = "http://localhost:5000";

// Fonction utilitaire pour construire l'URL complète des médias
const getMediaUrl = (mediaPath, type = 'photos') => {
  if (!mediaPath) return '';
  if (mediaPath.startsWith('http')) return mediaPath;
  if (mediaPath.startsWith('/uploads/')) return `${BASE_URL}${mediaPath}`;
  return `${BASE_URL}/uploads/${type}/${mediaPath.replace(/^.*[\\/]/, '')}`;
};

const AnnonceDetail = () => {
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        console.log(`Chargement de l'annonce avec l'ID : ${id}`);
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
  }, [id]);

  if (loading) return <div className="loading-container"><p>Chargement de l'annonce...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;
  if (!annonce) return <div className="no-results"><p>Aucune annonce à afficher.</p></div>;

  return (
    <div className="annonce-detail-container">
      {(annonce.photos?.length > 0 || annonce.videos?.length > 0) && (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          className="annonce-media-swiper"
        >
          {annonce.photos && annonce.photos.map((photoUrl, idx) => (
            <SwiperSlide key={`photo-${idx}`}>
              <img
                src={getMediaUrl(photoUrl, 'photos')}
                alt={`photo-${idx}`}
                style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `${BASE_URL}/uploads/photos/default.jpg`;
                }}
              />
            </SwiperSlide>
          ))}
          {annonce.videos && annonce.videos.map((videoUrl, idx) => (
            <SwiperSlide key={`video-${idx}`}>
              <video
                controls
                style={{ width: '100%', maxHeight: 400, background: '#000' }}
              >
                <source src={getMediaUrl(videoUrl, 'videos')} type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
              </video>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className="annonce-detail-header">
        <h1>{annonce.typeBien} à {annonce.emplacement?.ville || 'Ville non spécifiée'}</h1>
        <span className="annonce-detail-prix">
          {annonce.prix ? `${annonce.prix.toLocaleString('fr-FR')} TND` : 'Prix non spécifié'}
        </span>
      </div>

      <div className="annonce-detail-body">
        <p><strong>Catégorie :</strong> {annonce.categorie}</p>
        <p><strong>État du bien :</strong> {annonce.etat}</p>
        <p><strong>Adresse :</strong> {annonce.emplacement?.adresse || '-'}, {annonce.emplacement?.ville || '-'}, {annonce.emplacement?.region || '-'}</p>
        <hr />
        <h3>Description</h3>
        <p>{annonce.description || 'Aucune description'}</p>
        <hr />
        <h3>Détails du bien</h3>
        <ul>
          <li><strong>Surface construite :</strong> {annonce.surfaceConstruite || '-' } m²</li>
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
          {annonce.caracteristiques && Object.entries(annonce.caracteristiques).filter(([_, val]) => val).length > 0 ? (
            Object.entries(annonce.caracteristiques).filter(([_, val]) => val).map(([key]) => (
              <li key={key}><strong>{key}</strong></li>
            ))
          ) : (
            <li>Aucune</li>
          )}
        </ul>

        <h3>Intérieur</h3>
        <ul>
          {annonce.interieur && Object.entries(annonce.interieur).filter(([_, val]) => val).length > 0 ? (
            Object.entries(annonce.interieur).filter(([_, val]) => val).map(([key]) => (
              <li key={key}><strong>{key}</strong></li>
            ))
          ) : (
            <li>Aucune</li>
          )}
        </ul>

        <h3>Options supplémentaires</h3>
        <ul>
          {annonce.optionsSupplementaires && Object.entries(annonce.optionsSupplementaires).filter(([_, val]) => val).length > 0 ? (
            Object.entries(annonce.optionsSupplementaires).filter(([_, val]) => val).map(([key]) => (
              <li key={key}><strong>{key}</strong></li>
            ))
          ) : (
            <li>Aucune</li>
          )}
        </ul>

        <hr />
        <p><strong>Publié par :</strong> {annonce.auteur?.nom || 'Utilisateur'}</p>
        <p><strong>Date de publication :</strong> {annonce.createdAt ? new Date(annonce.createdAt).toLocaleDateString('fr-FR') : '-'}</p>
      </div>
    </div>
  );
};

export default AnnonceDetail;
