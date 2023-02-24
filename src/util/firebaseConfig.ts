import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAi2MuZgZrmRn_23PE-9hUr7DlIwdsRo_U",
  authDomain: "crowdloan-cronjob.firebaseapp.com",
  databaseURL: "https://crowdloan-cronjob-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crowdloan-cronjob",
  storageBucket: "crowdloan-cronjob.appspot.com",
  messagingSenderId: "5290176005",
  appId: "1:5290176005:web:153281c15a270df791f66c"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
