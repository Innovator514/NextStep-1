// Profile page JavaScript - Firebase Auth version

import { getAuth, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Get Firebase auth instance
const auth = window.firebaseAuth || getAuth();

// Get initials from name
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
    
    // Update nav profile initials if dropdown exists
    const navInitials = document.querySelector('.profile-initials');
    if (navInitials) {
        navInitials.textContent = initials;
    }
    
    // Update nav profile name if dropdown exists
    const navProfileName = document.querySelector('.profile-name');
    if (navProfileName && name) {
        navProfileName.textContent = name.split(' ')[0];
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
    
    // Find and activate the correct tab button
    tabs.forEach(tab => {
        const tabText = tab.textContent.toLowerCase().trim();
        if (tabText === tabName.toLowerCase()) {
            tab.classList.add('current');
        }
    });
    
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
        photoInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showMessage('Please select a valid image file', 'error');
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('Image must be smaller than 5MB', 'error');
                    return;
                }
                
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
                        
                        // Save to localStorage (Firebase Storage would be better for production)
                        try {
                            localStorage.setItem('profilePhoto', readerEvent.target.result);
                            showMessage('Profile photo updated successfully!', 'success');
                        } catch (e) {
                            console.error('Error saving photo:', e);
                            showMessage('Photo updated but could not be saved', 'error');
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Load saved photo
function loadSavedPhoto(user) {
    try {
        // First try Firebase photoURL
        if (user && user.photoURL) {
            const container = document.querySelector('.profile-photo-container');
            if (container) {
                container.innerHTML = `
                    <img class="profile-photo" src="${user.photoURL}" alt="Profile Photo">
                    <label for="photo-input" class="photo-overlay"></label>
                    <input type="file" id="photo-input" accept="image/*">
                `;
                setupPhotoUpload();
                return;
            }
        }
        
        // Then try localStorage
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            const container = document.querySelector('.profile-photo-container');
            if (container) {
                container.innerHTML = `
                    <img class="profile-photo" src="${savedPhoto}" alt="Profile Photo">
                    <label for="photo-input" class="photo-overlay"></label>
                    <input type="file" id="photo-input" accept="image/*">
                `;
                setupPhotoUpload();
            }
        }
    } catch (e) {
        console.error('Error loading photo:', e);
    }
}

// Update Account Name
async function updateAccountName() {
    const nameInput = document.getElementById('new-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        showMessage('Please enter a name', 'error');
        return;
    }
    
    if (name.length < 2) {
        showMessage('Name must be at least 2 characters', 'error');
        return;
    }
    
    try {
        const user = auth.currentUser;
        if (user) {
            // Update Firebase profile
            await updateProfile(user, {
                displayName: name
            });
            
            // Save to localStorage
            localStorage.setItem('userName', name);
            
            // Update all displays
            const nameDisplay = document.getElementById('profile-name-display');
            const infoName = document.getElementById('info-name');
            if (nameDisplay) nameDisplay.textContent = name;
            if (infoName) infoName.textContent = name;
            updateInitialsDisplay(name);
            
            // Update nav menu header
            const menuHeader = document.querySelector('.profile-menu-header strong');
            if (menuHeader) {
                menuHeader.textContent = name;
            }
            
            showMessage('Name updated successfully!', 'success');
            nameInput.value = '';
        }
    } catch (error) {
        console.error('Error updating name:', error);
        showMessage('Error updating name: ' + error.message, 'error');
    }
}

// Update Password
async function updateUserPassword() {
    const newPassInput = document.getElementById('new-password');
    const confirmPassInput = document.getElementById('confirm-password');
    const newPass = newPassInput.value;
    const confirmPass = confirmPassInput.value;
    
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
    
    try {
        const user = auth.currentUser;
        if (user) {
            await updatePassword(user, newPass);
            showMessage('Password updated successfully!', 'success');
            newPassInput.value = '';
            confirmPassInput.value = '';
        }
    } catch (error) {
        console.error('Error updating password:', error);
        if (error.code === 'auth/requires-recent-login') {
            showMessage('Please log out and log back in before changing your password', 'error');
        } else {
            showMessage('Error updating password: ' + error.message, 'error');
        }
    }
}

// Show Message
function showMessage(text, type) {
    const messageDiv = document.getElementById('settings-message');
    if (messageDiv) {
        messageDiv.className = 'message ' + type;
        messageDiv.textContent = text;
        
        // Auto-hide after 4 seconds
        setTimeout(function() {
            messageDiv.className = '';
            messageDiv.textContent = '';
        }, 4000);
    }
}

// Logout (uses Firebase signOut from auth-check.js)
function logoutUser() {
    if (window.logout) {
        window.logout(new Event('click'));
    }
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return 'Unknown';
    }
}

