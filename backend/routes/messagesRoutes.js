const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Annonce = require('../models/Annonce');
const auth = require('../middleware/auth');

// GET /api/messages?userId=... : récupère les messages reçus pour les annonces de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ msg: 'userId requis' });
    }
    // Récupère les annonces dont l'utilisateur est l'auteur
    const annonces = await Annonce.find({ auteur: userId }).select('_id');
    const annonceIds = annonces.map(a => a._id);
    // Cherche tous les messages liés à ces annonces
    const messages = await Message.find({ annonce: { $in: annonceIds } })
      .populate('expediteur', 'nom email')
      .populate('annonce', 'titre');
    res.json(messages);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
