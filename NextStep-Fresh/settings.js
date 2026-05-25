import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile,
  updatePassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
  authDomain: "nextstep-12b9a.firebaseapp.com",
  projectId: "nextstep-12b9a",
  storageBucket: "nextstep-12b9a.firebasestorage.app",
  messagingSenderId: "630600034259",
  appId: "1:630600034259:web:6b6284e147a6f79cda7126",
  measurementId: "G-WH3JL7Y7BR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
});

window.updateName = async function () {
    const newName = document.getElementById("new-name").value.trim();
    if (newName === "") return alert("Name cannot be empty");

    await updateProfile(currentUser, { displayName: newName });
    alert("Name updated successfully!");
};

window.updatePhoto = async function () {
    const file = document.getElementById("new-photo").files[0];
    if (!file) return alert("Please choose a photo");

    const fileRef = ref(storage, "profilePhotos/" + currentUser.uid);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await updateProfile(currentUser, { photoURL: url });
    alert("Profile photo updated!");
};

window.changePassword = async function () {
    const newPass = document.getElementById("new-password").value;
    if (newPass.length < 6) return alert("Password must be at least 6 characters");

    await updatePassword(currentUser, newPass);
    alert("Password updated!");
};

window.logout = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};
