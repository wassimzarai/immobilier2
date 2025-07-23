// Fichier : backend/middleware/authMiddleware.js
// VERSION ADAPTÉE POUR ÊTRE EXPORTÉE COMME UNE PROPRIÉTÉ 'auth'

const jwt = require('jsonwebtoken');

// On définit la fonction du middleware
const authFunction = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Accès refusé, token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Accès refusé, token malformé.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide.' });
  }
};


// --- DÉBUT DE LA CORRECTION ---
// Au lieu de "module.exports = authFunction;", on exporte un objet
// qui contient notre fonction sous la clé "auth".
module.exports = {
  auth: authFunction
};
// --- FIN DE LA CORRECTION ---
