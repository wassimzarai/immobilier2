// =================================================================
// FICHIER : backend/routes/annonceRoutes.js
// VERSION FINALE, SYNCHRONISÉE AVEC auth.js
// =================================================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Annonce = require('../models/Annonce');
const NodeGeocoder = require('node-geocoder');
const multer = require('multer');
const path = require('path');

// Multer config pour photos et vidéos
const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(__dirname, '../uploads/photos');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(__dirname, '../uploads/videos');
    } else {
      uploadPath = path.join(__dirname, '../uploads');
    }
    // Crée le dossier si besoin
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accepte images et vidéos courantes
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 * 1024, files: 13 } // 1 Go par fichier, 13 fichiers max
});

// --- Middleware d'authentification (ADAPTÉ POUR LIRE LE TOKEN IMBRIQUÉ) ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // --- CORRECTION ---
    // Le gardien cherche maintenant la section "user" et vérifie qu'elle contient un "id".
    if (!decoded.user || !decoded.user.id) {
      // S'il ne trouve pas cette structure, il renvoie l'erreur.
      return res.status(401).json({ msg: 'Token invalide - informations utilisateur manquantes' });
    }
    
    // Il extrait la section "user" et la met dans req.user.
    req.user = decoded.user;
    // --- FIN DE LA CORRECTION ---
    
    next(); // Il vous laisse passer.
  } catch (err) {
    res.status(401).json({ msg: 'Token non valide' });
  }
};

// --- Le reste du fichier est INCHANGÉ ---

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null
} );

const regionsData = {
  'Tunis': { lat: 36.8065, lon: 10.1815, villes: ['Tunis', 'La Marsa', 'Sidi Bou Said', 'Carthage', 'Le Bardo', 'Ariana', 'Ettadhamen'] },
  'Sfax': { lat: 34.7406, lon: 10.7603, villes: ['Sfax Ville', 'Sakiet Ezzit', 'Sakiet Eddaier', 'Thyna', 'Mahres'] },
  'Sousse': { lat: 35.8256, lon: 10.6369, villes: ['Sousse', 'Hammam Sousse', 'Port El Kantaoui', 'Kalaa Kebira', 'Msaken'] },
  'Monastir': { lat: 35.7643, lon: 10.8113, villes: ['Monastir', 'Ksar Hellal', 'Moknine', 'Jemmal', 'Sahline'] },
  'Nabeul': { lat: 36.4561, lon: 10.7376, villes: ['Nabeul', 'Hammamet', 'Kelibia', 'Korba', 'Menzel Temime'] },
  'Bizerte': { lat: 37.2744, lon: 9.8739, villes: ['Bizerte', 'Menzel Bourguiba', 'Mateur', 'Sejnane', 'Utique'] },
  'Gabès': { lat: 33.8815, lon: 10.0982, villes: ['Gabès', 'Mareth', 'El Hamma', 'Matmata', 'Nouvelle Matmata'] },
  'Kairouan': { lat: 35.6781, lon: 10.0963, villes: ['Kairouan', 'Sbikha', 'Oueslatia', 'Haffouz', 'Alaa'] },
  'Gafsa': { lat: 34.425, lon: 8.7842, villes: ['Gafsa', 'Metlaoui', 'Redeyef', 'Moulares', 'Sened'] },
  'Médenine': { lat: 33.3548, lon: 10.5055, villes: ['Médenine', 'Zarzis', 'Djerba Houmt Souk', 'Ben Gardane', 'Tataouine'] }
};

// --- ROUTES PUBLIQUES ---
router.get('/regions', (req, res) => { try { res.json(Object.keys(regionsData)); } catch (e) { res.sendStatus(500); } });
router.get('/regions/:region/villes', (req, res) => { try { const d = regionsData[req.params.region]; d ? res.json(d.villes) : res.sendStatus(404); } catch (e) { res.sendStatus(500); } });
router.get('/regions/:region/details', (req, res) => { try { const d = regionsData[req.params.region]; d ? res.json({ lat: d.lat, lon: d.lon }) : res.sendStatus(404); } catch (e) { res.sendStatus(500); } });
// --- FILTRE PRIX MIN/MAX ---
router.get('/', async (req, res) => {
  try {
    const { prixMin, prixMax, categorie, typeBien, ...autres } = req.query;
    let filtre = { estPubliee: true };
    if (prixMin) filtre.prix = { ...filtre.prix, $gte: Number(prixMin) };
    if (prixMax) filtre.prix = { ...filtre.prix, $lte: Number(prixMax) };
    if (categorie) filtre.categorie = categorie;
    if (typeBien) filtre.typeBien = typeBien;
    // On peut ajouter d'autres filtres ici (ville, etc.)
    const annonces = await Annonce.find(filtre).populate('auteur', 'nom').sort({ createdAt: -1 });
    res.json(annonces);
  } catch (e) {
    res.sendStatus(500);
  }
});
router.get('/:id', async (req, res) => { try { const annonce = await Annonce.findById(req.params.id).populate('auteur', 'nom email'); if (!annonce) return res.sendStatus(404); res.json(annonce); } catch (e) { res.sendStatus(500); } });

// --- ROUTES PROTÉGÉES ---
router.post('/', auth, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ msg: 'Action non autorisée' });
    // On récupère les chemins des fichiers uploadés
    let photos = [];
    let videos = [];
    if (req.files && req.files['photos']) {
      photos = req.files['photos'].map(f => '/uploads/photos/' + f.filename);
    }
    if (req.files && req.files['videos']) {
      videos = req.files['videos'].map(f => '/uploads/videos/' + f.filename);
    }
    // On fusionne avec req.body (qui peut contenir d'autres champs)
    // Correction : parser emplacement si c'est un string JSON (cas FormData)
    let emplacement = req.body.emplacement;
    if (typeof emplacement === 'string') {
      try {
        emplacement = JSON.parse(emplacement);
      } catch (e) {
        emplacement = {};
      }
    }
    // Si region/ville sont à plat, on les injecte dans l'objet
    if (req.body.region) emplacement.region = req.body.region;
    if (req.body.ville) emplacement.ville = req.body.ville;
    const annonceData = {
      ...req.body,
      emplacement,
      auteur: req.user.id,
      photos,
      videos
    };
    const annonce = new Annonce(annonceData);
    await annonce.save();
    res.status(201).json(annonce);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.sendStatus(404);
    if (annonce.auteur.toString() !== req.user.id) return res.status(401).json({ msg: 'Action non autorisée' });
    const updatedAnnonce = await Annonce.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAnnonce);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.sendStatus(404);
    if (annonce.auteur.toString() !== req.user.id) return res.status(401).json({ msg: 'Action non autorisée' });
    await Annonce.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Annonce supprimée' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
