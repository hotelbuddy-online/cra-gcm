import firebase from 'firebase';
const config = require('./config/firestore_config.js').default


try {
  firebase.initializeApp(config);
} catch (error) {
  // console.error('error starting firebase:', error)
}

//firestore
const myFirestore = firebase.firestore();

export default firebase;

export const messaging = firebase.messaging();
export const firestore = myFirestore;