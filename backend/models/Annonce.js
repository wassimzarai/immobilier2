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
    videos: { type: [String], validate: [v => v.length <= 3, 'Limite de 3 vidéos.'] },
    auteur: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    estPubliee: { type: Boolean, default: true },
    surfaceConstruite: { type: Number },
    annees: { type: String },
    typeSol: { type: String },
    etage: { type: Number },
    orientation: { type: String },
    pieces: { type: Number },
    chambres: { type: Number },
    sallesDeBains: { type: Number },
    caracteristiques: {
      jardin: { type: Boolean, default: false },
      terrasse: { type: Boolean, default: false },
      garage: { type: Boolean, default: false },
      ascenseur: { type: Boolean, default: false },
      vueSurMer: { type: Boolean, default: false },
      vueSurMontagnes: { type: Boolean, default: false },
      piscine: { type: Boolean, default: false },
      concierge: { type: Boolean, default: false },
      chambreRangement: { type: Boolean, default: false },
      meuble: { type: Boolean, default: false }
    },
    facadeExterieure: { type: String },
    interieur: {
      salonEuropeen: { type: Boolean, default: false },
      antenneParabolique: { type: Boolean, default: false },
      cheminee: { type: Boolean, default: false },
      climatisation: { type: Boolean, default: false },
      chauffageCentral: { type: Boolean, default: false },
      securite: { type: Boolean, default: false },
      doubleVitrage: { type: Boolean, default: false },
      porteBlindee: { type: Boolean, default: false }
    },
    optionsSupplementaires: {
      cuisineEquipee: { type: Boolean, default: false },
      refrigerateur: { type: Boolean, default: false },
      four: { type: Boolean, default: false },
      machineALaver: { type: Boolean, default: false },
      microOndes: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Annonce', AnnonceSchema);