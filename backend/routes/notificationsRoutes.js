const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

/**
 * GET /api/notifications?userId=...
 * Récupérer les notifications envoyées pour les annonces d’un utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ msg: 'userId requis' });
    // Recherche toutes les notifications pour ce userId, triées de la plus récente à la plus ancienne
    const notifications = await Notification.find({ userId }).sort({ sentAt: -1 });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
