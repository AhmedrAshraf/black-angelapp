import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBzgOgR_5oscEehqsjRyM5W6ZRSvxoGmTY",
  authDomain: "blackangel-f7c41.firebaseapp.com",
  databaseURL: "https://blackangel-f7c41.firebaseio.com",
  projectId: "blackangel-f7c41",
  storageBucket: "blackangel-f7c41.appspot.com",
  messagingSenderId: "102407084060",
  appId: "1:102407084060:web:3a1995e9f45b45d04027d9"
};

export const app = firebase.initializeApp(firebaseConfig);
