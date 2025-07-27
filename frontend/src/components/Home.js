// =================================================================
// FICHIER : frontend/src/components/Home.js
// VERSION FINALE AVEC CORRECTION DE LA RÉPONSE API
// =================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAnnonces } from '../api/annonce';
import './Home.css';

const Home = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    categorie: '',
    typeBien: '',
    prixMin: '',
    prixMax: ''
  });

  const categorieOptions = ['Vente', 'Location', 'Location vacances'];
  const typeBienOptions = ['Appartements', 'Maisons', 'Villas & maisons de luxe', 'Locaux commerciaux', 'Bureaux', 'Terrains', 'Fermes'];

  // --- CORRECTION 2 : Utiliser useCallback pour éviter les re-créations de fonction ---
  // Cela stabilise les dépendances du useEffect et empêche les boucles.
  const loadAnnonces = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      console.log("Chargement des annonces avec les filtres :", filterParams);
      const response = await getAnnonces(filterParams);

      // --- CORRECTION 1 : Accepter directement un tableau ---
      // On vérifie maintenant si la réponse est directement un tableau.
      if (Array.isArray(response)) {
        setAnnonces(response);
        console.log("Annonces reçues et mises à jour :", response);
      } else {
        // Si la réponse n'est pas un tableau, on vide la liste.
        setAnnonces([]);
        console.warn("Réponse inattendue de l'API (devrait être un tableau) :", response);
      }
      // --- FIN DE LA CORRECTION 1 ---

    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      setError('Impossible de charger les annonces.');
    }
    setLoading(false);
  }, []); // useCallback mémorise la fonction

  // Ce useEffect se lance une seule fois au chargement initial
  useEffect(() => {
    loadAnnonces();
  }, [loadAnnonces]); // On ajoute loadAnnonces comme dépendance stable

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) activeFilters[key] = filters[key];
    });
    // Correction : envoyer prixMin/prixMax comme nombres si présents
    if (activeFilters.prixMin) activeFilters.prixMin = Number(activeFilters.prixMin);
    if (activeFilters.prixMax) activeFilters.prixMax = Number(activeFilters.prixMax);
    loadAnnonces(activeFilters);
  };

  const resetFilters = () => {
    setFilters({ categorie: '', typeBien: '', prixMin: '', prixMax: '' });
    loadAnnonces();
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trouvez votre bien immobilier idéal</h1>
          <p>Découvrez des milliers d'annonces immobilières en Tunisie</p>
        </div>
      </section>

      <section className="filters-section">
        <div className="filters-container">
          <h2>Rechercher un bien</h2>
          <div className="filters-grid">
            <div className="filter-group"><label htmlFor="categorie">Catégorie</label><select id="categorie" name="categorie" value={filters.categorie} onChange={handleFilterChange}><option value="">Toutes</option>{categorieOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className="filter-group"><label htmlFor="typeBien">Type de bien</label><select id="typeBien" name="typeBien" value={filters.typeBien} onChange={handleFilterChange}><option value="">Tous</option>{typeBienOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className="filter-group"><label htmlFor="prixMin">Prix min (DT)</label><input type="number" id="prixMin" name="prixMin" value={filters.prixMin} onChange={handleFilterChange} placeholder="Ex: 100000" /></div>
            <div className="filter-group"><label htmlFor="prixMax">Prix max (DT)</label><input type="number" id="prixMax" name="prixMax" value={filters.prixMax} onChange={handleFilterChange} placeholder="Ex: 500000" /></div>
          </div>
          <div className="filters-actions">
            <button onClick={applyFilters} className="btn-primary">Rechercher</button>
            <button onClick={resetFilters} className="btn-secondary">Réinitialiser</button>
          </div>
        </div>
      </section>

      <section className="annonces-section">
        <div className="annonces-container">
          <div className="section-header">
            <h2>Annonces récentes</h2>
            {!loading && <p>{annonces.length} annonce(s) trouvée(s)</p>}
          </div>

          {loading && <div className="loading-container"><div className="loading-spinner"></div><p>Chargement...</p></div>}
          {error && <div className="error-container"><p className="error-message">{error}</p></div>}

          {!loading && !error && annonces.length > 0 && (
            <div className="annonces-grid">
              {annonces.map(annonce => (
                <div key={annonce._id} className="annonce-card">
                  <div className="annonce-header"><span className="annonce-category">{annonce.categorie}</span><span className="annonce-type">{annonce.typeBien}</span></div>
                  <div className="annonce-content">
                    <h3 className="annonce-title">{annonce.typeBien} - {annonce.emplacement.ville}</h3>
                    <p className="annonce-location">📍 {annonce.emplacement.adresse}, {annonce.emplacement.ville}</p>
                    <p className="annonce-description">{annonce.description.substring(0, 120)}...</p>
                    <div className="annonce-details"><span className="annonce-price">{formatPrice(annonce.prix)}</span><span className="annonce-state">État: {annonce.etat}</span></div>
                    <div className="annonce-meta"><span className="annonce-date">Publié le {formatDate(annonce.createdAt)}</span><span className="annonce-author">Par {annonce.auteur?.nom || 'Anonyme'}</span></div>
                  </div>
                  <div className="annonce-actions"><Link to={`/annonces/${annonce._id}`} className="btn-view-details">Voir les détails</Link></div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && annonces.length === 0 && (
            <div className="no-results">
              <h3>Aucune annonce trouvée</h3>
              <p>Il n'y a pas d'annonces correspondant à vos critères.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
