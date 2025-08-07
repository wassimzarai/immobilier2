const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // propriétaire de l'annonce
  annonceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Annonce', required: true },
  nom: { type: String, required: true },
  email: { type: String, required: true },
  pays: { type: String },
  telephone: { type: String },
  message: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
