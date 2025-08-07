const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Config Multer pour upload photo de profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profils'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '_' + Date.now() + ext);
  }
});
const fs = require('fs');
const upload = multer({ storage });

// GET /api/utilisateur/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

const bcrypt = require('bcrypt');
// POST /api/utilisateur/photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Aucun fichier envoyé' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    // Supprimer ancienne photo si existante
    if (user.photo) {
      const oldPath = path.join(__dirname, '../', user.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.photo = 'uploads/profils/' + req.file.filename;
    await user.save();
    res.json({ photo: user.photo });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// PUT /api/utilisateur/me
router.put('/me', auth, async (req, res) => {
  try {
    const { nom, email, motDePasseActuel, nouveauMotDePasse } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    if (nom) user.nom = nom;
    if (email) user.email = email;
    // Gestion du changement de mot de passe (compatibilité password et motDePasse)
    if (nouveauMotDePasse) {
      let hashActuel = user.motDePasse || user.password;
      if (!hashActuel) {
        return res.status(400).json({ msg: "Aucun mot de passe défini pour cet utilisateur." });
      }
      if (!motDePasseActuel || !(await bcrypt.compare(motDePasseActuel, hashActuel))) {
        return res.status(400).json({ msg: 'Mot de passe actuel incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashNouveau = await bcrypt.hash(nouveauMotDePasse, salt);
      user.motDePasse = hashNouveau;
      user.password = hashNouveau; // pour satisfaire le modèle User existant
    }
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// POST /api/utilisateur/photo
router.post('/photo', auth, async (req, res, next) => {
  // Création auto du dossier uploads/profils si absent
  const profilsDir = path.join(__dirname, '../uploads/profils');
  if (!fs.existsSync(profilsDir)) {
    fs.mkdirSync(profilsDir, { recursive: true });
  }
  next();
}, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Aucune photo envoyée' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    user.photoProfil = '/uploads/profils/' + req.file.filename;
    await user.save();
    res.json({ photoProfil: user.photoProfil });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
