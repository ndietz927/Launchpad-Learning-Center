// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase config
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
const provider = new GoogleAuthProvider();

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const roleSelect = document.getElementById("role");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");
  const googleBtn = document.getElementById("google-login");

  // Register new user
  registerBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    let role = roleSelect.value;

// Prevent admin self-registration
if (role === "admin") {
  role = "student";
}

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role
      });

      alert(`Registered as ${role}!`);
      redirectUser(role);
    } catch (error) {
      alert(error.message);
    }
  });

  // Login user
  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        redirectUser(role);
      } else {
        alert("User role not found.");
      }
    } catch (error) {
      alert(error.message);
    }
  });

  // Google Login
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already has role
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        // Default role for Google login
        await setDoc(userRef, {
          email: user.email,
          role: "student"
        });
      }

      const role = (await getDoc(userRef)).data().role;
      redirectUser(role);
    } catch (error) {
      alert(error.message);
    }
  });

  // Redirect helper
  function redirectUser(role) {
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "profile.html"; // student
    }
  }

  import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ADMIN: Load all users
async function loadAllUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${data.email} — ${data.role}`;
    usersList.appendChild(li);
  });
}
  // Protect admin page
onAuthStateChanged(auth, async user => {
  if (!user) return;

  const adminList = document.getElementById("usersList");
  if (!adminList) return; // not on admin page

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.data().role;

  if (role !== "admin") {
    alert("Access denied");
    window.location.href = "index.html";
    return;
  }

  loadAllUsers();
});
  
});
