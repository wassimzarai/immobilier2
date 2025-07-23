// Fichier : backend/models/Annonce.js (Version Corrigée)
const mongoose = require('mongoose');

const AnnonceSchema = new mongoose.Schema(
  {
    categorie: { type: String, required: true, enum: ['Vente', 'Location', 'Location vacances'] },
    typeBien: { type: String, required: true, enum: ['Appartements', 'Maisons', 'Villas & maisons de luxe', 'Locaux commerciaux', 'Bureaux', 'Terrains', 'Fermes'] },
    etat: { type: String, required: true, enum: ['Nouveau', 'Bon état', 'À rénover'] },
    emplacement: {
      adresse: { type: String, trim: true },
      region: { type: String, required: true, trim: true },
      ville: { type: String, required: true, trim: true },
      coordonnees: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },
    prix: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    photos: { type: [String], validate: [v => v.length <= 10, 'Limite de 10 photos.'] },
    auteur: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    estPubliee: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Annonce', AnnonceSchema);