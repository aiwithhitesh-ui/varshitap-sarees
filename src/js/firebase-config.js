// Firebase Configuration
const firebaseConfig = {
  apiKey: " AIzaSyBiEMNo3RxVqUgwwnE7O5fD9u7Ly5WiVL4 ",
  authDomain: " varshitap-sarees.firebaseapp.com ",
  projectId: " varshitap-sarees ",
  storageBucket: " varshitap-sarees.firebasestorage.app ",
  messagingSenderId: "50436508461",
  appId: "1:50436508461:web:05b959183da1f32adae1a4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseReady = true;
