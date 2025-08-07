import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import './ImmobilierModerne.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ImmobilierModerne() {
  // ...
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactAnnonce, setContactAnnonce] = useState(null);
  const [contactForm, setContactForm] = useState({ nom: '', email: '', telephone: '', pays: 'Tunisie', message: '' });
  const [sendingContact, setSendingContact] = useState(false);

  const openContactModal = (annonce) => {
    setContactAnnonce(annonce);
    setShowContactModal(true);
  };
  const closeContactModal = () => {
    setShowContactModal(false);
    setContactAnnonce(null);
    setContactForm({ nom: '', email: '', telephone: '', pays: 'Tunisie', message: '' });
  };

  const handleContactFormChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!contactAnnonce) return;
    setSendingContact(true);
    try {
      await axios.post('http://localhost:5000/api/contacts', {
        annonceId: contactAnnonce._id,
        nom: contactForm.nom,
        email: contactForm.email,
        telephone: contactForm.telephone,
        pays: contactForm.pays,
        message: contactForm.message,
      });
      alert('Votre demande de contact a été envoyée au propriétaire de l\'annonce.');
      closeContactModal();
    } catch (err) {
      alert("Erreur lors de l'envoi du contact : " + (err.response?.data?.msg || err.message));
    }
    setSendingContact(false);
  };

  // ...
  const [activeCategory, setActiveCategory] = useState('Vente'); // 'Vente' ou 'Location'
  const [annonces, setAnnonces] = useState([]);
  const [ville, setVille] = useState('');
  const [typeBien, setTypeBien] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupération des annonces filtrées depuis le backend
  const fetchAnnonces = async () => {
    setLoading(true);
    try {
      const params = {
        categorie: activeCategory,
      };
      if (ville && ville !== 'Toutes les villes') params['emplacement.ville'] = ville;
      if (typeBien && typeBien !== 'Tous types de bien') params.typeBien = typeBien;
      if (prixMin) params.prixMin = prixMin;
      if (prixMax) params.prixMax = prixMax;
      const res = await axios.get('/api/annonces', { params });
      setAnnonces(res.data);
    } catch (e) {
      setAnnonces([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnonces();
    // eslint-disable-next-line
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnnonces();
  };

  // Liste statique des 24 régions tunisiennes avec coordonnées (extrait backend)
  const REGIONS_TN = [
    { nom: "Ariana", lat: 36.8625, lon: 10.1956 },
    { nom: "Béja", lat: 36.7256, lon: 9.1817 },
    { nom: "Ben Arous", lat: 36.7531, lon: 10.2283 },
    { nom: "Bizerte", lat: 37.2744, lon: 9.8625 },
    { nom: "Gabès", lat: 33.8814, lon: 10.0982 },
    { nom: "Gafsa", lat: 34.425, lon: 8.7842 },
    { nom: "Jendouba", lat: 36.5011, lon: 8.7808 },
    { nom: "Kairouan", lat: 35.6781, lon: 10.0963 },
    { nom: "Kasserine", lat: 35.1676, lon: 8.8365 },
    { nom: "Kébili", lat: 33.7044, lon: 8.9692 },
    { nom: "Le Kef", lat: 36.174, lon: 8.7049 },
    { nom: "Mahdia", lat: 35.5047, lon: 11.0622 },
    { nom: "La Manouba", lat: 36.8081, lon: 10.0965 },
    { nom: "Médenine", lat: 33.3549, lon: 10.5055 },
    { nom: "Monastir", lat: 35.7643, lon: 10.8113 },
    { nom: "Nabeul", lat: 36.4561, lon: 10.735 },
    { nom: "Sfax", lat: 34.7406, lon: 10.7603 },
    { nom: "Sidi Bouzid", lat: 35.0372, lon: 9.4849 },
    { nom: "Siliana", lat: 36.0833, lon: 9.3667 },
    { nom: "Sousse", lat: 35.8254, lon: 10.637 },
    { nom: "Tataouine", lat: 32.9297, lon: 10.451 },
    { nom: "Tozeur", lat: 33.919, lon: 8.1339 },
    { nom: "Tunis", lat: 36.8065, lon: 10.1815 },
    { nom: "Zaghouan", lat: 36.404, lon: 10.1432 }
  ];
  const [selectedRegion, setSelectedRegion] = useState('');
  // Liste des villes par région (extrait backend, simplifié)
  const VILLES_PAR_REGION = {
    "Ariana": ["Ariana Ville", "La Soukra", "Raoued", "Ettadhamen", "Mnihla"],
    "Béja": ["Béja", "Medjez el-Bab", "Téboursouk", "Nefza"],
    "Ben Arous": ["Ben Arous", "El Mourouj", "Hammam Lif", "Radès", "Mégrine"],
    "Bizerte": ["Bizerte", "Menzel Bourguiba", "Ras Jebel", "Mateur"],
    "Gabès": ["Gabès", "Ghannouch", "Médenine", "Mareth"],
    "Gafsa": ["Gafsa", "Métlaoui", "El Ksar", "Redeyef"],
    "Jendouba": ["Jendouba", "Tabarka", "Aïn Draham", "Bousalem"],
    "Kairouan": ["Kairouan", "Sbikha", "Haffouz", "Oueslatia"],
    "Kasserine": ["Kasserine", "Sbeïtla", "Fériana", "Thala"],
    "Kébili": ["Kébili", "Douz", "Souk Lahad"],
    "Le Kef": ["Le Kef", "Dahmani", "Tajerouine", "Sakiet Sidi Youssef"],
    "Mahdia": ["Mahdia", "El Jem", "Chebba", "Ksour Essef"],
    "La Manouba": ["La Manouba", "Douar Hicher", "Oued Ellil", "Tebourba"],
    "Médenine": ["Médenine", "Ben Gardane", "Zarzis", "Djerba Houmt Souk"],
    "Monastir": ["Monastir", "Moknine", "Teboulba", "Sahline", "Jemmal"],
    "Nabeul": ["Nabeul", "Hammamet", "Dar Chaabane", "Kélibia", "Menzel Temime"],
    "Sfax": ["Sfax Ville", "Sakiet Ezzit", "Sakiet Eddaier", "El Ain", "Agareb"],
    "Sidi Bouzid": ["Sidi Bouzid", "Meknassy", "Regueb", "Jilma"],
    "Siliana": ["Siliana", "Makthar", "Bou Arada", "Gaâfour"],
    "Sousse": ["Sousse", "Hammam Sousse", "Port El Kantaoui", "Msaken", "Kalaâ Kebira"],
    "Tataouine": ["Tataouine", "Ghomrassen", "Remada"],
    "Tozeur": ["Tozeur", "Nefta", "Degache"],
    "Tunis": ["Tunis Ville", "La Marsa", "Le Bardo", "Carthage", "Le Kram"],
    "Zaghouan": ["Zaghouan", "El Fahs", "Nadhour"]
  };
  const villes = selectedRegion && VILLES_PAR_REGION[selectedRegion] ? ['Toutes les villes', ...VILLES_PAR_REGION[selectedRegion]] : ['Toutes les villes'];
  const typesBien = ['Tous types de bien', 'Appartements', 'Maisons', 'Villas & maisons de luxe', 'Locaux commerciaux', 'Bureaux', 'Terrains', 'Fermes'];

  // Ref pour la carte Leaflet
  const mapRef = React.useRef(null);

  return (
    <div className="immobilier-moderne-container">
      {/* Barre de filtres */}
      <form className="immobilier-moderne-filters" onSubmit={handleSearch}>
        <div className="immobilier-moderne-categories">
          <button type="button" className={activeCategory === 'Vente' ? 'active' : ''} onClick={() => setActiveCategory('Vente')}>Vente</button>
          <button type="button" className={activeCategory === 'Location' ? 'active' : ''} onClick={() => setActiveCategory('Location')}>Location</button>
        </div>
        <select value={ville} onChange={e => setVille(e.target.value)}>
          {villes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={typeBien} onChange={e => setTypeBien(e.target.value)}>
          {typesBien.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={prixMin} onChange={e => setPrixMin(e.target.value)}>
  <option value="">Tout</option>
  {Array.from({length: 14}, (_, i) => 70000 * (i + 1)).map(val => (
    <option key={val} value={val}>{val.toLocaleString('fr-TN')} TND</option>
  ))}
  <option value="1000000">1 000 000 TND</option>
</select>
        <select value={prixMax} onChange={e => setPrixMax(e.target.value)}>
  <option value="">Max. Budget</option>
  {Array.from({length: 14}, (_, i) => 70000 * (i + 1)).map(val => (
    <option key={val} value={val}>{val.toLocaleString('fr-TN')} TND</option>
  ))}
  <option value="1000000">1 000 000 TND</option>
</select>
        <button type="submit" className="btn-rechercher">Rechercher</button>
      </form>

      {/* Carte Leaflet interactive */}
      <div className="immobilier-moderne-map">
        <MapContainer center={[34.5, 9.5]} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} ref={mapRef}>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  {REGIONS_TN.map(({ nom, lat, lon }) => (
    <Marker
      key={nom}
      position={[lat, lon]}
      icon={L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      })}
      eventHandlers={{
        click: () => {
          setSelectedRegion(nom);
          setVille(nom);
        },
      }}
    >
      <Popup>
        <div style={{fontWeight:'bold'}}>{nom}</div>
        <button
          style={{marginTop:'0.5rem', background:'#00c58e', color:'#fff', border:'none', borderRadius:'4px', padding:'4px 10px', cursor:'pointer'}}
          onClick={() => { setSelectedRegion(nom); setVille(nom); }}
        >Voir les annonces</button>
      </Popup>
    </Marker>
  ))}
</MapContainer>
      </div>
      {/* Formulaire de recherche de région et ville sous la carte */}
      <form className="region-search-form" onSubmit={e => {e.preventDefault(); fetchAnnonces();}} style={{margin:'1rem 0', textAlign:'center', display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
        <div>
          <label htmlFor="region-select" style={{marginRight:'8px'}}>Région :</label>
          <select id="region-select" value={selectedRegion} onChange={e => {setSelectedRegion(e.target.value); setVille('Toutes les villes');}}>
            <option value="">Toutes les régions</option>
            {REGIONS_TN.map(r => (
              <option key={r.nom} value={r.nom}>{r.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ville-select" style={{marginRight:'8px'}}>Ville :</label>
          <select id="ville-select" value={ville} onChange={e => {
            setVille(e.target.value);
            // Synchroniser la carte sur la région de la ville choisie
            if (selectedRegion && e.target.value && e.target.value !== 'Toutes les villes') {
              const regionObj = REGIONS_TN.find(r => r.nom === selectedRegion);
              if (regionObj && mapRef.current) {
                mapRef.current.setView([regionObj.lat, regionObj.lon], 9);
              }
            }
          }}>
            {villes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-rechercher" style={{marginLeft:'8px'}}>Filtrer</button>
      </form>

      {/* Grille d'annonces */}
      <div className="immobilier-moderne-listings">
        <h2>Annonces Immobilières</h2>
        {loading ? <div>Chargement...</div> : (
          <div className="annonces-grid">
            {annonces.map((annonce) => {
  const formatPrice = (price) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const getMediaUrl = (mediaPath, type = 'photos') => {
    if (!mediaPath) return '';
    if (mediaPath.startsWith('http')) return mediaPath;
    if (mediaPath.startsWith('/uploads/')) return mediaPath;
    return `/uploads/${type}/${mediaPath.replace(/^.*[\\/]/, '')}`;
  };
  return (
    <div key={annonce._id} className="annonce-card">
      <div className="annonce-header">
        <span className="annonce-category">{annonce.categorie}</span>
        <span className="annonce-type">{annonce.typeBien}</span>
      </div>
      {(annonce.photos?.length > 0 || annonce.videos?.length > 0) && (
        <div className="annonce-media-swiper">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            style={{ borderRadius: 12, height: 260, marginBottom: 12 }}
          >
            {[...(annonce.photos || []).map(photoUrl => ({ type: 'photo', url: photoUrl })),
              ...(annonce.videos || []).map(videoUrl => ({ type: 'video', url: videoUrl }))].map((media, idx) => {
              if (media.type === 'photo') {
                const imageUrl = getMediaUrl(media.url, 'photos');
                return (
                  <SwiperSlide key={`photo-${idx}`}>
                    <img
                      src={imageUrl}
                      alt="Annonce visuel"
                      style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12 }}
                      onError={e => { e.target.onerror = null; e.target.src = '/no-image.jpg'; }}
                    />
                  </SwiperSlide>
                );
              } else {
                const videoSrc = getMediaUrl(media.url, 'videos');
                return (
                  <SwiperSlide key={`video-${idx}`}>
                    <video
                      controls
                      style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12 }}
                    >
                      <source src={videoSrc} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </SwiperSlide>
                );
              }
            })}
          </Swiper>
        </div>
      )}
      <div className="annonce-content">
        <h3 className="annonce-title">{annonce.typeBien} - {annonce.emplacement?.ville}</h3>
        <p className="annonce-location">📍 {annonce.emplacement?.adresse}, {annonce.emplacement?.ville}</p>
        <p className="annonce-description">{annonce.description?.substring(0, 120)}...</p>
        <div className="annonce-details">
          <span className="annonce-price">{formatPrice(annonce.prix)}</span>
          <span className="annonce-state">État: {annonce.etat}</span>
        </div>
        <div className="annonce-meta">
          <span className="annonce-date">Publié le {formatDate(annonce.createdAt)}</span>
          <span className="annonce-author">Par {annonce.auteur?.nom || 'Anonyme'}</span>
        </div>
      </div>
      <div className="annonce-actions" style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
        <button className="btn-contacter" onClick={() => openContactModal(annonce)}>Contacter</button>
        <a href={`/annonces/${annonce._id}`} className="btn-view-details">Voir les détails</a>
      </div>
    </div>
  );
})}

      {/* Modal Contact */}
      {showContactModal && (
        <div className="modal-contact-overlay">
          <div className="modal-contact">
            <button className="modal-close-btn" onClick={closeContactModal} aria-label="Fermer la modale">&times;</button>
            <h3>Contacter l'annonceur</h3>
            <p>Veuillez nous laisser vos coordonnées sur lesquels vous souhaitez être rappelé.</p>
            <form onSubmit={handleContact}>
              <label htmlFor="nom">Votre nom</label>
              <input id="nom" name="nom" type="text" placeholder="Votre nom" value={contactForm.nom} onChange={handleContactFormChange} required />
              <label htmlFor="email">Votre adresse email</label>
              <input id="email" name="email" type="email" placeholder="Votre email" value={contactForm.email} onChange={handleContactFormChange} required />
              <label htmlFor="telephone">Votre Téléphone</label>
              <input id="telephone" name="telephone" type="text" placeholder="Téléphone" value={contactForm.telephone} onChange={handleContactFormChange} required />
              <label htmlFor="pays">Pays</label>
              <input id="pays" name="pays" type="text" placeholder="Pays" value={contactForm.pays} onChange={handleContactFormChange} required />
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Décrivez vos besoins spécifiques" value={contactForm.message} onChange={handleContactFormChange} required rows={4} />
              <div className="modal-btns">
                <button type="button" className="btn-annuler" onClick={closeContactModal} disabled={sendingContact}>Annuler</button>
                <button type="submit" className="btn-envoyer" disabled={sendingContact}>{sendingContact ? 'Envoi...' : 'Contacter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

            {annonces.length === 0 && <div>Aucune annonce trouvée.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
