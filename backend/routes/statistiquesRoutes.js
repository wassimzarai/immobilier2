const express = require('express');
const router = express.Router();
const Annonce = require('../models/Annonce');
const mongoose = require('mongoose');

/**
 * GET /api/statistiques?userId=...&mois=...&vue=...
 * vue=parJour | parAnnonce (défaut: parAnnonce)
 * mois=YYYY-MM (ex: 2025-08)
 */
router.get('/', async (req, res) => {
  try {
    const { userId, mois, vue = 'parAnnonce' } = req.query;
    if (!userId || !mois) {
      return res.status(400).json({ msg: 'userId et mois sont requis' });
    }
    const debutMois = new Date(`${mois}-01T00:00:00.000Z`);
    const finMois = new Date(debutMois);
    finMois.setMonth(finMois.getMonth() + 1);

    // On suppose que chaque annonce a des champs: vues, contacts, conversions, et createdAt
    // À adapter selon le schéma réel !
    const match = {
      auteur: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: debutMois, $lt: finMois }
    };
    const annonces = await Annonce.find(match);
    let stats = [];
    if (vue === 'parJour') {
      // Regrouper par jour
      const jours = {};
      annonces.forEach(a => {
        const jour = a.createdAt.toISOString().slice(0, 10);
        if (!jours[jour]) jours[jour] = { vues: 0, contacts: 0, conversions: 0, annonces: 0 };
        jours[jour].vues += a.vues || 0;
        jours[jour].contacts += a.contacts || 0;
        jours[jour].conversions += a.conversions || 0;
        jours[jour].annonces += 1;
      });
      stats = Object.entries(jours).map(([date, data]) => ({ date, ...data }));
    } else {
      // Par annonce
      stats = annonces.map(a => ({
        id: a._id,
        titre: a.titre || '',
        vues: a.vues || 0,
        contacts: a.contacts || 0,
        conversions: a.conversions || 0,
        createdAt: a.createdAt
      }));
    }
    res.json(stats);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
