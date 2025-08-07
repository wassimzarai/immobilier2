const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  typeTransaction: { type: String, enum: ['Vente', 'Location', 'Location vacances'], required: true },
  typeBien: { type: String, required: true },
  region: { type: String },
  ville: { type: String },
  prixMin: { type: Number },
  prixMax: { type: Number },
  surfaceMin: { type: Number },
  surfaceMax: { type: Number },
  chambresMin: { type: Number },
  caracteristiques: { type: [String] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alerte', alerteSchema);
