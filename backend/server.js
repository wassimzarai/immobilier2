// =================================================================
// FICHIER : backend/server.js
// VERSION FINALE, PROPRE ET FONCTIONNELLE AVEC CORS CONFIGURÉ
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
const statistiquesRoutes = require('./routes/statistiquesRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const alertesRoutes = require('./routes/alertesRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const favorisRoutes = require('./routes/favorisRoutes'); // ✅ Ajouté ici

// --- 2. Initialisation de l'application ---
const app = express();

// --- 3. Middlewares globaux ---
// ✅ Configuration CORS recommandée
app.use(cors({
  origin: '*', // 🔒 À adapter plus tard pour spécifier ton frontend (ex: http://localhost:3000)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
}));

app.use(express.json());

// ✅ --- 4. Servir les fichiers statiques (images / vidéos) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. Routes API ---
app.get('/', (req, res) => {
  res.send('✅ Serveur API Immobilier opérationnel');
});

app.use('/api/auth', authRoutes);               // Authentification
app.use('/api/annonces', annonceRoutes);        // Annonces
app.use('/api/regions', locationRoutes);        // Régions et villes
app.use('/api/statistiques', statistiquesRoutes); // Statistiques
app.use('/api/notifications', notificationsRoutes); // Notifications
app.use('/api/alertes', alertesRoutes);         // Alertes
app.use('/api/contacts', contactsRoutes);       // Contacts
app.use('/api/messages', messagesRoutes);       // Messages
app.use('/api/utilisateur', utilisateurRoutes); // Utilisateur
app.use('/api/favoris', favorisRoutes);         // Favoris

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
