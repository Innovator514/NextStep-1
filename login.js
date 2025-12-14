// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your Firebase config (get this from Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBohx_5opFEgh2Xb-EO977v3KzQJ89CAf4",
  authDomain: "nextstep-civic.firebaseapp.com",
  projectId: "nextstep-civic",
  storageBucket: "nextstep-civic.firebasestorage.app",
  messagingSenderId: "428056422654",
  appId: "1:428056422654:web:2d6ff0d08002134b3cddaf",
  measurementId: "G-E0YCVB3KK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Get elements
const loginCard = document.getElementById('login-card');
const signupCard = document.getElementById('signup-card');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const googleLoginBtn = document.getElementById('google-login');
const googleSignupBtn = document.getElementById('google-signup');

// Switch forms
showSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.style.display = 'none';
  signupCard.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupCard.style.display = 'none';
  loginCard.style.display = 'block';
});

// Show message
function showMessage(form, message, type) {
  const existingMessage = form.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type} show`;
  messageDiv.textContent = message;
  form.insertBefore(messageDiv, form.firstChild);

  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => messageDiv.remove(), 400);
  }, 4000);
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showMessage(loginForm, `Welcome back, ${userCredential.user.displayName || 'User'}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showMessage(loginForm, getErrorMessage(error.code), 'error');
  }
});

// Sign Up
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  if (password.length < 6) {
    showMessage(signupForm, 'Password must be at least 6 characters long.', 'error');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    showMessage(signupForm, `Account created successfully! Welcome, ${name}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showMessage(signupForm, getErrorMessage(error.code), 'error');
  }
});

// Google Sign In
googleLoginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showMessage(loginForm, `Welcome, ${result.user.displayName}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showMessage(loginForm, getErrorMessage(error.code), 'error');
  }
});

googleSignupBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showMessage(signupForm, `Welcome, ${result.user.displayName}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    showMessage(signupForm, getErrorMessage(error.code), 'error');
  }
});

// Check auth state
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes('login.html')) {
    // User is signed in, redirect to home
    window.location.href = 'index.html';
  }
});

// Error messages
function getErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// Export auth for other pages
window.firebaseAuth = auth;
window.firebaseSignOut = signOut;