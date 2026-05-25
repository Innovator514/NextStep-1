// forgot-password.js - Password Reset Page for NextStep

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  sendPasswordResetEmail
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

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Show message function
function showMessage(message, type) {
  console.log('Showing message:', type, message);
  
  const form = document.getElementById('forgot-password-form');
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

  // Auto-remove after 7 seconds
  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => messageDiv.remove(), 400);
  }, 7000);
}

// Error messages
function getErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/too-many-requests': 'Too many reset attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.'
  };
  
  return messages[code] || `Error: ${code}. Please try again.`;
}

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM loaded, initializing forgot password page...');
  
  const forgotPasswordForm = document.getElementById('forgot-password-form');

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Forgot password form submitted');
      
      const emailInput = document.getElementById('reset-email');
      
      if (!emailInput) {
        console.error('❌ Email input not found');
        return;
      }
      
      const email = emailInput.value.trim();
      const submitBtn = forgotPasswordForm.querySelector('.submit-button');
      
      console.log('📧 Attempting to send reset email to:', email);
      
      if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
      }
      
      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span><span class="button-icon">⏳</span>';
      }
      
      try {
        console.log('📧 Calling sendPasswordResetEmail...');
        await sendPasswordResetEmail(auth, email);
        console.log('✅ ✅ ✅ Password reset email sent successfully!');
        
        showMessage(`✅ Password reset email sent to ${email}! Check your inbox (and spam folder).`, 'success');
        
        // Clear the form
        emailInput.value = '';
        
        // Show additional success message
        const card = document.querySelector('.login-card');
        const successBox = document.createElement('div');
        successBox.style.cssText = 'margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; text-align: center;';
        successBox.innerHTML = `
          <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
          <div style="color: #065f46; font-weight: 700; font-size: 18px; margin-bottom: 8px;">Email Sent!</div>
          <div style="color: #047857; font-size: 14px; line-height: 1.6;">
            Check your email for a password reset link. 
            Click the link to create a new password.
          </div>
          <a href="login.html" style="display: inline-block; margin-top: 15px; padding: 10px 25px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Return to Login →
          </a>
        `;
        
        // Remove old success box if exists
        const oldSuccess = card.querySelector('.success-box');
        if (oldSuccess) oldSuccess.remove();
        
        successBox.className = 'success-box';
        card.appendChild(successBox);
        
      } catch (error) {
        console.error('❌ Password reset error:', error.code, error.message);
        showMessage(getErrorMessage(error.code), 'error');
      } finally {
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Reset Link</span><span class="button-icon">📧</span>';
        }
      }
    });
    
    console.log('✅ Forgot password form listener attached successfully');
  } else {
    console.error('❌ ERROR: Forgot password form not found!');
  }

  console.log('✅ Forgot password page initialization complete');
});