// Load badge and event statistics
function loadBadgeStatistics() {
    try {
        // Load user progress from localStorage
        const saved = localStorage.getItem('userProgress');
        const userProgress = saved ? JSON.parse(saved) : {
            eventsAttended: 0,
            volunteeredHours: 0
        };
        
        // Badge definitions (same as badges.js)
        const badges = [
            { progressKey: "eventsAttended", required: 1 },
            { progressKey: "eventsAttended", required: 5 },
            { progressKey: "eventsAttended", required: 10 },
            { progressKey: "eventsAttended", required: 25 },
            { progressKey: "volunteeredHours", required: 1 },
            { progressKey: "volunteeredHours", required: 10 },
            { progressKey: "volunteeredHours", required: 50 },
            { progressKey: "townHallSpeeches", required: 1 },
            { progressKey: "environmentalEvents", required: 3 },
            { progressKey: "youthEvents", required: 5 },
            { progressKey: "innovationSummits", required: 3 },
            { progressKey: "earlyRegistrations", required: 1 },
            { progressKey: "consecutiveMonths", required: 3 },
            { progressKey: "friendsInvited", required: 5 },
            { progressKey: "isFoundingMember", required: 1 },
            { progressKey: "eventsCreated", required: 1 },
            { progressKey: "electionsVoted", required: 3 },
            { progressKey: "serviceProjects", required: 5 },
            { progressKey: "networkConnections", required: 25 },
            { progressKey: "sustainabilityInitiatives", required: 10 }
        ];
        
        // Calculate earned badges
        let earnedCount = 0;
        badges.forEach(badge => {
            const progress = badge.progressKey === 'isFoundingMember' 
                ? (userProgress[badge.progressKey] ? 1 : 0)
                : (userProgress[badge.progressKey] || 0);
            
            if (progress >= badge.required) {
                earnedCount++;
            }
        });
        
        const totalBadges = badges.length;
        const completionPercent = Math.round((earnedCount / totalBadges) * 100);
        const remainingBadges = totalBadges - earnedCount;
        
        // Update Profile Tab stats
        const profileStatCards = document.querySelectorAll('.stats-grid .stat-card');
        if (profileStatCards.length >= 3) {
            profileStatCards[0].querySelector('.stat-number').textContent = userProgress.eventsAttended || 0;
            profileStatCards[1].querySelector('.stat-number').textContent = earnedCount;
            const hours = userProgress.volunteeredHours || 0;
            profileStatCards[2].querySelector('.stat-number').textContent = hours + 'h';
        }
        
        // Update Activity Tab badge stats
        const activityInfoCards = document.querySelectorAll('#activity-tab .stats-grid .info-card');
        if (activityInfoCards.length >= 3) {
            activityInfoCards[0].querySelector('.info-card-value').textContent = earnedCount + ' Badges';
            activityInfoCards[1].querySelector('.info-card-value').textContent = completionPercent + '%';
            activityInfoCards[2].querySelector('.info-card-value').textContent = remainingBadges + ' More';
        }
        
        console.log('Badge statistics loaded:', { earnedCount, totalBadges, completionPercent });
    } catch (e) {
        console.error('Error loading badge statistics:', e);
    }
}

// Load recent activity from completed events
function loadRecentActivity() {
    try {
        // Get completed events
        const completedEventsIds = JSON.parse(localStorage.getItem('completedEvents') || '[]');
        
        // Events data (same as events.js)
        const eventsData = [
            {
                id: 'event-1',
                title: "Town Hall Meeting",
                date: "November 21, 2025",
                category: "political",
                volunteeredHours: 0
            },
            {
                id: 'event-2',
                title: "Youth Leadership Workshop",
                date: "December 5, 2025",
                category: "youth",
                volunteeredHours: 0
            },
            {
                id: 'event-3',
                title: "Tech Innovation Summit",
                date: "December 10, 2025",
                category: "innovation",
                volunteeredHours: 0
            },
            {
                id: 'event-4',
                title: "Beach Clean-Up Day",
                date: "December 15, 2025",
                category: "environmental",
                volunteeredHours: 2
            },
            {
                id: 'event-5',
                title: "Education Forum",
                date: "December 20, 2025",
                category: "education",
                volunteeredHours: 0
            },
            {
                id: 'event-6',
                title: "City Council Meeting",
                date: "January 5, 2026",
                category: "political",
                volunteeredHours: 0
            },
            {
                id: 'event-7',
                title: "Community Garden Project",
                date: "January 12, 2026",
                category: "environmental",
                volunteeredHours: 3
            }
        ];
        
        // Filter completed events and sort by date (most recent first)
        const completedEvents = eventsData
            .filter(event => completedEventsIds.includes(event.id))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get the activity section
        const activitySection = document.querySelector('#activity-tab .settings-section');
        if (!activitySection) return;
        
        // Build the HTML for completed events
        let activityHTML = '<h2>Recent Activity</h2>';
        
        if (completedEvents.length === 0) {
            activityHTML += `
                <div class="info-card">
                    <div class="info-card-value">No activities yet</div>
                    <div class="toggle-description" style="margin-top: 8px;">Complete events to see your activity here!</div>
                </div>
            `;
        } else {
            completedEvents.forEach(event => {
                const activityType = event.volunteeredHours > 0 
                    ? `Volunteered • ${event.volunteeredHours} hours` 
                    : 'Attended';
                
                activityHTML += `
                    <div class="info-card" style="margin-bottom: 15px;">
                        <div class="info-card-label">${event.date}</div>
                        <div class="info-card-value">${event.title}</div>
                        <div class="toggle-description" style="margin-top: 8px;">${activityType}</div>
                    </div>
                `;
            });
        }
        
        activitySection.innerHTML = activityHTML;
        
        console.log('Recent activity loaded:', completedEvents.length + ' events');
    } catch (e) {
        console.error('Error loading recent activity:', e);
    }
}

