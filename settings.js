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
  apiKey: "AIzaSyBohx_5opFEgh2Xb-EO977v3KzQJ89CAf4",
  authDomain: "nextstep-civic.firebaseapp.com",
  projectId: "nextstep-civic",
  storageBucket: "nextstep-civic.firebasestorage.app",
  messagingSenderId: "428056422654",
  appId: "1:428056422654:web:2d6ff0d08002134b3cddaf",
  measurementId: "G-E0YCVB3KK9"
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
