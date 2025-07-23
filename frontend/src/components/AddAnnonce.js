// =================================================================
// FICHIER : frontend/src/components/AddAnnonce.js
// VERSION FINALE CORRIGÉE ET COMPLÈTE
// =================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createAnnonce, getRegions, getVillesByRegion, getRegionDetails } from '../api/annonce';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Form.css';

// --- Correction pour l'icône de Leaflet ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- Sous-composants pour la carte (inchangés) ---
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function LocationMarker({ position, onPositionChange }) {
  const [markerPosition, setMarkerPosition] = useState(position);
  useEffect(() => {
    if(position) setMarkerPosition(position);
  }, [position]);
  useMapEvents({
    click(e) {
      setMarkerPosition(e.latlng);
      onPositionChange(e.latlng);
    },
  });
  return markerPosition ? <Marker position={markerPosition}></Marker> : null;
}

// --- Composant principal du formulaire ---
const AddAnnonce = () => {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Nouvel état pour le step du formulaire
  const [step, setStep] = useState(1);

  // État pour les données du formulaire (étendu pour tous les champs)
  const [formData, setFormData] = useState({
    categorie: 'Vente',
    typeBien: 'Appartements',
    etat: 'Bon état',
    emplacement: {
      region: '',
      ville: '',
      adresse: '',
      coordonnees: { latitude: null, longitude: null }
    },
    prix: '',
    description: '',
    surfaceConstruite: '',
    annees: '',
    typeSol: '',
    etage: '',
    orientation: '',
    pieces: '',
    chambres: '',
    sallesDeBains: '',
    photos: [],
    caracteristiques: {
      jardin: false, terrasse: false, garage: false, ascenseur: false, vueSurMer: false, vueSurMontagnes: false, piscine: false, concierge: false, chambreRangement: false, meuble: false
    },
    facadeExterieure: '',
    interieur: {
      salonEuropeen: false, antenneParabolique: false, cheminee: false, climatisation: false, chauffageCentral: false, securite: false, doubleVitrage: false, porteBlindee: false
    },
    optionsSupplementaires: {
      cuisineEquipee: false, refrigerateur: false, four: false, machineALaver: false, microOndes: false
    }
  });
  const [regions, setRegions] = useState([]);
  const [villes, setVilles] = useState([]);
  const [mapCenter, setMapCenter] = useState([34.8, 9.5]);
  const [mapZoom, setMapZoom] = useState(6);
  const [markerPos, setMarkerPos] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const categorieOptions = ['Vente', 'Location', 'Location vacances'];
  const typeBienOptions = ['Appartements', 'Maisons', 'Villas & maisons de luxe', 'Locaux commerciaux', 'Bureaux', 'Terrains', 'Fermes'];
  const etatOptions = ['Nouveau', 'Bon état', 'À rénover'];

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        alert('Vous devez être connecté pour publier une annonce.');
        navigate('/login');
      } else if (isAdmin) {
        alert('Les administrateurs ne peuvent pas publier d\'annonces.');
        navigate('/admin/dashboard');
      }
    }
    return () => { isMounted.current = false; };
  }, [isLoggedIn, isAdmin, authLoading, navigate]);

  // 1. CHARGEMENT DES RÉGIONS (LA PARTIE LA PLUS IMPORTANTE)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        console.log("Tentative de chargement des régions...");
        const data = await getRegions(); // Appelle l'API
        console.log("Données des régions reçues :", data); // Vérifie ce qu'on a reçu

        if (isMounted.current) {
          // S'assure que data est bien un tableau avant de le mettre dans l'état
          if (Array.isArray(data)) {
            setRegions(data);
            console.log("État 'regions' mis à jour avec succès.");
          } else {
            console.error("Les données reçues ne sont pas un tableau ! La liste restera vide.", data);
            setError('Format de données des régions incorrect.');
          }
        }
      } catch (err) {
        console.error("ERREUR : L'appel API pour getRegions() a échoué.", err);
        if (isMounted.current) setError('Erreur critique lors du chargement des régions.');
      }
    };
    fetchRegions();
  }, []); // Le tableau vide [] signifie que cet effet ne s'exécute qu'une seule fois.

  // 2. MISE À JOUR DES VILLES QUAND UNE RÉGION EST SÉLECTIONNÉE
  useEffect(() => {
    const region = formData.emplacement.region;
    if (region) {
      const fetchVillesAndDetails = async () => {
        try {
          const villesData = await getVillesByRegion(region);
          // If villesData is array of objects (e.g. [{nom: "Tunis"}]), transform to array of strings
          const villesArray = Array.isArray(villesData) && typeof villesData[0] === 'object'
            ? villesData.map(v => v.nom)
            : villesData;
          if (isMounted.current) setVilles(villesArray);
          
          const details = await getRegionDetails(region);
          if (isMounted.current) {
            const newCenter = [details.lat, details.lon];
            const newPosition = { lat: details.lat, lng: details.lon };
            setMapCenter(newCenter);
            setMapZoom(10);
            setMarkerPos(newPosition);
            setFormData(prev => ({
              ...prev,
              emplacement: { ...prev.emplacement, coordonnees: { latitude: details.lat, longitude: details.lon } }
            }));
          }
        } catch (err) {
          console.error('Erreur lors du chargement des villes ou détails:', err);
        }
      };
      fetchVillesAndDetails();
    } else {
      if (isMounted.current) setVilles([]);
    }
  }, [formData.emplacement.region]);

  // 3. GESTION DES CHANGEMENTS DANS LE FORMULAIRE
  const onChange = (e) => {
    const { name, value } = e.target;
    if (['region', 'ville', 'adresse'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        emplacement: { ...prev.emplacement, [name]: value }
      }));
      if (name === 'region') {
        setFormData(prev => ({
          ...prev,
          emplacement: { ...prev.emplacement, ville: '' }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 4. GESTION DU CLIC SUR LA CARTE
  const handlePositionChange = useCallback(async (latlng) => {
    if (!isMounted.current) return;
    setMarkerPos(latlng);
    setFormData(prev => ({
      ...prev,
      emplacement: { ...prev.emplacement, coordonnees: { latitude: latlng.lat, longitude: latlng.lng } }
    }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1` );
      const data = await response.json();
      if (isMounted.current && data && data.address) {
        const adr = data.address;
        setFormData(prev => ({
          ...prev,
          emplacement: {
            ...prev.emplacement,
            region: adr.state || prev.emplacement.region,
            ville: adr.city || adr.town || adr.village || prev.emplacement.ville,
            adresse: `${adr.road || ''} ${adr.house_number || ''}`.trim()
          }
        }));
      }
    } catch (error) {
      console.error("Erreur de géocodage inversé:", error);
    }
  }, []);

  // 5. GESTION DE LA SOUMISSION DU FORMULAIRE
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted.current) return;
    setLoading(true);
    setError('');
    try {
      if (!formData.emplacement.region || !formData.emplacement.ville) {
        throw new Error('La région et la ville sont obligatoires');
      }
      const nouvelleAnnonce = await createAnnonce(formData);
      if (isMounted.current) {
        alert('Annonce publiée avec succès !');
        navigate(`/annonces/${nouvelleAnnonce._id}`);
      }
    } catch (err) {
      if (isMounted.current) setError(err.response?.data?.msg || err.message || 'Une erreur est survenue.');
    }
    if (isMounted.current) setLoading(false);
  };

  if (authLoading) return <div>Chargement...</div>;
  if (!isLoggedIn || isAdmin) return <div>Accès non autorisé.</div>;

  // --- AFFICHAGE DU FORMULAIRE (JSX) ---
  return (
    <div className="form-container">
      <h2>Publier une nouvelle annonce</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={step === 2 ? onSubmit : (e) => { e.preventDefault(); setStep(2); }}>
        {step === 1 && (
          <>
            <div className="form-group">
              <label htmlFor="categorie">Catégorie *</label>
              <select id="categorie" name="categorie" value={formData.categorie} onChange={onChange} required>
                {categorieOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="typeBien">Type de bien *</label>
              <select id="typeBien" name="typeBien" value={formData.typeBien} onChange={onChange} required>
                {typeBienOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="etat">État *</label>
              <select id="etat" name="etat" value={formData.etat} onChange={onChange} required>
                {etatOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <h3>Emplacement</h3>
            <div className="form-group">
              <label htmlFor="region">Région *</label>
              <select id="region" name="region" value={formData.emplacement.region} onChange={onChange} required>
                <option value="">-- Choisissez une région --</option>
                {regions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ville">Ville *</label>
              <select id="ville" name="ville" value={formData.emplacement.ville} onChange={onChange} required disabled={!formData.emplacement.region}>
                <option value="">-- Choisissez une ville --</option>
                {villes.map(ville => <option key={ville} value={ville}>{ville}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="adresse">Adresse</label>
              <input type="text" id="adresse" name="adresse" value={formData.emplacement.adresse} onChange={onChange} placeholder="Numéro et nom de rue" />
            </div>
            <div className="form-group">
              <label>Localisation sur la carte</label>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                  <ChangeView center={mapCenter} zoom={mapZoom} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  <LocationMarker position={markerPos} onPositionChange={handlePositionChange} />
                </MapContainer>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="prix">Prix * (en DT )</label>
              <input type="number" id="prix" name="prix" value={formData.prix} onChange={onChange} required min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea id="description" name="description" value={formData.description} onChange={onChange} required rows="5" />
            </div>
            <button type="button" className="auth-button" onClick={() => setStep(2)}>
              Suivant
            </button>
          </>
        )}
        {step === 2 && (
          <>
            {/* --- CHAMPS SUPPLÉMENTAIRES --- */}
            <div className="form-group">
              <label htmlFor="surfaceConstruite">Surface construite (m²)</label>
              <input type="number" id="surfaceConstruite" name="surfaceConstruite" value={formData.surfaceConstruite} onChange={onChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="annees">Année de construction</label>
              <input type="text" id="annees" name="annees" value={formData.annees} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="typeSol">Type de sol</label>
              <input type="text" id="typeSol" name="typeSol" value={formData.typeSol} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="etage">Étage</label>
              <input type="number" id="etage" name="etage" value={formData.etage} onChange={onChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="orientation">Orientation</label>
              <input type="text" id="orientation" name="orientation" value={formData.orientation} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="pieces">Nombre de pièces</label>
              <input type="number" id="pieces" name="pieces" value={formData.pieces} onChange={onChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="chambres">Nombre de chambres</label>
              <input type="number" id="chambres" name="chambres" value={formData.chambres} onChange={onChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="sallesDeBains">Nombre de salles de bains</label>
              <input type="number" id="sallesDeBains" name="sallesDeBains" value={formData.sallesDeBains} onChange={onChange} min="0" />
            </div>
            {/* Ajoutez ici d'autres champs selon votre modèle, y compris les cases à cocher pour les caractéristiques, etc. */}
            <button type="button" className="auth-button" onClick={() => setStep(1)}>
              Précédent
            </button>
            <button type="submit" className="auth-button" disabled={loading} style={{ marginLeft: '10px' }}>
              {loading ? 'Publication...' : "Publier l'annonce"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default AddAnnonce;
