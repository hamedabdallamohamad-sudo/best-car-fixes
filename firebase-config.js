// ضع هنا بيانات مشروعك من Firebase (Project settings > Your apps > Web app)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const app=initializeApp({
  apiKey:"YOUR_API_KEY",
  authDomain:"YOUR_PROJECT.firebaseapp.com",
  projectId:"YOUR_PROJECT_ID",
  appId:"YOUR_APP_ID"
});
export const db=getFirestore(app),auth=getAuth(app);

// عنوان الخادم (Java) بعد نشره، مثال: "https://bestcar-backend.onrender.com". اتركه فارغاً لتعطيله.
export const API="";
