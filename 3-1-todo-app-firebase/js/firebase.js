import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWC4TDpewCT5Ms3A6QE-nYbqxcKpO_HC8",
  authDomain: "todo-app-backend-8d22b.firebaseapp.com",
  databaseURL: "https://todo-app-backend-8d22b-default-rtdb.firebaseio.com",
  projectId: "todo-app-backend-8d22b",
  storageBucket: "todo-app-backend-8d22b.firebasestorage.app",
  messagingSenderId: "765193023227",
  appId: "1:765193023227:web:e600dc823c01d166504a5e",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
