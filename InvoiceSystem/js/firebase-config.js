// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Your Firebase Config (from techflow-website-2026 project)
const firebaseConfig = {
    apiKey: "AIzaSyAXjjNSClbsrtmMAbB_KuOEX8EnOn5N_0k",
    authDomain: "techflow-website-2026.firebaseapp.com",
    projectId: "techflow-website-2026",
    storageBucket: "techflow-website-2026.firebasestorage.app",
    messagingSenderId: "904705508663",
    appId: "1:904705508663:web:f1847a3d6d86abaa5e46b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };