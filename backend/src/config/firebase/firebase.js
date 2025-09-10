// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('../../chat-real-time.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;