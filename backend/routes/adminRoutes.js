const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const { auth } = require('../middleware/authMiddleware');

// Middleware pour vérifier le rôle admin (à adapter selon ton modèle User)
async function isAdmin(req, res, next) {
  // Si le token contient déjà le rôle admin
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  // Sinon, on va chercher l'utilisateur en base pour vérifier
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (user && user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ msg: 'Accès réservé aux administrateurs.' });
  } catch (e) {
    return res.status(403).json({ msg: 'Accès réservé aux administrateurs.' });
  }
}

// =============================
// GESTION UTILISATEURS (CRUD)
// =============================

// Lister tous les utilisateurs
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -motDePasse');
    res.json(users);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Créer un utilisateur (admin)
router.post('/users', auth, isAdmin, async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ msg: 'Champs requis manquants.' });
    }
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: 'Email déjà utilisé.' });
    const user = new User({ nom, email, password, role: role || 'user', isActive: true });
    await user.save();
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Supprimer un utilisateur
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    res.json({ msg: 'Utilisateur supprimé.' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// =============================
// STATISTIQUES ANNONCES
// =============================

// Statistiques par type de bien
router.get('/stats/by-type', auth, isAdmin, async (req, res) => {
  try {
    const stats = await Annonce.aggregate([
      { $group: { _id: '$typeBien', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Statistiques par date de publication (par mois)
router.get('/stats/by-month', auth, isAdmin, async (req, res) => {
  try {
    const stats = await Annonce.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Statistiques par catégorie (Vente, Location...)
router.get('/stats/by-categorie', auth, isAdmin, async (req, res) => {
  try {
    const stats = await Annonce.aggregate([
      { $group: { _id: '$categorie', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
