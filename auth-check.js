import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBohx_5opFEgh2Xb-EO977v3KzQJ89CAf4",
  authDomain: "NextStep.firebaseapp.com",
  projectId: "NextStep",
  storageBucket: "NextStep.firebasestorage.app",
  messagingSenderId: "428056422654",
  appId: "1:428056422654:web:2d6ff0d08002134b3cddaf",
  measurementId: "G-E0YCVB3KK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth for use in other files
window.firebaseAuth = auth;

// Get initials from name
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Create login required overlay
function createLoginOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'login-required-overlay';
  overlay.innerHTML = `
    <style>
      #login-required-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .login-required-card {
        background: white;
        border-radius: 20px;
        padding: 50px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.4s ease;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .login-required-icon {
        font-size: 80px;
        margin-bottom: 20px;
      }
      
      .login-required-title {
        font-size: 32px;
        font-weight: 800;
        color: rgb(1, 9, 67);
        margin-bottom: 15px;
      }
      
      .login-required-message {
        font-size: 18px;
        color: #64748b;
        margin-bottom: 30px;
        line-height: 1.6;
      }
      
      .login-required-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .login-required-btn {
        padding: 15px 35px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
        border: none;
        font-family: 'Open Sans', sans-serif;
      }
      
      .btn-login {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
      }
      
      .btn-login:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      }
      
      .btn-signup {
        background: white;
        color: #2563eb;
        border: 2px solid #2563eb;
      }
      
      .btn-signup:hover {
        background: #eff6ff;
        transform: translateY(-3px);
      }
      
      .btn-back {
        background: #f1f5f9;
        color: #64748b;
      }
      
      .btn-back:hover {
        background: #e2e8f0;
      }
      
      @media (max-width: 768px) {
        .login-required-card {
          padding: 40px 30px;
          margin: 20px;
        }
        
        .login-required-title {
          font-size: 26px;
        }
        
        .login-required-message {
          font-size: 16px;
        }
        
        .login-required-buttons {
          flex-direction: column;
        }
        
        .login-required-btn {
          width: 100%;
        }
      }
    </style>
    
    <div class="login-required-card">
      <div class="login-required-icon">🔒</div>
      <h1 class="login-required-title">Login Required</h1>
      <p class="login-required-message">
        You need to be logged in to access this page. 
        Sign in to view your badges, track your progress, and unlock exclusive features!
      </p>
      <div class="login-required-buttons">
        <a href="login.html" class="login-required-btn btn-login">
          Login Now →
        </a>
        <a href="signup.html" class="login-required-btn btn-signup">
          Create Account
        </a>
        <a href="index.html" class="login-required-btn btn-back">
          ← Go Back
        </a>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Check authentication and update navigation
function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    const loginLink = document.querySelector('.login');
    
    if (user && loginLink) {
      // User is logged in - replace login with profile dropdown
      const displayName = user.displayName || user.email.split('@')[0];
      const initials = getInitials(displayName);
      const photoURL = user.photoURL;
      const firstName = displayName.split(' ')[0];
      
      // Save user data to localStorage for profile page
      try {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', displayName);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userPhotoURL', photoURL || '');
        localStorage.setItem('userId', user.uid);
        if (!localStorage.getItem('memberSince')) {
          localStorage.setItem('memberSince', user.metadata.creationTime || new Date().toISOString());
        }
      } catch (e) {
        console.error('Error saving user data:', e);
      }
      
      // Replace login button with profile dropdown
      const navItem = loginLink.closest('.navbar-item');
      navItem.innerHTML = `
        <div class="profile-dropdown">
          <button class="profile-btn" onclick="toggleProfileMenu()">
            ${photoURL 
              ? `<img src="${photoURL}" alt="Profile" class="profile-photo-nav">` 
              : `<span class="profile-initials">${initials}</span>`
            }
            <span class="profile-name">${firstName}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="profile-menu" id="profile-menu">
            <div class="profile-menu-header">
              <strong>${displayName}</strong>
              <span class="profile-menu-email">${user.email}</span>
            </div>
            <div class="profile-menu-divider"></div>
            <a href="profile.html" class="profile-menu-item">
              <span class="menu-icon">👤</span> My Profile
            </a>
            <a href="profile.html#settings" class="profile-menu-item">
              <span class="menu-icon">⚙️</span> Settings
            </a>
            <a href="badges.html" class="profile-menu-item">
              <span class="menu-icon">🏆</span> Badges
            </a>
            <div class="profile-menu-divider"></div>
            <a href="#" onclick="logout(event)" class="profile-menu-item logout">
              <span class="menu-icon">🚪</span> Logout
            </a>
          </div>
        </div>
      `;
      
      // Remove signup button too
      const signupLink = document.querySelector('.signup');
      if (signupLink) {
        const signupItem = signupLink.closest('.navbar-item');
        if (signupItem) signupItem.remove();
      }
      
    } else if (!user) {
      // User not logged in - clear any saved data
      try {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhotoURL');
        localStorage.removeItem('userId');
      } catch (e) {
        console.error('Error clearing data:', e);
      }
      
      // Check if on protected page and show overlay instead of redirecting
      const currentPage = window.location.pathname.split('/').pop();
      const protectedPages = ['profile.html', 'badges.html'];
      if (protectedPages.includes(currentPage)) {
        createLoginOverlay();
      }
    }
  });
}

// Toggle profile dropdown menu
window.toggleProfileMenu = function() {
  const menu = document.getElementById('profile-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.querySelector('.profile-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    const menu = document.getElementById('profile-menu');
    if (menu) {
      menu.classList.remove('show');
    }
  }
});

// Logout function
window.logout = async function(event) {
  if (event) {
    event.preventDefault();
  }
  
  if (confirm('Are you sure you want to logout?')) {
    try {
      await signOut(auth);
      
      // Clear all saved data
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Error clearing data:', e);
      }
      
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  }
};

// Make functions globally available
window.getInitials = getInitials;

// Initialize authentication check
checkAuth();