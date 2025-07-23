// =================================================================
// FICHIER : backend/utils/sendActivationEmail.js
// =================================================================

// 1. Importer la bibliothèque "nodemailer"
// C'est indispensable pour pouvoir envoyer des e-mails.
const nodemailer = require('nodemailer');

/**
 * Envoie un e-mail d'activation contenant un code.
 * @param {string} email - L'adresse e-mail du destinataire.
 * @param {string} code - Le code d'activation à envoyer.
 * @returns {Promise<object>} - Retourne l'objet d'information de l'e-mail envoyé.
 */
async function sendActivationEmail(email, code) {
  // Affiche un message dans la console pour suivre l'exécution
  console.log(`Début de l'envoi du mail à ${email} avec le code ${code}`);

  // 2. Créer un "transporteur" : c'est l'objet qui envoie l'e-mail.
  // On le configure pour utiliser le service Gmail.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      // IMPORTANT : Ces informations doivent être définies dans votre fichier .env
      // à la racine de votre dossier "backend".
      user: process.env.EMAIL_USER, // Votre adresse e-mail Gmail
      pass: process.env.EMAIL_PASS  // Votre mot de passe d'application Google
    }
  });

  // 3. Définir le contenu de l'e-mail (expéditeur, destinataire, sujet, corps)
  const mailOptions = {
    from: `"Votre Application" <${process.env.EMAIL_USER}>`, // L'expéditeur qui sera affiché
    to: email,                                               // Le destinataire
    subject: 'Activation de votre compte',                   // Le sujet de l'e-mail
    text: `Bonjour, voici votre code d'activation : ${code}`, // Version texte simple
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2>Activation de votre compte</h2>
        <p>Merci de vous être inscrit !</p>
        <p>Veuillez utiliser le code suivant pour activer votre compte :</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${code}
        </p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
      </div>
    ` // Version HTML, plus jolie
  };

  try {
    // 4. Envoyer l'e-mail avec le transporteur et les options définies
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-mail envoyé avec succès. ID du message :', info.messageId);
    return info; // On retourne l'objet d'information en cas de succès

  } catch (err) {
    // 5. En cas d'erreur, l'afficher clairement dans la console
    console.error('❌ Erreur détaillée lors de l\'envoi de l\'e-mail :', err);
    // Et on "relance" l'erreur pour que le code qui a appelé cette fonction
    // sache qu'il y a eu un problème.
    throw err;
  }
}

// 6. Exporter la fonction pour la rendre utilisable dans d'autres fichiers
// C'est la ligne qui corrigeait l'erreur "sendActivationEmail is not a function".
module.exports = sendActivationEmail;
