// =================================================================
// FICHIER : frontend/src/components/AddAnnonce.js
// VERSION FINALE AVEC LA STRUCTURE JSX CORRIGÉE
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

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    categorie: 'Vente', typeBien: 'Appartements', etat: 'Bon état',
    emplacement: { region: '', ville: '', adresse: '', coordonnees: { latitude: null, longitude: null } },
    prix: '', description: '', surfaceConstruite: '', annees: '', typeSol: '', etage: '',
    orientation: '', pieces: '', chambres: '', sallesDeBains: '',
    photos: [], videos: [],
    caracteristiques: { jardin: false, terrasse: false, garage: false, ascenseur: false, vueSurMer: false, vueSurMontagnes: false, piscine: false, concierge: false, chambreRangement: false, meuble: false },
    interieur: { salonEuropeen: false, antenneParabolique: false, cheminee: false, climatisation: false, chauffageCentral: false, securite: false, doubleVitrage: false, porteBlindee: false },
    optionsSupplementaires: { cuisineEquipee: false, refrigerateur: false, four: false, machineALaver: false, microOndes: false }
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

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        if (isMounted.current && Array.isArray(data)) setRegions(data);
      } catch (err) {
        if (isMounted.current) setError('Erreur critique lors du chargement des régions.');
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const region = formData.emplacement.region;
    if (region) {
      const fetchVillesAndDetails = async () => {
        try {
          const villesData = await getVillesByRegion(region);
          if (isMounted.current) setVilles(villesData);
          const details = await getRegionDetails(region);
          if (isMounted.current) {
            const newCenter = [details.lat, details.lon];
            setMapCenter(newCenter);
            setMapZoom(10);
            setMarkerPos(newCenter);
            setFormData(prev => ({ ...prev, emplacement: { ...prev.emplacement, coordonnees: { latitude: details.lat, longitude: details.lon } } }));
          }
        } catch (err) { console.error('Erreur chargement villes/détails:', err); }
      };
      fetchVillesAndDetails();
    } else {
      if (isMounted.current) setVilles([]);
    }
  }, [formData.emplacement.region]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (['region', 'ville', 'adresse'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        emplacement: {
          ...prev.emplacement,
          [name]: value,
          ...(name === 'region' ? { ville: '' } : {})
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handlePositionChange = useCallback(async (latlng) => {
    if (!isMounted.current) return;
    setMarkerPos(latlng);
    setFormData(prev => ({ ...prev, emplacement: { ...prev.emplacement, coordonnees: { latitude: latlng.lat, longitude: latlng.lng } } }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1` );
      const data = await response.json();
      if (isMounted.current && data && data.address) {
        const adr = data.address;
        setFormData(prev => ({ ...prev, emplacement: { ...prev.emplacement, region: adr.state || prev.emplacement.region, ville: adr.city || adr.town || adr.village || prev.emplacement.ville, adresse: `${adr.road || ''} ${adr.house_number || ''}`.trim() } }));
      }
    } catch (error) { console.error("Erreur géocodage inversé:", error); }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted.current) return;
    setLoading(true);
    setError('');
    try {
      if (!formData.emplacement.region || !formData.emplacement.ville) {
        setError('Veuillez sélectionner une région et une ville.');
        setLoading(false);
        return;
      }
      const fd = new window.FormData();
      fd.append('categorie', formData.categorie);
      fd.append('typeBien', formData.typeBien);
      fd.append('etat', formData.etat);
      fd.append('prix', formData.prix);
      fd.append('description', formData.description);
      fd.append('emplacement', JSON.stringify(formData.emplacement));
      // Ajout explicite des champs à plat pour compat backend
      fd.append('region', formData.emplacement.region);
      fd.append('ville', formData.emplacement.ville);
      fd.append('surfaceConstruite', formData.surfaceConstruite);
      fd.append('annees', formData.annees);
      fd.append('typeSol', formData.typeSol);
      fd.append('etage', formData.etage);
      fd.append('orientation', formData.orientation);
      fd.append('pieces', formData.pieces);
      fd.append('chambres', formData.chambres);
      fd.append('sallesDeBains', formData.sallesDeBains);
      fd.append('caracteristiques', JSON.stringify(formData.caracteristiques));
      fd.append('interieur', JSON.stringify(formData.interieur));
      fd.append('optionsSupplementaires', JSON.stringify(formData.optionsSupplementaires));
      formData.photos.forEach(photo => fd.append('photos', photo));
      formData.videos.forEach(video => fd.append('videos', video));
      const nouvelleAnnonce = await createAnnonce(fd, true);
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
      
      {/* La balise <form> entoure toute la logique des étapes */}
      <form onSubmit={onSubmit}>
        
        {/* ÉTAPE 1: Informations de base */}
        {step === 1 && (
          <>
            <div className="form-group"><label>Catégorie *</label><select name="categorie" value={formData.categorie} onChange={onChange} required>{categorieOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className="form-group"><label>Type de bien *</label><select name="typeBien" value={formData.typeBien} onChange={onChange} required>{typeBienOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className="form-group"><label>État *</label><select name="etat" value={formData.etat} onChange={onChange} required>{etatOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <h3>Emplacement</h3>
            <div className="form-group"><label>Région *</label><select name="region" value={formData.emplacement.region} onChange={onChange} required><option value="">-- Choisissez --</option>{regions.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div className="form-group"><label>Ville *</label><select name="ville" value={formData.emplacement.ville} onChange={onChange} required disabled={!formData.emplacement.region}><option value="">-- Choisissez --</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label>Adresse</label><input type="text" name="adresse" value={formData.emplacement.adresse} onChange={onChange} /></div>
            <div className="form-group"><label>Localisation sur la carte</label><div style={{ height: '400px', width: '100%' }}><MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}><ChangeView center={mapCenter} zoom={mapZoom} /><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' /><LocationMarker position={markerPos} onPositionChange={handlePositionChange} /></MapContainer></div></div>
            <div className="form-group"><label>Prix * (en DT )</label><input type="number" name="prix" value={formData.prix} onChange={onChange} required min="0" /></div>
            <div className="form-group"><label>Description *</label><textarea name="description" value={formData.description} onChange={onChange} required rows="5" /></div>
            
            <button type="button" className="auth-button" onClick={() => setStep(2)}>Suivant</button>
          </>
        )}

        {/* ÉTAPE 2: Caractéristiques détaillées */}
        {step === 2 && (
          <>
            <div className="form-group"><label>Surface (m²)</label><input type="number" name="surfaceConstruite" value={formData.surfaceConstruite} onChange={onChange} min="0" /></div>
            <div className="form-group"><label>Année construction</label><input type="text" name="annees" value={formData.annees} onChange={onChange} /></div>
            <div className="form-group"><label>Type de sol</label><input type="text" name="typeSol" value={formData.typeSol} onChange={onChange} /></div>
            <div className="form-group"><label>Étage</label><input type="number" name="etage" value={formData.etage} onChange={onChange} min="0" /></div>
            <div className="form-group"><label>Orientation</label><input type="text" name="orientation" value={formData.orientation} onChange={onChange} /></div>
            <div className="form-group"><label>Pièces</label><input type="number" name="pieces" value={formData.pieces} onChange={onChange} min="0" /></div>
            <div className="form-group"><label>Chambres</label><input type="number" name="chambres" value={formData.chambres} onChange={onChange} min="0" /></div>
            <div className="form-group"><label>Salles de bains</label><input type="number" name="sallesDeBains" value={formData.sallesDeBains} onChange={onChange} min="0" /></div>
            <h3>Caractéristiques</h3>
            <div className="form-group checkbox-group">{Object.keys(formData.caracteristiques).map(key => (<label key={key}><input type="checkbox" checked={formData.caracteristiques[key]} onChange={e => setFormData(p => ({...p, caracteristiques: {...p.caracteristiques, [key]: e.target.checked}}))} /> {key}</label>))}</div>
            <h3>Intérieur</h3>
            <div className="form-group checkbox-group">{Object.keys(formData.interieur).map(key => (<label key={key}><input type="checkbox" checked={formData.interieur[key]} onChange={e => setFormData(p => ({...p, interieur: {...p.interieur, [key]: e.target.checked}}))} /> {key}</label>))}</div>
            <h3>Options supplémentaires</h3>
            <div className="form-group checkbox-group">{Object.keys(formData.optionsSupplementaires).map(key => (<label key={key}><input type="checkbox" checked={formData.optionsSupplementaires[key]} onChange={e => setFormData(p => ({...p, optionsSupplementaires: {...p.optionsSupplementaires, [key]: e.target.checked}}))} /> {key}</label>))}</div>

            <button type="button" className="auth-button" onClick={() => setStep(1)}>Précédent</button>
            <button type="button" className="auth-button" onClick={() => setStep(3)} style={{ marginLeft: '10px' }}>Suivant</button>
          </>
        )}

        {/* ÉTAPE 3: Photos et Vidéos */}
        {step === 3 && (
          <>
            <h2>Ajoutez vos photos et vidéos</h2>
            <div className="form-group">
              <label htmlFor="photos">Photos (max 10)</label>
              <input type="file" id="photos" name="photos" accept="image/*" multiple
                onChange={e => setFormData(prev => ({ ...prev, photos: Array.from(e.target.files).slice(0, 10) }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="videos">Vidéos</label>
              <input type="file" id="videos" name="videos" accept="video/*" multiple
                onChange={e => setFormData(prev => ({ ...prev, videos: Array.from(e.target.files) }))}
              />
            </div>
            {(formData.photos.length > 0 || formData.videos.length > 0) && (
              <div className="recap-media-preview">
                <h4>Aperçu des médias :</h4>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {formData.photos.map((photo, idx) => (<img key={idx} src={URL.createObjectURL(photo)} alt="aperçu" style={{ width: 100, height: 70, objectFit: 'cover' }} />))}
                  {formData.videos.map((video, idx) => (<video key={idx} src={URL.createObjectURL(video)} style={{ width: 100, height: 70 }} controls />))}
                </div>
              </div>
            )}
            <button type="button" className="auth-button" onClick={() => setStep(2)}>Précédent</button>
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
