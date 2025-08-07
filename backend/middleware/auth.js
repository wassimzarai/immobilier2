const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'Accès refusé. Pas de token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Convention : le payload contient { user: { id: ... } }
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token invalide.' });
  }
};
