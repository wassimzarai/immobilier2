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
  const [search, setSearch] = useState('');

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
    if (search.trim() !== '') {
      activeFilters.search = search.trim();
    }
    // Correction : envoyer prixMin/prixMax comme nombres si présents
    if (activeFilters.prixMin) activeFilters.prixMin = Number(activeFilters.prixMin);
    if (activeFilters.prixMax) activeFilters.prixMax = Number(activeFilters.prixMax);
    loadAnnonces(activeFilters);
  };



  const formatPrice = (price) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="home-hero-bg">
        <div className="home-hero">
          <h1 className="home-title">Aqarino</h1>
          <div className="home-slogan-ar">عقارك في متناولك</div>
          <div className="home-slogan-fr">Votre bien, à portée de clic</div>
          <div className="home-search-card">
            <div className="home-search-top">
              <button
                className={`search-type-btn${filters.categorie === 'Vente' ? ' active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, categorie: 'Vente' }))}
                type="button"
              >
                <span style={{marginRight: 6}}>🏠</span>Acheter
              </button>
              <button
                className={`search-type-btn${filters.categorie === 'Location' ? ' active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, categorie: 'Location' }))}
                type="button"
              >
                Louer
              </button>
            </div>
            <div className="home-search-fields">
              <input
                type="text"
                name="search"
                placeholder="Ville, quartier, adresse..."
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                name="typeBien"
                value={filters.typeBien}
                onChange={handleFilterChange}
                className="search-select"
              >
                <option value="">Type de bien</option>
                {typeBienOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select
                name="budget"
                value={filters.budget || ''}
                onChange={e => setFilters(f => ({ ...f, budget: e.target.value }))}
                className="search-select"
              >
                <option value="">Budget</option>
                <option value="50000">≤ 50 000 DT</option>
                <option value="100000">≤ 100 000 DT</option>
                <option value="200000">≤ 200 000 DT</option>
                <option value="500000">≤ 500 000 DT</option>
                <option value="1000000">≤ 1 000 000 DT</option>
              </select>
              <button className="search-btn-yellow" onClick={applyFilters} type="button">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section biens en vedette, directement sous le hero */}
      <section className="featured-properties-section">
        <div className="featured-header">
          <h2 className="featured-title">Biens en vedette</h2>
          <p className="featured-subtitle">Découvrez notre sélection de biens immobiliers exceptionnels en Tunisie</p>
        </div>
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

      {/* Section Nos services */}
      <section className="services-section">
        <h2 className="services-title">Nos services</h2>
        <p className="services-subtitle">Une plateforme complète pour tous vos besoins immobiliers en Tunisie</p>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🔍</div>
            <h3>Recherche avancée</h3>
            <p>Trouvez le bien parfait grâce à nos filtres intelligents et notre géolocalisation précise.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🔒</div>
            <h3>Achat sécurisé</h3>
            <p>Processus d'achat transparent avec vérification des documents et accompagnement juridique.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🔑</div>
            <h3>Location simplifiée</h3>
            <p>Louez en toute confiance avec nos contrats vérifiés et notre service de médiation.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🆓</div>
            <h3>Publication gratuite</h3>
            <p>Publiez vos annonces gratuitement avec photos illimitées et visibilité maximale.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">💎</div>
            <h3>Garantie qualité</h3>
            <p>Tous nos biens sont vérifiés et nos partenaires agences sont certifiés.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🕑</div>
            <h3>Support 24/7</h3>
            <p>Notre équipe vous accompagne à chaque étape de votre projet immobilier.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <div className="footer-stat-icon">🏠</div>
            <div className="footer-stat-value">15,000+</div>
            <div className="footer-stat-label">Biens disponibles</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-icon">👤</div>
            <div className="footer-stat-value">50,000+</div>
            <div className="footer-stat-label">Utilisateurs actifs</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-icon">📈</div>
            <div className="footer-stat-value">2,500+</div>
            <div className="footer-stat-label">Ventes réalisées</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-icon">🔑</div>
            <div className="footer-stat-value">98%</div>
            <div className="footer-stat-label">Satisfaction client</div>
          </div>
        </div>
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">Aqarino</div>
            <div className="footer-desc">La plateforme immobilière de référence en Tunisie. Votre bien, à portée de clic.</div>
          </div>
          <div className="footer-links">
            <div>
              <h4>Navigation</h4>
              <ul>
                <li><a href="/">Acheter</a></li>
                <li><a href="/">Louer</a></li>
                <li><a href="/">Publier une annonce</a></li>
                <li><a href="/">Agence partenaire</a></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><a href="/">Centre d'aide</a></li>
                <li><a href="/">Conditions d'utilisation</a></li>
                <li><a href="/">Politique de confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>+216 70 123 456</li>
                <li>contact@aqarino.tn</li>
                <li>Avenue Habib Bourguiba, 1000 Tunis, Tunisie</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2024 Aqarino. Tous droits réservés. | Développé avec &hearts; en Tunisie
        </div>
      </footer>
    </>
  );
};

export default Home;
