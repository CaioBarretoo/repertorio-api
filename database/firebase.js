const admin = require('firebase-admin');

// Carregar credenciais do ambiente
const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials),
});

const db = admin.firestore();
module.exports = db;
