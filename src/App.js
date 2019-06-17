import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { messaging } from './firebase';
import publicKey from './config/public_key';

export class App extends Component {
  constructor(props) {
    super(props);
    this.tokenDivId = React.createRef();
    this.permissionDivId = React.createRef();
    this.messagesDiv = React.createRef();
  }

  state = {
    token: null,
    showPermissionDiv: null,
    showTokenDiv: null,
    messages: []
  }

  componentWillMount() {

    console.log('will mount')
    // Add the public key generated from the console here.
    try {
      messaging.usePublicVapidKey(publicKey.publicKey);
    } catch (error) {

    }
    // [END set_public_vapid_key]
    var self = this;
    // [START refresh_token]
    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function () {
      messaging.getToken().then(function (refreshedToken) {
        console.log('Token refreshed.');
        // Indicate that the new Instance ID token has not yet been sent to the
        // app server.
        setTokenSentToServer(false);
        // Send Instance ID token to app server.
        sendTokenToServer(refreshedToken);
        // [START_EXCLUDE]
        // Display new Instance ID token and clear UI of all previous messages.
        self.resetUI();
        // [END_EXCLUDE]
      }).catch(function (err) {
        console.log('Unable to retrieve refreshed token ', err);
        self.setState({
          token: 'Unable to retrieve refreshed token '
        });
      });
    });
    // [END refresh_token]

    // [START receive_message]
    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage(function (payload) {
      console.log('Message received. ', payload);
      // [START_EXCLUDE]
      // Update the UI to include the received message.
      self.setState({
        messages: self.state.messages.push(payload)
      })
      // [END_EXCLUDE]
    });
    // [END receive_message]

    this.resetUI()
  }

  // Clear the messages element of all children.
  clearMessages = () => {
    console.log(this.messagesDiv)
    if (this.messagesDiv.current)
      while (this.messagesDiv.hasChildNodes()) {
        this.messagesDiv.removeChild(this.messagesDiv.lastChild);
      }
  }

  resetUI = () => {
    this.setState({
      messages: [],
      token: 'loading...'
    });
    var self = this;
    // [START get_token]
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken().then(function (currentToken) {
      if (currentToken) {
        sendTokenToServer(currentToken);
        self.updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        self.updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    }).catch(function (err) {
      console.log('An error occurred while retrieving token. ', err);
      self.setState({
        token: 'Error retrieving Instance ID token. '
      });
      setTokenSentToServer(false);
    });
    // [END get_token]
  }

  deleteToken = () => {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then(function (currentToken) {
      messaging.deleteToken(currentToken).then(function () {
        console.log('Token deleted.');
        setTokenSentToServer(false);
        // [START_EXCLUDE]
        // Once token is deleted update UI.
        this.resetUI();
        // [END_EXCLUDE]
      }).catch(function (err) {
        console.log('Unable to delete token. ', err);
      });
      // [END delete_token]
    }).catch(function (err) {
      console.log('Error retrieving Instance ID token. ', err);
      this.setState({
        token: 'Error retrieving Instance ID token. '
      });
    });
  }

  updateUIForPushEnabled = (currentToken) => {
    this.setState({
      showTokenDiv: true,
      showPermissionDiv: false,
      token: currentToken
    });
  }

  requestPermission = () => {
    console.log('Requesting permission...');
    // [START request_permission]
    messaging.requestPermission().then(function () {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve an Instance ID token for use with FCM.
      // [START_EXCLUDE]
      // In many cases once an app has been granted notification permission, it
      // should update its UI reflecting this.
      this.resetUI();
      // [END_EXCLUDE]
    }).catch(function (err) {
      console.log('Unable to get permission to notify.', err);
    });
    // [END request_permission]
  }

  updateUIForPushPermissionRequired = () => {
    this.setState({
      showTokenDiv: false,
      showPermissionDiv: true
    });
  }

  render() {
    const { token, showTokenDiv, showPermissionDiv, messages } = this.state;

    return (
      <div className="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-header">

        {/* Header section containing title */}
        <header className="mdl-layout__header mdl-color-text--white mdl-color--light-blue-700">
          <div className="mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-grid">
            <div className="mdl-layout__header-row mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--8-col-desktop">
              <h3>Firebase Cloud Messaging</h3>
            </div>
          </div>
        </header>

        <main className="mdl-layout__content mdl-color--grey-100">
          <div className="mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-grid">

            {/* Container for the Table of content */}
            <div
              className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
              <div className="mdl-card__supporting-text mdl-color-text--grey-600">
                {/* div to display the generated Instance ID token */}
                {showTokenDiv ?
                  <div>
                    <h4>Instance ID Token</h4>
                    <p id="token" style={{ wordBreak: 'break-all' }}>{token}</p>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                      onClick={this.deleteToken}>Delete
                Token</button>
                    <br />
                    {/* <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={sayHi}>say
                Hi</button> */}
                  </div>
                  : []}
                {/* div to display the UI to allow the request for permission to
               notify the user. This is shown if the app has not yet been
               granted permission to notify. */}
                {showPermissionDiv ?
                  <div>
                    <h4>Needs Permission</h4>
                    <p id="token"></p>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                      onClick={this.requestPermission}>Request Permission</button>
                  </div>
                  : []}
                {/* div to display messages received by this app. */}
                <div id="messages" >
                  {messages.map((item, index) => <div key={index}>
                    <h5>Received message:</h5>
                    <pre style={{ overflowX: 'hidden' }}>{JSON.stringify(item, null, 2)}</pre>
                  </div>)}
                </div>
              </div>
            </div>

          </div>
        </main >
      </div >
    );
  }
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...');
    // TODO(developer): Send the current token to your server.
    setTokenSentToServer(true);
  } else {
    console.log('Token already sent to server so won\'t send it again ' +
      'unless it changes');
  }

}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

// function sayHi() {
//   console.log('hi')
// }


export default App;
