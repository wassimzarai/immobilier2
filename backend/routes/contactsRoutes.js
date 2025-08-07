const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Créer un contact (simulation d'un message envoyé via email)
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
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
