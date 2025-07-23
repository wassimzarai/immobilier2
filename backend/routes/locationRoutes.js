// =================================================================
// FICHIER : backend/routes/locationRoutes.js
// VERSION CORRIGÉE
// =================================================================
const express = require('express');
const router = express.Router();
const locations = require('../data/locations');

// --- DÉBUT DE LA CORRECTION ---
// Route pour obtenir la liste de toutes les régions
// On change '/regions' par '/' car le préfixe '/api/regions' est déjà défini dans server.js
router.get('/', (req, res) => {
  try {
    const regionNames = Object.keys(locations);
    res.json(regionNames);
  } catch (err) {
    console.error("Erreur lors de la récupération des régions :", err);
    res.status(500).send("Erreur serveur");
  }
});
// --- FIN DE LA CORRECTION ---

// Route pour obtenir les villes d'une région spécifique
// Cette route devient : GET /api/regions/villes/Tunis
router.get('/villes/:region', (req, res) => {
  const region = locations[req.params.region];
  if (region) {
    res.json(region.villes);
  } else {
    res.status(404).json({ msg: 'Région non trouvée' });
  }
});

// Route pour obtenir les détails (lat/lon) d'une région
// Cette route devient : GET /api/regions/details/Tunis
// ATTENTION : Il y a un conflit ici avec la route suivante. Je la corrige.
router.get('/details/:nom', (req, res) => { // Changement de '/regions/:nom' à '/details/:nom'
  const regionData = locations[req.params.nom];
  if (regionData) {
    res.json({ lat: regionData.lat, lon: regionData.lon });
  } else {
    res.status(404).json({ msg: 'Région non trouvée' });
  }
});

module.exports = router;
