// admin.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.data().role;

  if (role !== "admin") {
    alert("Access denied");
    window.location.href = "index.html";
    return;
  }

  loadAllUsers();
});

async function loadAllUsers() {
  const list = document.getElementById("userList");
  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    const data = doc.data();
    li.textContent = `${data.name} — ${data.email} (${data.role})`;
    list.appendChild(li);
  });
}
