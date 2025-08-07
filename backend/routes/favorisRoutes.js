const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const auth = require('../middleware/auth');

// GET /api/favoris : liste complète des annonces favorites de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favoris',
      populate: { path: 'auteur', select: 'nom email' }
    });
    res.json(user.favoris || []);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// POST /api/favoris/:annonceId : ajouter une annonce aux favoris et retourner la liste complète à jour
router.post('/:annonceId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const annonceId = req.params.annonceId;
    if (!user.favoris.includes(annonceId)) {
      user.favoris.push(annonceId);
      await user.save();
    }
    // Retourner la liste complète des annonces favoris (populée)
    const userPop = await User.findById(req.user.id).populate({
      path: 'favoris',
      populate: { path: 'auteur', select: 'nom email' }
    });
    res.json(userPop.favoris || []);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// DELETE /api/favoris/:annonceId : retirer une annonce des favoris et retourner la liste complète à jour
router.delete('/:annonceId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favoris = user.favoris.filter(fav => fav.toString() !== req.params.annonceId);
    await user.save();
    // Retourner la liste complète des annonces favoris (populée)
    const userPop = await User.findById(req.user.id).populate({
      path: 'favoris',
      populate: { path: 'auteur', select: 'nom email' }
    });
    res.json(userPop.favoris || []);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
