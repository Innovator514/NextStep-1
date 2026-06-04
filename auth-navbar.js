// auth-navbar.js — Global NextStep Navbar Access Control Engine
// Only manages Admin Dashboard link visibility.
// All login/logout/profile UI is handled exclusively by auth-check.js.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
  authDomain: "nextstep-12b9a.firebaseapp.com",
  projectId: "nextstep-12b9a",
  storageBucket: "nextstep-12b9a.firebasestorage.app",
  messagingSenderId: "630600034259",
  appId: "1:630600034259:web:6b6284e147a6f79cda7126"
};

// Start or recycle runtime app
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Listen globally — only toggles the Admin Dashboard nav link.
// auth-check.js handles all login/logout/profile dropdown UI.
onAuthStateChanged(auth, async (user) => {
  const adminNavLink = document.getElementById('admin-nav-link');

  if (!user) {
    if (adminNavLink) adminNavLink.style.display = 'none';
    return;
  }

  // Run Firestore Admin privilege filter check
  try {
    const userSnap = await getDoc(doc(db, 'admins', user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.isAdmin === true || data.role === 'admin') {
        if (adminNavLink) adminNavLink.style.display = 'block';
      }
    }
  } catch (err) {
    console.error("Global validation link error:", err);
  }
});