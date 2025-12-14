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

// Check if user is logged in
function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    const navList = document.querySelector('.navdiv ul');
    
    if (user && navList) {
      // User is logged in - remove login button
      const loginLink = navList.querySelector('a[href="login.html"]');
      if (loginLink) {
        loginLink.parentElement.remove();
      }
      
      // Add user profile dropdown
      const existingProfile = navList.querySelector('.user-profile');
      if (!existingProfile) {
        const profileItem = document.createElement('li');
        profileItem.className = 'navbar-item user-profile';
        
        // Get user initials or photo
        const displayName = user.displayName || user.email;
        const initials = getInitials(displayName);
        const photoURL = user.photoURL;
        
profileItem.innerHTML = `
  <div class="profile-wrapper">
    <button class="profile-button" onclick="toggleProfileMenu(event)">
      ${photoURL 
        ? `<img src="${photoURL}" alt="Profile" class="profile-image">` 
        : `<div class="profile-initials">${initials}</div>`
      }
      <span class="profile-name">${displayName.split(' ')[0]}</span>
      <span class="dropdown-arrow">▼</span>
    </button>
    <div class="profile-dropdown" id="profile-dropdown">
      <div class="dropdown-header">
        <div class="dropdown-user-info">
          <strong>${displayName}</strong>
          <span class="dropdown-email">${user.email}</span>
        </div>
      </div>
      <div class="dropdown-divider"></div>
      <a href="profile.html" class="dropdown-item">
        <span>👤</span> My Profile
      </a>
      <a href="badges.html" class="dropdown-item">
        <span>🏆</span> My Badges
      </a>
      <a href="settings.html" class="dropdown-item">
        <span>⚙️</span> Settings
      </a>
      <div class="dropdown-divider"></div>
      <a href="#" class="dropdown-item logout" onclick="logout(event)">
        <span>🚪</span> Logout
      </a>
    </div>
  </div>
`;
navList.appendChild(profileItem);
      }
    } else if (navList && !navList.querySelector('a[href="login.html"]')) {
      // User not logged in - show login button
      const userProfile = navList.querySelector('.user-profile');
      if (userProfile) {
        userProfile.remove();
      }
      
      const loginItem = document.createElement('li');
      loginItem.className = 'navbar-item';
      loginItem.innerHTML = '<a href="login.html" class="login">Login</a>';
      navList.appendChild(loginItem);
    }
  });
}

// Get initials from name
function getInitials(name) {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Toggle profile dropdown
window.toggleProfileMenu = function(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('show');
};

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown && !event.target.closest('.profile-wrapper')) {
    dropdown.classList.remove('show');
  }
});

window.viewProfile = function(event) {
    event.preventDefault();
    window.location.href = "profile.html";
};

window.viewSettings = function(event) {
    event.preventDefault(); 
    window.location.href = "profile.html#settings";
};

// Logout function
window.logout = async function(event) {
  event.preventDefault();
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error signing out:', error);
    alert('Error signing out. Please try again.');
  }
};

// Initialize
checkAuth();