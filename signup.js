// signup.js - Sign Up Page for NextStep

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
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

console.log('Signup.js loaded');

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
  
  console.log('Firebase initialized successfully in signup.js');
} catch (error) {
  console.error('Firebase initialization error:', error);
  alert('Error initializing Firebase. Please refresh the page.');
}

// Show message function
function showMessage(message, type) {
  console.log('Showing message:', type, message);
  
  const signupCard = document.querySelector('.signup-card');
  if (!signupCard) {
    console.error('Signup card not found');
    return;
  }
  
  // Remove existing messages
  const existingMessage = signupCard.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type} show`;
  messageDiv.textContent = message;
  
  // Insert after the subtitle
  const subtitle = signupCard.querySelector('.login-subtitle');
  if (subtitle && subtitle.nextSibling) {
    subtitle.parentNode.insertBefore(messageDiv, subtitle.nextSibling);
  } else {
    signupCard.insertBefore(messageDiv, signupCard.firstChild);
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => messageDiv.remove(), 400);
  }, 5000);
}

// Error messages
function getErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/unauthorized-domain': 'This domain is not authorized. Please contact support.',
    'auth/operation-not-allowed': 'Email/Password sign-up is not enabled. Please contact support.'
  };
  
  return messages[code] || `Error: ${code}. Please try again.`;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - Setting up signup page');
  
  const signupForm = document.getElementById('signup-form');
  const googleSignupBtn = document.getElementById('google-signup');

  console.log('Form elements found:', {
    signupForm: !!signupForm,
    googleSignupBtn: !!googleSignupBtn,
    nameInput: !!document.getElementById('signup-name'),
    emailInput: !!document.getElementById('signup-email'),
    passwordInput: !!document.getElementById('signup-password'),
    confirmPasswordInput: !!document.getElementById('signup-confirm-password')
  });

  // Handle Signup Form Submission
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('=== SIGNUP FORM SUBMITTED ===');
      
      // Get form inputs
      const nameInput = document.getElementById('signup-name');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const confirmPasswordInput = document.getElementById('signup-confirm-password');
      const submitBtn = signupForm.querySelector('.submit-button');
      
      if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        console.error('ERROR: One or more form inputs not found!');
        alert('Form error. Please refresh the page.');
        return;
      }
      
      // Get values
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      console.log('Form values:', {
        name: name,
        email: email,
        passwordLength: password.length,
        passwordsMatch: password === confirmPassword
      });
      
      // Validation
      if (!name || name.length < 2) {
        console.log('Validation failed: Name too short');
        showMessage('Name must be at least 2 characters long', 'error');
        return;
      }
      
      if (!email) {
        console.log('Validation failed: No email');
        showMessage('Please enter an email address', 'error');
        return;
      }
      
      if (!password || password.length < 6) {
        console.log('Validation failed: Password too short');
        showMessage('Password must be at least 6 characters long', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        console.log('Validation failed: Passwords do not match');
        showMessage('Passwords do not match', 'error');
        return;
      }
      
      console.log('All validations passed. Creating account...');
      
      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating account...</span>';
      }
      
      try {
        console.log('Calling Firebase createUserWithEmailAndPassword...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✓ User account created successfully!', user.uid);
        
        // Update profile with display name
        console.log('Updating user profile with name:', name);
        await updateProfile(user, {
          displayName: name
        });
        console.log('✓ Profile updated with display name');
        
        // Show success message
        showMessage(`Account created successfully! Welcome, ${name}!`, 'success');
        console.log('Success message shown');
        
        // Clear the form
        signupForm.reset();
        console.log('Form cleared');
        
        // Redirect to home page
        console.log('Redirecting to index.html in 1.5 seconds...');
        setTimeout(() => {
          console.log('Redirecting NOW to index.html');
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error('=== SIGNUP ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        showMessage(getErrorMessage(error.code), 'error');
        
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Create Account</span><span class="button-icon">→</span>';
        }
      }
    });
    
    console.log('Signup form listener attached successfully');
  } else {
    console.error('ERROR: Signup form not found!');
  }

  // Handle Google Signup
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      console.log('=== GOOGLE SIGNUP CLICKED ===');
      
      try {
        console.log('Opening Google popup...');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('✓ Google signup successful:', user.email);
        
        showMessage(`Welcome, ${user.displayName || 'User'}!`, 'success');
        
        // Redirect to home page
        console.log('Redirecting to index.html...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
        
      } catch (error) {
        console.error('=== GOOGLE SIGNUP ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showMessage(getErrorMessage(error.code), 'error');
        }
      }
    });
    
    console.log('Google signup button listener attached successfully');
  } else {
    console.error('ERROR: Google signup button not found!');
  }

  // Check if user is already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User already logged in:', user.email);
      console.log('Redirecting to home page...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    } else {
      console.log('No user logged in - showing signup form');
    }
  });

  console.log('=== Signup page initialization complete ===');
});
