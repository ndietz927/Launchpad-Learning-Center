import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Replace with your Firebase config
const firebaseConfig = {
   apiKey: "AIzaSyCCotUqgZkDULpRLeyb9lvCma_SYO0CFb0",
  authDomain: "simpleloginapp-a7b53.firebaseapp.com",
  projectId: "simpleloginapp-a7b53",
  storageBucket: "simpleloginapp-a7b53.firebasestorage.app",
  messagingSenderId: "410260892945",
  appId: "1:410260892945:web:5339e6de4dbf5cec2cf0b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Redirect if not logged in
    window.location.href = "index.html";
    return;
  }

  // Show logged-in user email
  document.getElementById("userEmail").textContent = `Logged in as: ${user.email}`;

  // Reference to user's document in Firestore
  const userRef = doc(db, "profiles", user.uid);

  // Load existing profile data
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("name").value = data.name || "";
    document.getElementById("age").value = data.age || "";
    document.getElementById("city").value = data.city || "";
  }

  // Save form data to Firestore
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const city = document.getElementById("city").value;

    await setDoc(userRef, {
      name,
      age,
      city,
      email: user.email,
    });

    alert("Profile saved successfully!");
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
});