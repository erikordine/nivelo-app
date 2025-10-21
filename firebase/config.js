import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Isso carrega o Firestore na API compat (para nao aparecer o erro de undefined)
import 'firebase/compat/firestore';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);

  // 👇 evita erros de transporte no RN/Expo
  try {
    firebase.firestore().settings({ experimentalAutoDetectLongPolling: true });
  } catch {
    // fallback p/ SDKs mais antigos
    firebase.firestore().settings({
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  }

  // persistência do Auth no RN
  initializeAuth(firebase.app(), {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { firebase };
export const auth = () => firebase.auth();
export const db = firebase.firestore();