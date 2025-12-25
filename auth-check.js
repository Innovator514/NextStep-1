import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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
      
      // Ensure login button exists
      const navList = document.querySelector('.navdiv ul');
      const existingLogin = navList?.querySelector('a[href="login.html"]');
      if (navList && !existingLogin) {
        const loginItem = document.createElement('li');
        loginItem.className = 'navbar-item';
        loginItem.innerHTML = '<a href="login.html" class="login">Login</a>';
        navList.appendChild(loginItem);
      }
      
      // Redirect to login if on protected page
      const currentPage = window.location.pathname.split('/').pop();
      const protectedPages = ['profile.html', 'badges.html'];
      if (protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
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
