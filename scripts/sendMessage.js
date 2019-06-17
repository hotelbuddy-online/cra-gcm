var admin = require("firebase-admin");

var serviceAccount = require("../messaging-test-secrets.json");
var config = require('../token.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://messaging-test-b6f38.firebaseio.com"
});


// See documentation on defining a message payload.
var message = {
    notification: {
        title: '$GOOG up 1.43% on the day',
        body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
    },
    // data: {
    //     score: 'wewe',
    //     time: 'qfwfssssssf:45'
    // },
    token: config.token
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });