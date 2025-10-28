// IMPORTAÇÕES CORRIGIDAS
import firebase from "firebase/compat/app";
import "firebase/compat/auth";      // MÓDULO NECESSÁRIO PARA .auth()
import "firebase/compat/firestore"; // MÓDULO NECESSÁRIO PARA .firestore()
import "firebase/compat/database";  // MÓDULO NECESSÁRIO PARA .database()

// Pegue estes valores em: Firebase Console → Project settings → Your apps → SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyBmbHm72PW8j_1lsUYMDAZqtp2ji_h58Fs",
  authDomain: "nivelo-ec446.firebaseapp.com",
  databaseURL: "https://nivelo-ec446-default-rtdb.firebaseio.com",
  projectId: "nivelo-ec446",
  storageBucket: "nivelo-ec446.firebasestorage.app",
  messagingSenderId: "69728230227",
  appId: "1:69728230227:web:d77ca1dec8c17606741fa6",
  measurementId: "G-4PLSS5QKF3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const rtdb = firebase.database();
const db = firebase.firestore(); 

export { firebase, auth, rtdb, db };