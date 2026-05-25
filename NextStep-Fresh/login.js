// login.js - Login Only Page for NextStep

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
  apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
  authDomain: "nextstep-12b9a.firebaseapp.com",
  projectId: "nextstep-12b9a",
  storageBucket: "nextstep-12b9a.firebasestorage.app",
  messagingSenderId: "630600034259",
  appId: "1:630600034259:web:6b6284e147a6f79cda7126",
  measurementId: "G-WH3JL7Y7BR"
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
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Show message function
function showMessage(message, type) {
  console.log('Showing message:', type, message);
  
  const form = document.getElementById('login-form');
  if (!form) return;
  
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

// Flag to prevent double redirects
let isRedirecting = false;

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM loaded, initializing login page...');
  
  const loginForm = document.getElementById('login-form');
  const googleLoginBtn = document.getElementById('google-login');

  console.log('🔍 Elements found:', {
    loginForm: !!loginForm,
    googleLoginBtn: !!googleLoginBtn
  });

  // Handle Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Login form submitted');
      
      if (isRedirecting) {
        console.log('⚠️ Already redirecting, ignoring submit');
        return;
      }
      
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      
      if (!emailInput || !passwordInput) {
        console.error('❌ Email or password input not found');
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const submitBtn = loginForm.querySelector('.submit-button');
      
      console.log('🔐 Attempting login for:', email);
      
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
        console.log('🔐 Calling signInWithEmailAndPassword...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ ✅ ✅ Login successful!');
        console.log('👤 User:', user.email);
        console.log('🆔 User ID:', user.uid);
        
        showMessage(`Welcome back, ${user.displayName || 'User'}!`, 'success');
        
        // Set flag and redirect
        isRedirecting = true;
        console.log('🔄 Redirecting to index.html in 1 second...');
        setTimeout(() => {
          console.log('➡️ Redirecting NOW');
          window.location.href = 'index.html';
        }, 1000);
        
      } catch (error) {
        console.error('❌ Login error:', error.code, error.message);
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
      console.log('🔵 Google login clicked');
      
      if (isRedirecting) {
        console.log('⚠️ Already redirecting, ignoring click');
        return;
      }
      
      try {
        console.log('🔓 Opening Google popup...');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('✅ ✅ ✅ Google login successful!');
        console.log('👤 User:', user.email);
        console.log('🆔 User ID:', user.uid);
        
        showMessage(`Welcome, ${user.displayName || 'User'}!`, 'success');
        
        // Set flag and redirect
        isRedirecting = true;
        console.log('🔄 Redirecting to index.html in 1 second...');
        setTimeout(() => {
          console.log('➡️ Redirecting NOW');
          window.location.href = 'index.html';
        }, 1000);
        
      } catch (error) {
        console.error('❌ Google login error:', error.code, error.message);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showMessage(getErrorMessage(error.code), 'error');
        }
      }
    });
  }

  // Check if user is already logged in - BUT DON'T REDIRECT FROM LOGIN PAGE
  onAuthStateChanged(auth, (user) => {
    if (user && !isRedirecting) {
      console.log('👤 User already logged in:', user.email);
      console.log('ℹ️ On login page - showing message but not redirecting automatically');
      
      // Show a friendly message instead of auto-redirecting
      const loginCard = document.querySelector('.login-card');
      if (loginCard) {
        const existingBanner = document.getElementById('already-logged-in-banner');
        if (!existingBanner) {
          const banner = document.createElement('div');
          banner.id = 'already-logged-in-banner';
          banner.style.cssText = 'background: linear-gradient(135deg, #d1fae5, #a7f3d0); padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; color: #065f46; font-weight: 600;';
          banner.innerHTML = `
            ✅ You're already logged in as ${user.email}
            <br>
            <a href="index.html" style="color: #2563eb; text-decoration: underline; margin-top: 10px; display: inline-block;">Go to Home Page →</a>
          `;
          loginCard.insertBefore(banner, loginCard.firstChild);
        }
      }
    } else if (!user) {
      console.log('👤 No user logged in');
    }
  });

  console.log('✅ Login page initialization complete');
});