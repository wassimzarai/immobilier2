// =================================================================
// FICHIER : backend/routes/auth.js
// VERSION FINALE, ADAPTÉE ET COMMENTÉE
// =================================================================

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendActivationEmail = require('../utils/sendActivationEmail');

const router = express.Router();

// --- ROUTE 1 : Inscription d'un nouvel utilisateur ---
router.post('/register', async (req, res) => {
  console.log('-> Requête reçue sur POST /api/auth/register');
  try {
    const { nom, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Erreur : Les mots de passe ne correspondent pas." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Erreur : Cet e-mail est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    console.log(`Code d'activation généré pour ${email} : ${activationCode}`);

    const newUser = new User({
      nom,
      email,
      password: hashedPassword,
      activationCode,
      isActive: false
    });
    await newUser.save();

    await sendActivationEmail(email, `Votre code d'activation est : ${activationCode}`);
    console.log(`E-mail d'activation envoyé (ou tentative) à ${email}`);

    res.status(201).json({ msg: "Compte créé avec succès. Veuillez vérifier votre boîte mail pour activer votre compte." });

  } catch (error) {
    console.error("Erreur critique sur la route /register :", error);
    res.status(500).json({ msg: "Erreur serveur lors de l'inscription." });
  }
});

// --- ROUTE 2 : Activation du compte ---
router.post('/activate', async (req, res) => {
  console.log('-> Requête reçue sur POST /api/auth/activate');
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email, activationCode: code });
    if (!user) {
      return res.status(400).json({ msg: "Code d'activation ou e-mail invalide." });
    }

    user.isActive = true;
    user.activationCode = undefined; // On nettoie le code après utilisation
    await user.save();

    res.status(200).json({ msg: "Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter." });

  } catch (error) {
    console.error("Erreur critique sur la route /activate :", error);
    res.status(500).json({ msg: "Erreur du serveur lors de l'activation du compte." });
  }
});

// --- ROUTE 3 : Connexion d'un utilisateur ---
router.post('/login', async (req, res) => {
  console.log('-> Requête reçue sur POST /api/auth/login');
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: "Identifiants incorrects." });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: "Votre compte n'est pas encore activé." });
    }

    const userRole = (user.email === process.env.ADMIN_EMAIL) ? 'admin' : 'user';

    // On crée le payload avec la structure { user: { ... } } que le reste de l'appli attend.
    const payload = {
      user: {
        id: user._id,
        nom: user.nom,
        role: userRole
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`Token créé pour ${user.email} avec le rôle ${userRole}.`);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: userRole
      }
    });

  } catch (error) {
    console.error("Erreur critique sur la route /login :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la connexion." });
  }
});

// --- ROUTE 4 : Demander une réinitialisation de mot de passe ---
router.post('/forgot-password', async (req, res) => {
  console.log('-> Requête reçue sur POST /api/auth/forgot-password');
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Pour la sécurité, on ne révèle jamais si l'email existe ou non.
      return res.status(200).json({ msg: 'Si un compte avec cet e-mail existe, un code a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Le code expire dans 1 heure
    await user.save();

    await sendActivationEmail(user.email, `Votre code de réinitialisation est : ${resetToken}`);
    console.log(`E-mail de réinitialisation envoyé (ou tentative) à ${user.email}`);

    res.status(200).json({ msg: 'Si un compte avec cet e-mail existe, un code a été envoyé.' });

  } catch (error) {
    console.error("Erreur sur /forgot-password:", error);
    res.status(500).json({ msg: 'Erreur du serveur.' });
  }
});

// --- ROUTE 5 : Réinitialiser le mot de passe avec le code ---
router.post('/reset-password', async (req, res) => {
  console.log('-> Requête reçue sur POST /api/auth/reset-password');
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Vérifie que le code n'a pas expiré
    });

    if (!user) {
      return res.status(400).json({ msg: 'Le code est invalide ou a expiré.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Votre mot de passe a été réinitialisé avec succès.' });

  } catch (error) {
    console.error("Erreur sur /reset-password:", error);
    res.status(500).json({ msg: 'Erreur du serveur.' });
  }
});

module.exports = router;
