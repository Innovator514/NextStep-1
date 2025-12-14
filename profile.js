// Profile page JavaScript - Non-module version that works with auth-check.js

// Get initials from name (same function as auth-check.js)
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Update initials display
function updateInitialsDisplay(name) {
    const initials = getInitials(name);
    const initialsElement = document.getElementById('profile-initials-large');
    if (initialsElement) {
        initialsElement.textContent = initials;
    }
    
    // Update nav initials if user profile exists
    const navProfile = document.querySelector('.profile-initials');
    if (navProfile) {
        navProfile.textContent = initials;
    }
}

// Tab Switching
function switchTab(tabName) {
    // Remove current class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('current');
    });
    
    // Remove current class from all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('current');
    });
    
    // Add current class to clicked tab
    event.target.classList.add('current');
    
    // Show corresponding content
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) {
        tabContent.classList.add('current');
    }
}

// Photo Upload Handler
function setupPhotoUpload() {
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(readerEvent) {
                    // Replace initials with actual photo
                    const container = document.querySelector('.profile-photo-container');
                    if (container) {
                        container.innerHTML = `
                            <img class="profile-photo" src="${readerEvent.target.result}" alt="Profile Photo">
                            <label for="photo-input" class="photo-overlay"></label>
                            <input type="file" id="photo-input" accept="image/*">
                        `;
                        setupPhotoUpload(); // Re-attach listener
                        showMessage('Profile photo updated successfully!', 'success');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Update Account Name
function updateAccountName() {
    const name = document.getElementById('new-name').value.trim();
    
    if (!name) {
        showMessage('Please enter a name', 'error');
        return;
    }
    
    // Update displays
    const nameDisplay = document.getElementById('profile-name-display');
    const infoName = document.getElementById('info-name');
    if (nameDisplay) nameDisplay.textContent = name;
    if (infoName) infoName.textContent = name;
    updateInitialsDisplay(name);
    
    // Update nav profile name if exists
    const navProfileName = document.querySelector('.profile-name');
    if (navProfileName) {
        navProfileName.textContent = name.split(' ')[0];
    }
    
    showMessage('Name updated successfully!', 'success');
    document.getElementById('new-name').value = '';
}

// Update Password
function updateUserPassword() {
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    
    if (!newPass) {
        showMessage('Please enter a new password', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPass !== confirmPass) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    showMessage('Password updated successfully!', 'success');
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Show Message
function showMessage(text, type) {
    const messageDiv = document.getElementById('settings-message');
    if (messageDiv) {
        messageDiv.className = 'message ' + type;
        messageDiv.textContent = text;
        
        setTimeout(function() {
            messageDiv.className = '';
            messageDiv.textContent = '';
        }, 4000);
    }
}

// Logout
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        // Use the logout function from auth-check.js if available
        if (typeof window.logout === 'function') {
            window.logout(event);
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Setup photo upload
    setupPhotoUpload();
    
    // Try to get user data from auth-check.js or set defaults
    setTimeout(function() {
        // Check if we have user data
        const nameDisplay = document.getElementById('profile-name-display');
        if (nameDisplay && nameDisplay.textContent === 'Loading...') {
            // Set default values if auth hasn't loaded yet
            const userName = 'John Doe';
            const userEmail = 'john.doe@example.com';
            
            document.getElementById('profile-name-display').textContent = userName;
            document.getElementById('profile-email-display').textContent = userEmail;
            document.getElementById('info-name').textContent = userName;
            document.getElementById('info-email').textContent = userEmail;
            document.getElementById('member-since').textContent = 'November 2024';
            
            updateInitialsDisplay(userName);
            
            // Set placeholder for name input
            const nameInput = document.getElementById('new-name');
            if (nameInput) {
                nameInput.placeholder = userName;
            }
        }
    }, 500);
    
    console.log('Profile page initialized');
});