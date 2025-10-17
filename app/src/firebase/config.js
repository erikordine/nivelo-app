// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmbHm72PW8j_1lsUYMDAZqtp2ji_h58Fs",
  authDomain: "nivelo-ec446.firebaseapp.com",
  databaseURL: "https://nivelo-ec446-default-rtdb.firebaseio.com",
  projectId: "nivelo-ec446",
  storageBucket: "nivelo-ec446.firebasestorage.app",
  messagingSenderId: "69728230227",
  appId: "1:69728230227:web:d77ca1dec8c17606741fa6",
  measurementId: "G-4PLSS5QKF3",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
export { firebase };

export default firebase;
