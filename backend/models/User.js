// =================================================================
// FICHIER : backend/models/User.js
// VERSION COMPLÈTE ET CORRIGÉE
// =================================================================

const mongoose = require('mongoose');

// On définit la structure (le "schéma") de nos utilisateurs dans la base de données.
const userSchema = new mongoose.Schema({
  // Le nom de l'utilisateur, de type String.
  nom: {
    type: String,
    required: true // Ce champ est obligatoire.
  },
  
  // L'e-mail de l'utilisateur.
  email: {
    type: String,
    required: true, // Obligatoire.
    unique: true,   // Doit être unique, pas deux utilisateurs avec le même e-mail.
    lowercase: true // Est toujours sauvegardé en minuscules pour éviter les doublons.
  },
  
  // Le mot de passe de l'utilisateur.
  password: {
    type: String,
    required: true // Obligatoire.
  },
  
  // Indique si le compte a été activé par e-mail.
  isActive: {
    type: Boolean,
    default: false // Par défaut, un nouveau compte n'est pas actif.
  },
  
  // Le code envoyé par e-mail pour activer le compte.
  activationCode: {
    type: String
  },

  // --- DÉBUT DE L'AJOUT POUR "MOT DE PASSE OUBLIÉ" ---
  
  // Le code secret temporaire pour réinitialiser le mot de passe.
  resetPasswordToken: {
    type: String
  },
  
  // La date et l'heure auxquelles ce code secret expirera.
  resetPasswordExpires: {
    type: Date
  },

  // Liste des annonces favorites (array d’ObjectId)
  favoris: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Annonce' }],

  // Rôle de l'utilisateur (user ou admin)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  }
  
  // --- FIN DE L'AJOUT ---

}, {
  // Cette option ajoute automatiquement deux champs à chaque document :
  // `createdAt` (la date de création) et `updatedAt` (la date de la dernière modification).
  timestamps: true 
});

// On exporte le modèle pour pouvoir l'utiliser dans d'autres fichiers (comme auth.js).
// Mongoose créera une collection nommée "users" (au pluriel et en minuscules) dans MongoDB.
const bcrypt = require('bcrypt');

// Hash du mot de passe avant sauvegarde (création ou modification)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
