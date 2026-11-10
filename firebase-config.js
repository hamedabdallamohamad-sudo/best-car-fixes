import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyDG0aSSEBd0YQG5xh1vTuXZVui19IBCG_A",
  authDomain: "best-car-fixes-6c38d.firebaseapp.com",
  projectId: "best-car-fixes-6c38d",
  storageBucket: "best-car-fixes-6c38d.firebasestorage.app",
  messagingSenderId: "589839015491",
  appId: "1:589839015491:web:30d3979d2ced3b1c5f3ef6"
});

export const db = getFirestore(app), auth = getAuth(app);