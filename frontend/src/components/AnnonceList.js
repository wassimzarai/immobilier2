import React, { useState, useEffect } from 'react';
import { getAnnonces } from '../api/annonce';
import { Link } from 'react-router-dom';
import './AnnonceList.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Nouvelle version : gestion proxy dev
const getMediaUrl = (mediaPath, type = 'photos') => {
  if (!mediaPath) return '';
  if (mediaPath.startsWith('http')) return mediaPath;
  if (mediaPath.startsWith('/uploads/')) return mediaPath; // proxy s'en charge
  // Si juste le nom du fichier
  return `/uploads/${type}/${mediaPath.replace(/^.*[\\/]/, '')}`;
};

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
  }, []);

  if (loading) return <div className="loading">Chargement des annonces...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="annonce-list-container">
      <h1>Nos dernières annonces</h1>
      <div className="annonces-grid">
        {annonces.length > 0 ? (
          annonces.map(annonce => (
            <div key={annonce._id} className="annonce-card">
              {(annonce.photos?.length > 0 || annonce.videos?.length > 0) && (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="annonce-media-swiper"
                >
                  {/* Affichage des photos */}
                  {annonce.photos && annonce.photos.map((photoUrl, idx) => {
                    const imageUrl = getMediaUrl(photoUrl, 'photos');
                    return (
                      <SwiperSlide key={`photo-${idx}`}>
                        <img
                          src={imageUrl}
                          alt={`Photo ${idx + 1} de ${annonce.typeBien}`}
                          style={{ width: '100%', maxHeight: 250, objectFit: 'cover', background: '#eee', borderRadius: 12 }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = `${BASE_URL}/uploads/photos/default.jpg`;
                          }}
                        />
                      </SwiperSlide>
                    );
                  })}
                  {/* Affichage des vidéos */}
                  {annonce.videos && annonce.videos.map((videoUrl, idx) => {
                    const videoSrc = getMediaUrl(videoUrl, 'videos');
                    return (
                      <SwiperSlide key={`video-${idx}`}>
                        <video
                          controls
                          style={{ width: '100%', maxHeight: 250, background: '#000', borderRadius: 12 }}
                          onError={() => {
                            console.error(`Erreur de chargement de la vidéo: ${videoSrc}`);
                          }}
                        >
                          <source src={videoSrc} type="video/mp4" />
                          <source src={videoSrc} type="video/webm" />
                          <source src={videoSrc} type="video/ogg" />
                          Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
              <div className="annonce-card-body">
                <span className="annonce-card-categorie">{annonce.categorie}</span>
                <h3>{annonce.typeBien} à {annonce.emplacement?.ville || 'Ville non spécifiée'}</h3>
                <p className="annonce-card-prix">
                  {annonce.prix ? `${annonce.prix.toLocaleString('fr-FR')} TND` : 'Prix non spécifié'}
                </p>
                <p className="annonce-card-description">
                  {annonce.description ? `${annonce.description.substring(0, 100)}...` : 'Aucune description'}
                </p>
                <Link to={`/annonce/${annonce._id}`} className="annonce-card-link">
                  Voir les détails
                </Link>
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
  }, []);

  if (loading) return <div className="loading">Chargement des annonces...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="annonce-list-container">
      <h1>Nos dernières annonces</h1>
      <div className="annonces-grid">
        {annonces.length > 0 ? (
          annonces.map(annonce => (
            <div key={annonce._id} className="annonce-card">
              {(annonce.photos?.length > 0 || annonce.videos?.length > 0) && (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="annonce-media-swiper"
                >
                  {/* Affichage des photos */}
                  {annonce.photos && annonce.photos.map((photoUrl, idx) => {
                    const imageUrl = getMediaUrl(photoUrl, 'photos');
                    return (
                      <SwiperSlide key={`photo-${idx}`}>
                        <img
                          src={imageUrl}
                          alt={`Photo ${idx + 1} de ${annonce.typeBien}`}
                          style={{ width: '100%', maxHeight: 250, objectFit: 'cover', background: '#eee', borderRadius: 12 }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = `${BASE_URL}/uploads/photos/default.jpg`;
                          }}
                        />
                      </SwiperSlide>
                    );
                  })}
                  {/* Affichage des vidéos */}
                  {annonce.videos && annonce.videos.map((videoUrl, idx) => {
                    const videoSrc = getMediaUrl(videoUrl, 'videos');
                    return (
                      <SwiperSlide key={`video-${idx}`}>
                        <video
                          controls
                          style={{
                            width: '100%',
                            maxHeight: 250,
                            background: '#000',
                            borderRadius: 12
                          }}
                          onError={() => {
                            console.error(`Erreur de chargement de la vidéo: ${videoSrc}`);
                          }}
                        >
                          <source src={videoSrc} type="video/mp4" />
                          <source src={videoSrc} type="video/webm" />
                          <source src={videoSrc} type="video/ogg" />
                          Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
              <div className="annonce-card-body">
                <span className="annonce-card-categorie">{annonce.categorie}</span>
                <h3>{annonce.typeBien} à {annonce.emplacement?.ville || 'Ville non spécifiée'}</h3>
                <p className="annonce-card-prix">
                  {annonce.prix ? `${annonce.prix.toLocaleString('fr-FR')} TND` : 'Prix non spécifié'}
                </p>
                <p className="annonce-card-description">
                  {annonce.description ? `${annonce.description.substring(0, 100)}...` : 'Aucune description'}
                </p>
                <Link to={`/annonce/${annonce._id}`} className="annonce-card-link">
                  Voir les détails
                </Link>
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