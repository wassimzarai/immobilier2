// =================================================================
// FICHIER : backend/server.js
// VERSION FINALE, PROPRE ET FONCTIONNELLE
// =================================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // ✅ Déclaré une seule fois ici
require('dotenv').config();

// --- 1. Importer les routes ---
const authRoutes = require('./routes/auth');
const annonceRoutes = require('./routes/annonceRoutes');
const locationRoutes = require('./routes/locationRoutes');

// --- 2. Initialisation de l'application ---
const app = express();

// --- 3. Middlewares globaux ---
app.use(cors());
app.use(express.json());

// ✅ --- 4. Servir les fichiers statiques (images / vidéos) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. Routes API ---
app.get('/', (req, res) => {
  res.send('✅ Serveur API Immobilier opérationnel');
});

app.use('/api/auth', authRoutes);          // Authentification
app.use('/api/annonces', annonceRoutes);   // Annonces
app.use('/api/regions', locationRoutes);   // Régions et villes

// --- 6. Connexion MongoDB et lancement serveur ---
console.log("Démarrage du serveur...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès !");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré et à l'écoute sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
