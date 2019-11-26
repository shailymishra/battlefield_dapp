
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-messaging.js');
console.log('firebase messageing js')
// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '574361137651'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


serviceAccount = [
  {
   "email": "shaily.mishra30@gmail.com",
   "scopes": [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email"
    ]
   }
 ],

 admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://battleship-2a6d8.firebaseio.com",
});

defaultAuth = admin.auth();
console.log('Default auth', defaultAuth)
defaultDatabase = admin.database();
console.log('defaultDatabase ', defaultDatabase)

