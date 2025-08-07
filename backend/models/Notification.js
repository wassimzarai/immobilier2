const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  annonceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Annonce' },
  type: { type: String, enum: ['push', 'email', 'alerte'], required: true },
  message: { type: String, required: true },
  nom: { type: String },
  email: { type: String },
  telephone: { type: String },
  contactMessage: { type: String },
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
