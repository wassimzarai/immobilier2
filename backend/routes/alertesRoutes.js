const express = require('express');
const router = express.Router();
const Alerte = require('../models/Alerte');

// Créer une alerte
router.post('/', async (req, res) => {
  try {
    const alerte = new Alerte(req.body);
    await alerte.save();
    res.status(201).json(alerte);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Récupérer les alertes d'un utilisateur
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ msg: 'userId requis' });
    const alertes = await Alerte.find({ userId }).sort({ createdAt: -1 });
    res.json(alertes);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
