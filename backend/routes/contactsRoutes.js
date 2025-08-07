const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Créer un contact (et une notification pour le propriétaire de l'annonce)
router.post('/', async (req, res) => {
  try {
    const Annonce = require('../models/Annonce');
    const Notification = require('../models/Notification');
    const annonce = await Annonce.findById(req.body.annonceId);
    if (!annonce) return res.status(404).json({ msg: "Annonce non trouvée" });
    const contact = new Contact({
      ...req.body,
      userId: annonce.auteur
    });
    await contact.save();
    if (annonce && annonce.auteur) {
      // Créer une notification pour le propriétaire
      const notif = new Notification({
        userId: annonce.auteur,
        annonceId: annonce._id,
        type: 'alerte',
        message: `Vous avez reçu une nouvelle demande de contact pour votre annonce (${annonce.typeBien} à ${annonce.emplacement.ville}).`,
        nom: contact.nom,
        email: contact.email,
        telephone: contact.telephone,
        contactMessage: contact.message
      });
      await notif.save();
    }
    res.status(201).json(contact);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Récupérer les contacts reçus par un utilisateur (propriétaire)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ msg: 'userId requis' });
    const contacts = await Contact.find({ userId }).sort({ date: -1 });
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
