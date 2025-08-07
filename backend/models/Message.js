const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  annonce: { type: mongoose.Schema.Types.ObjectId, ref: 'Annonce', required: true },
  expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
