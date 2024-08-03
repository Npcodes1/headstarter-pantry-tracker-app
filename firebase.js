// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtLIGupgoBXfHahTjqtbSP-GEJrq0s5bk",
  authDomain: "pantry-inventory-tracker.firebaseapp.com",
  projectId: "pantry-inventory-tracker",
  storageBucket: "pantry-inventory-tracker.appspot.com",
  messagingSenderId: "566618711423",
  appId: "1:566618711423:web:07e01a9eebfa3c6160e64a",
  measurementId: "G-52CFJLX87B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };
