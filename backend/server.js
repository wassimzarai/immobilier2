// =================================================================
// FICHIER : backend/server.js
// VERSION CORRIGÉE ET NETTOYÉE
// =================================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- 1. Importer tous les fichiers de routes ---
const authRoutes = require('./routes/auth');
const annonceRoutes = require('./routes/annonceRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

// --- 2. Middlewares ---
// Doit être placé avant la déclaration des routes
app.use(cors());
app.use(express.json());

// --- 3. Routes de l'API ---
// Il est bon d'avoir une route racine pour vérifier que le serveur est en ligne
app.get('/', (req, res) => {
  res.send('Serveur API Immobilier OK');
});

// On déclare chaque route UNE SEULE FOIS
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/regions', locationRoutes); // ✅ Route pour les régions et villes


// --- 4. Démarrage du serveur et connexion à la base de données ---
console.log("Démarrage du serveur...");

// On se connecte à MongoDB (sans les options dépréciées)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès !");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré et à l'écoute sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
    process.exit(1); // Arrête le processus si la connexion à la BDD échoue
  });