// Load user data from Firebase
function loadUserData() {
    const user = auth.currentUser;
    
    if (user) {
        // Get data from Firebase user object
        const userName = user.displayName || user.email.split('@')[0];
        const userEmail = user.email;
        const memberSince = user.metadata.creationTime;
        
        // Update profile display
        const nameDisplay = document.getElementById('profile-name-display');
        const emailDisplay = document.getElementById('profile-email-display');
        const infoName = document.getElementById('info-name');
        const infoEmail = document.getElementById('info-email');
        const memberSinceEl = document.getElementById('member-since');
        
        if (nameDisplay) nameDisplay.textContent = userName;
        if (emailDisplay) emailDisplay.textContent = userEmail;
        if (infoName) infoName.textContent = userName;
        if (infoEmail) infoEmail.textContent = userEmail;
        if (memberSinceEl) memberSinceEl.textContent = formatDate(memberSince);
        
        // Update initials
        updateInitialsDisplay(userName);
        
        // Set placeholder for name input
        const nameInput = document.getElementById('new-name');
        if (nameInput) {
            nameInput.placeholder = userName;
        }
        
        // Load saved photo
        loadSavedPhoto(user);
    } else {
        // Fallback to localStorage if no Firebase user yet
        try {
            const userName = localStorage.getItem('userName') || 'User';
            const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
            const memberSince = localStorage.getItem('memberSince') || new Date().toISOString();
            
            document.getElementById('profile-name-display').textContent = userName;
            document.getElementById('profile-email-display').textContent = userEmail;
            document.getElementById('info-name').textContent = userName;
            document.getElementById('info-email').textContent = userEmail;
            document.getElementById('member-since').textContent = formatDate(memberSince);
            
            updateInitialsDisplay(userName);
            loadSavedPhoto(null);
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// Save notification preferences
function saveNotificationPreferences() {
    try {
        const emailNotif = document.getElementById('email-notif').checked;
        const eventReminders = document.getElementById('event-reminders').checked;
        const newsletter = document.getElementById('newsletter').checked;
        
        localStorage.setItem('notif_email', emailNotif);
        localStorage.setItem('notif_events', eventReminders);
        localStorage.setItem('notif_newsletter', newsletter);
    } catch (e) {
        console.error('Error saving preferences:', e);
    }
}

// Load notification preferences
function loadNotificationPreferences() {
    try {
        const emailNotif = localStorage.getItem('notif_email');
        const eventReminders = localStorage.getItem('notif_events');
        const newsletter = localStorage.getItem('notif_newsletter');
        
        if (emailNotif !== null) {
            document.getElementById('email-notif').checked = emailNotif === 'true';
        }
        if (eventReminders !== null) {
            document.getElementById('event-reminders').checked = eventReminders === 'true';
        }
        if (newsletter !== null) {
            document.getElementById('newsletter').checked = newsletter === 'true';
        }
    } catch (e) {
        console.error('Error loading preferences:', e);
    }
}

// Setup notification toggles
function setupNotificationToggles() {
    const toggles = ['email-notif', 'event-reminders', 'newsletter'];
    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', saveNotificationPreferences);
        }
    });
}

// Check URL hash for direct tab access
function checkURLHash() {
    const hash = window.location.hash.substring(1);
    if (hash && (hash === 'profile' || hash === 'settings' || hash === 'activity')) {
        switchTab(hash);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page initializing...');
    
    // Wait for Firebase auth to be ready
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Load user data
            loadUserData();
            
            // Load badge statistics
            loadBadgeStatistics();
            
            // Load recent activity
            loadRecentActivity();
            
            // Setup photo upload
            setupPhotoUpload();
            
            // Load notification preferences
            loadNotificationPreferences();
            
            // Setup notification toggles
            setupNotificationToggles();
            
            // Check URL hash for direct tab navigation
            checkURLHash();
            
            console.log('Profile page initialized successfully');
        } else {
            // No user logged in, redirect to login
            window.location.href = 'login.html';
        }
    });
});

// Listen for hash changes
window.addEventListener('hashchange', checkURLHash);

// Make functions available globally
window.switchTab = switchTab;
window.updateAccountName = updateAccountName;
window.updateUserPassword = updateUserPassword;
window.logoutUser = logoutUser;