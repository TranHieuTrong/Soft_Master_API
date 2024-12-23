const admin = require('firebase-admin');

// Khởi tạo Firebase Admin với file serviceAccount
const serviceAccount = require('./softmaster-app-98bb1-firebase-adminsdk-hlrsc-c58681bd8a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://softmaster-app-98bb1-default-rtdb.firebaseio.com/' // Thay thế bằng URL của bạn
});

module.exports = admin;
