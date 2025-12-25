// login-simple.js - Login Only Page for NextStep

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase config
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
let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Set persistence
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting persistence:', error);
  });
  
  // Export auth for other modules
  window.firebaseAuth = auth;
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Show message function
function showMessage(message, type) {
  console.log('Showing message:', type, message);
  
  const form = document.getElementById('login-form');
  const card = form.closest('.login-card');
  
  // Remove existing messages
  const existingMessage = card.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type} show`;
  messageDiv.textContent = message;
  
  // Insert at the top of the form
  form.insertBefore(messageDiv, form.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => messageDiv.remove(), 400);
  }, 5000);
}

// Error messages
function getErrorMessage(code) {
  const messages = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/unauthorized-domain': 'This domain is not authorized. Please contact support.'
  };
  
  return messages[code] || `Error: ${code}. Please try again.`;
}

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing login page...');
  
  const loginForm = document.getElementById('login-form');
  const googleLoginBtn = document.getElementById('google-login');

  console.log('Elements found:', {
    loginForm: !!loginForm,
    googleLoginBtn: !!googleLoginBtn
  });

  // Handle Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Login form submitted');
      
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      
      if (!emailInput || !passwordInput) {
        console.error('Email or password input not found');
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const submitBtn = loginForm.querySelector('.submit-button');
      
      console.log('Attempting login for:', email);
      
      if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
      }
      
      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Signing in...</span>';
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Login successful:', user.email);
        
        showMessage(`Welcome back, ${user.displayName || 'User'}!`, 'success');
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error('Login error:', error.code, error.message);
        showMessage(getErrorMessage(error.code), 'error');
        
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Sign In</span><span class="button-icon">→</span>';
        }
      }
    });
  }

  // Handle Google Login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      console.log('Google login clicked');
      
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('Google login successful:', user.email);
        
        showMessage(`Welcome, ${user.displayName || 'User'}!`, 'success');
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error('Google login error:', error.code, error.message);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showMessage(getErrorMessage(error.code), 'error');
        }
      }
    });
  }

  // Check if user is already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User already logged in:', user.email);
      // Redirect to home if already logged in
      const currentPath = window.location.pathname;
      if (currentPath.endsWith('login.html') || currentPath.endsWith('/login')) {
        console.log('Redirecting to home...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    } else {
      console.log('No user logged in');
    }
  });

  console.log('Login page initialization complete');
});
