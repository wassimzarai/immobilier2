const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Exemple de route protégée accessible uniquement avec token JWT valide
router.get('/profile', authMiddleware, (req, res) => {
  // req.user contient les infos décodées du token
  res.json({
    msg: 'Accès autorisé à la route protégée',
    user: req.user
  });
});

module.exports = router;
