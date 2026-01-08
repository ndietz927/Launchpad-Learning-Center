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
  getDoc,
  collection,
  query,
  where,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* 🔥 Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyCCotUqgZkDULpRLeyb9lvCma_SYO0CFb0",
  authDomain: "simpleloginapp-a7b53.firebaseapp.com",
  projectId: "simpleloginapp-a7b53",
  storageBucket: "simpleloginapp-a7b53.firebasestorage.app",
  messagingSenderId: "410260892945",
  appId: "1:410260892945:web:5339e6de4dbf5cec2cf0b0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ----- DOM ----- */
const userEmail = document.getElementById("userEmail");
const profileForm = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");
const assignmentList = document.getElementById("assignmentList");

/* ----- State ----- */
let currentClassCode = null;

/* ----- Auth ----- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userEmail.textContent = `Logged in as: ${user.email}`;
  const userRef = doc(db, "profiles", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    firstName.value = data.firstName || "";
    lastName.value = data.lastName || "";
    grade.value = data.grade || "";
    age.value = data.age || "";
    classCode.value = data.classCode || "";

    if (data.classCode) {
      currentClassCode = data.classCode;
      loadAssignments();
    }
  }

  profileForm.onsubmit = async (e) => {
    e.preventDefault();

    const enteredCode = classCode.value.trim();

    const classRef = doc(db, "classes", enteredCode);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      alert("❌ Invalid class code.");
      return;
    }

    await setDoc(userRef, {
      firstName: firstName.value,
      lastName: lastName.value,
      grade: grade.value,
      age: Number(age.value),
      classCode: enteredCode,
      email: user.email
    }, { merge: true });

    currentClassCode = enteredCode;
    loadAssignments();
    alert("✅ Joined class successfully!");
  };
});

/* ----- Load Assignments ----- */
function loadAssignments() {
  assignmentList.innerHTML = "Loading assignments...";

  const q = query(
    collection(db, "classContent"),
    where("classCode", "==", currentClassCode),
    where("type", "==", "assignment")
  );

  onSnapshot(q, (snapshot) => {
    assignmentList.innerHTML = "";

    if (snapshot.empty) {
      assignmentList.innerHTML = "<p>No assignments yet.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const a = docSnap.data();
      const div = document.createElement("div");
      div.className = "assignment-card mb-3";

      div.innerHTML = `
        <h5>${a.title}</h5>
        <p>${a.description}</p>
        <small>Due: ${a.dueDate}</small>

        <textarea class="form-control mt-2" placeholder="Enter your submission"></textarea>
        <button class="btn btn-primary btn-sm mt-2">Submit</button>
      `;

      const submitBtn = div.querySelector("button");
      const textArea = div.querySelector("textarea");

      submitBtn.onclick = async () => {
        if (!textArea.value.trim()) {
          alert("Please enter your submission.");
          return;
        }

        await addDoc(collection(db, "submissions"), {
          assignmentId: docSnap.id,
          classCode: currentClassCode,
          studentId: auth.currentUser.uid,
          studentEmail: auth.currentUser.email,
          text: textArea.value,
          submittedAt: Date.now()
        });

        textArea.value = "";
        alert("✅ Submission sent!");
      };

      assignmentList.appendChild(div);
    });
  });
}

/* ----- Logout ----- */
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
