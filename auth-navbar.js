// auth-navbar.js — Global NextStep Navbar Access Control Engine
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

// Listen globally for account updates
onAuthStateChanged(auth, async (user) => {
  const adminNavLink = document.getElementById('admin-nav-link');
  const loginBtn = document.getElementById('nav-login');
  const signupBtn = document.getElementById('nav-signup');

  if (!user) {
    // Force reset state if user logs out or has no profile token
    if (adminNavLink) adminNavLink.style.display = 'none';
    if (loginBtn) { loginBtn.textContent = 'Login'; loginBtn.href = 'login.html'; }
    if (signupBtn) signupBtn.style.display = 'block';
    return;
  }

  // Manage profile button modifications
  if (loginBtn) { loginBtn.textContent = 'Log Out'; loginBtn.href = '#'; loginBtn.onclick = () => auth.signOut(); }
  if (signupBtn) signupBtn.style.display = 'none';

  // Run Firestore Admin privilege filter check
  try {
    const userSnap = await getDoc(doc(db, 'admins', user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.isAdmin === true || data.role === 'admin') {
        if (adminNavLink) adminNavLink.style.display = 'block'; // Unhide tab!
      }
    }
  } catch (err) {
    console.error("Global validation link error:", err);
  }
});