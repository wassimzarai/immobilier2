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

// === Socket.IO pour notifications temps réel ===
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 🔒 À restreindre pour la prod
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
  }
});

// Pour usage dans d'autres modules
module.exports.io = io;

// Gestion des connexions clients
io.on('connection', (socket) => {
  console.log('🟢 Un client connecté à Socket.IO :', socket.id);

  // Le frontend doit envoyer son userId après connexion
  socket.on('register_user', (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`👤 Socket ${socket.id} rejoint la room userId=${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté de Socket.IO :', socket.id);
  });
});

// --- 3. Middlewares globaux ---
// ✅ Configuration CORS recommandée
app.use(cors({
  origin: '*', // 🔒 À adapter plus tard pour spécifier ton frontend (ex: http://localhost:3000)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'authorization'],
}));

app.use(express.json());

// ✅ --- 4. Servir les fichiers statiques (images / vidéos) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. Routes API ---
app.get('/', (req, res) => {
  res.send('✅ Serveur API Immobilier opérationnel');
});

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes); // 🛡️ Routes admin dashboard

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
    server.listen(PORT, () => {
      console.log(`🚀 Serveur (Socket.IO) démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
