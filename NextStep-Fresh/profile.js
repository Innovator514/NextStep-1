// Profile page JavaScript - Fixed Photo Upload with Full Persistence

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

// Update profile photo in nav dropdown
function updateNavPhoto(photoURL) {
    const profileBtn = document.querySelector('.profile-btn');
    if (!profileBtn) return;
    
    const existingPhoto = profileBtn.querySelector('.profile-photo-nav');
    const existingInitials = profileBtn.querySelector('.profile-initials');
    
    if (photoURL) {
        // Replace initials with photo or update existing photo
        if (existingInitials) {
            existingInitials.outerHTML = `<img src="${photoURL}" alt="Profile" class="profile-photo-nav">`;
        } else if (existingPhoto) {
            existingPhoto.src = photoURL;
        }
    } else {
        // Replace photo with initials
        if (existingPhoto) {
            const user = auth.currentUser;
            const name = user?.displayName || user?.email?.split('@')[0] || 'User';
            existingPhoto.outerHTML = `<span class="profile-initials">${getInitials(name)}</span>`;
        }
    }
    
    // Dispatch custom event to notify auth-check.js
    window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
        detail: { photoURL: photoURL }
    }));
}

// Tab Switching — works for both old .tab system and new sidebar-nav + profile-pane
function switchTab(tabName, clickedBtn) {
    // New system: sidebar-nav-item + profile-pane
    const panes = document.querySelectorAll('.profile-pane');
    const sidebarBtns = document.querySelectorAll('.sidebar-nav-item');

    if (panes.length > 0) {
        panes.forEach(p => p.classList.remove('active'));
        sidebarBtns.forEach(b => b.classList.remove('active'));

        const target = document.getElementById('tab-' + tabName);
        if (target) target.classList.add('active');
        if (clickedBtn) clickedBtn.classList.add('active');
        return;
    }

    // Legacy fallback: .tab + .tab-content
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('current'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('current'));
    document.querySelectorAll('.tab').forEach(t => {
        if (t.textContent.toLowerCase().trim() === tabName.toLowerCase()) t.classList.add('current');
    });
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) tabContent.classList.add('current');
}

// Photo Upload Handler - FIXED VERSION
function setupPhotoUpload() {
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            console.log('Photo selected:', file.name, file.type, file.size);
            
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
            reader.onload = async function(readerEvent) {
                const photoURL = readerEvent.target.result;
                console.log('Photo converted to base64, length:', photoURL.length);
                
                try {
                    const user = auth.currentUser;
                    if (!user) {
                        throw new Error('No user logged in');
                    }
                    
                    console.log('Updating Firebase profile...');
                    // Update Firebase profile
                    await updateProfile(user, {
                        photoURL: photoURL
                    });
                    console.log('Firebase profile updated successfully');
                    
                    // CRITICAL: Save to localStorage IMMEDIATELY
                    try {
                        localStorage.setItem('profilePhoto', photoURL);
                        localStorage.setItem('userPhotoURL', photoURL);
                        console.log('Photo saved to localStorage');
                    } catch (storageError) {
                        console.error('localStorage save failed:', storageError);
                    }
                    
                    // Update profile page photo
                    const container = document.querySelector('.profile-photo-container');
                    if (container) {
                        container.innerHTML = `
                            <img class="profile-photo" src="${photoURL}" alt="Profile Photo">
                            <label for="photo-input" class="photo-overlay"></label>
                            <input type="file" id="photo-input" accept="image/*">
                        `;
                        setupPhotoUpload(); // Re-attach listener
                        console.log('Profile page photo updated');
                    }
                    
                    // Update nav dropdown photo
                    updateNavPhoto(photoURL);
                    console.log('Nav photo updated');
                    
                    showMessage('Profile photo updated successfully!', 'success');
                } catch (error) {
                    console.error('Error updating profile photo:', error);
                    showMessage('Error updating photo: ' + error.message, 'error');
                }
            };
            
            reader.onerror = function(error) {
                console.error('FileReader error:', error);
                showMessage('Error reading file', 'error');
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Load saved photo - FIXED VERSION
function loadSavedPhoto(user) {
    try {
        console.log('Loading saved photo...');
        let photoURL = null;
        
        // Priority 1: Firebase photoURL
        if (user && user.photoURL) {
            console.log('Found Firebase photoURL');
            photoURL = user.photoURL;
        } 
        // Priority 2: localStorage
        else {
            const savedPhoto = localStorage.getItem('profilePhoto') || localStorage.getItem('userPhotoURL');
            if (savedPhoto) {
                console.log('Found localStorage photo');
                photoURL = savedPhoto;
            }
        }
        
        if (photoURL) {
            console.log('Displaying photo, length:', photoURL.length);
            const container = document.querySelector('.profile-photo-container');
            if (container) {
                container.innerHTML = `
                    <img class="profile-photo" src="${photoURL}" alt="Profile Photo">
                    <label for="photo-input" class="photo-overlay"></label>
                    <input type="file" id="photo-input" accept="image/*">
                `;
                setupPhotoUpload();
                updateNavPhoto(photoURL);
            }
        } else {
            console.log('No photo found, keeping initials');
            setupPhotoUpload(); // Still need to attach the upload listener
        }
    } catch (e) {
        console.error('Error loading photo:', e);
        setupPhotoUpload();
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

// Show Message — works in both old #settings-message and new toast system
function showMessage(text, type) {
    // Try new toast first
    if (typeof showProfileToast === 'function') {
        showProfileToast(text, type);
        return;
    }
    // Legacy fallback
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
        const saved = localStorage.getItem('userProgress');
        const userProgress = saved ? JSON.parse(saved) : {
            eventsAttended: 0,
            volunteeredHours: 0
        };
        
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
        
        let earnedCount = 0;
        badges.forEach(badge => {
            const progress = badge.progressKey === 'isFoundingMember' 
                ? (userProgress[badge.progressKey] ? 1 : 0)
                : (userProgress[badge.progressKey] || 0);
            if (progress >= badge.required) earnedCount++;
        });
        
        const totalBadges = badges.length;
        const completionPercent = Math.round((earnedCount / totalBadges) * 100);
        const remainingBadges = totalBadges - earnedCount;
        const eventsAttended = userProgress.eventsAttended || 0;
        const hours = userProgress.volunteeredHours || 0;

        // ── New sidebar stats ──
        const statEvents = document.getElementById('stat-events');
        const statBadges = document.getElementById('stat-badges');
        const statHours  = document.getElementById('stat-hours');
        if (statEvents) statEvents.textContent = eventsAttended;
        if (statBadges) statBadges.textContent = earnedCount;
        if (statHours)  statHours.textContent  = hours + 'h';

        // ── New progress bar ──
        const bar   = document.getElementById('badge-progress-bar');
        const label = document.getElementById('badge-progress-label');
        if (bar)   bar.style.width = completionPercent + '%';
        if (label) label.textContent = `${earnedCount} of ${totalBadges} badges earned (${completionPercent}%)`;

        // ── Legacy stat cards (old layout fallback) ──
        const profileStatCards = document.querySelectorAll('.stats-grid .stat-card');
        if (profileStatCards.length >= 3) {
            profileStatCards[0].querySelector('.stat-number').textContent = eventsAttended;
            profileStatCards[1].querySelector('.stat-number').textContent = earnedCount;
            profileStatCards[2].querySelector('.stat-number').textContent = hours + 'h';
        }
        
        const activityInfoCards = document.querySelectorAll('#activity-tab .stats-grid .info-card');
        if (activityInfoCards.length >= 3) {
            activityInfoCards[0].querySelector('.info-card-value').textContent = earnedCount + ' Badges';
            activityInfoCards[1].querySelector('.info-card-value').textContent = completionPercent + '%';
            activityInfoCards[2].querySelector('.info-card-value').textContent = remainingBadges + ' More';
        }
        
    } catch (e) {
        console.error('Error loading badge statistics:', e);
    }
}

// Load recent activity from completed events
function loadRecentActivity() {
    try {
        const completedEventsIds = JSON.parse(localStorage.getItem('completedEvents') || '[]');
        const eventsData = window.eventsData || [];
        
        const completedEvents = eventsData
            .filter(event => completedEventsIds.includes(event.id))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // ── New activity-list div ──
        const newList = document.getElementById('activity-list');
        if (newList) {
            if (completedEvents.length === 0) {
                newList.innerHTML = `
                    <div class="activity-empty">
                        <i class="fas fa-seedling"></i>
                        <p>No activity yet — start attending events!</p>
                        <a href="events.html" class="settings-btn" style="text-decoration:none;display:inline-block;margin-top:1rem;">
                            Browse Events →
                        </a>
                    </div>`;
            } else {
                newList.innerHTML = completedEvents.map(event => {
                    const icon = event.badgeProgress?.volunteeredHours > 0 ? 'fa-hands-helping' : 'fa-calendar-check';
                    const meta = event.badgeProgress?.volunteeredHours > 0
                        ? `Volunteered • ${event.badgeProgress.volunteeredHours} hrs`
                        : `Attended • ${event.date}`;
                    return `
                        <div class="activity-item">
                            <div class="activity-icon"><i class="fas ${icon}"></i></div>
                            <div class="activity-details">
                                <div class="activity-title">${event.title}</div>
                                <div class="activity-meta">${meta}</div>
                            </div>
                        </div>`;
                }).join('');
            }
        }

        // ── Legacy: old #activity-tab .settings-section ──
        const activitySection = document.querySelector('#activity-tab .settings-section');
        if (activitySection) {
            let html = '<h2>Recent Activity</h2>';
            if (completedEvents.length === 0) {
                html += `<div class="info-card"><div class="info-card-value">No activities yet</div>
                    <div class="toggle-description" style="margin-top:8px;">Complete events to see your activity here!</div></div>`;
            } else {
                completedEvents.forEach(event => {
                    const activityType = event.badgeProgress?.volunteeredHours > 0
                        ? `Volunteered • ${event.badgeProgress.volunteeredHours} hours` : 'Attended';
                    html += `<div class="info-card" style="margin-bottom:15px;">
                        <div class="info-card-label">${event.date}</div>
                        <div class="info-card-value">${event.title}</div>
                        <div class="toggle-description" style="margin-top:8px;">${activityType}</div>
                    </div>`;
                });
            }
            activitySection.innerHTML = html;
        }
        
    } catch (e) {
        console.error('Error loading recent activity:', e);
    }
}

// Load user data from Firebase
function loadUserData() {
    const user = auth.currentUser;
    
    if (user) {
        const userName = user.displayName || user.email.split('@')[0];
        const userEmail = user.email;
        const memberSince = user.metadata.creationTime;
        
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
        
        updateInitialsDisplay(userName);
        
        const nameInput = document.getElementById('new-name');
        if (nameInput) {
            nameInput.placeholder = userName;
        }
        
        loadSavedPhoto(user);
    }
}

// ===== TOAST NOTIFICATION =====
function showProfileToast(message, type = 'success') {
    const existing = document.getElementById('profile-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'profile-toast';
    const bg = type === 'success'
        ? 'linear-gradient(135deg,#10b981,#059669)'
        : type === 'error'
        ? 'linear-gradient(135deg,#ef4444,#dc2626)'
        : 'linear-gradient(135deg,#2563eb,#3b82f6)';
    toast.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;background:${bg};color:white;
        padding:1rem 1.5rem;border-radius:12px;font-family:'Open Sans',sans-serif;
        font-size:.95rem;font-weight:600;display:flex;align-items:center;gap:.75rem;
        box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:99999;max-width:340px;
        animation:toastIn .3s cubic-bezier(.175,.885,.32,1.275) both;
    `;
    if (!document.getElementById('profile-toast-styles')) {
        const s = document.createElement('style');
        s.id = 'profile-toast-styles';
        s.textContent = `
            @keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes toastOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(20px) scale(.95)}}
            @media(max-width:480px){#profile-toast{right:1rem;left:1rem;max-width:calc(100% - 2rem);bottom:1rem}}
        `;
        document.head.appendChild(s);
    }
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut .3s ease forwards';
        setTimeout(() => toast.remove(), 320);
    }, 4000);
}

// Save notification preferences
function saveNotificationPreferences() {
    try {
        const emailNotif = document.getElementById('email-notif')?.checked ?? true;
        const eventReminders = document.getElementById('event-reminders')?.checked ?? true;
        const newsletter = document.getElementById('newsletter')?.checked ?? false;
        localStorage.setItem('notif_email', emailNotif);
        localStorage.setItem('notif_events', eventReminders);
        localStorage.setItem('notif_newsletter', newsletter);
    } catch (e) {
        console.error('Error saving preferences:', e);
    }
}

// Save with user-visible toast feedback
window.saveNotificationPreferencesWithFeedback = async function () {
    saveNotificationPreferences();

    // Handle browser push notification toggle
    const pushToggle = document.getElementById('push-notif');
    if (pushToggle && pushToggle.checked) {
        await requestPushPermission();
    } else if (pushToggle && !pushToggle.checked) {
        localStorage.setItem('notif_push', 'false');
    }

    showProfileToast('Notification preferences saved!', 'success');
};

// Request browser push notification permission
async function requestPushPermission() {
    if (!('Notification' in window)) {
        showProfileToast('Your browser doesn\'t support push notifications.', 'info');
        const toggle = document.getElementById('push-notif');
        if (toggle) toggle.checked = false;
        return;
    }

    if (Notification.permission === 'granted') {
        localStorage.setItem('notif_push', 'true');
        updatePushUI('granted');
        return;
    }

    if (Notification.permission === 'denied') {
        showProfileToast('Push notifications are blocked. Please enable them in your browser settings.', 'error');
        const toggle = document.getElementById('push-notif');
        if (toggle) toggle.checked = false;
        updatePushUI('denied');
        return;
    }

    // Ask for permission
    const permission = await Notification.requestPermission();
    localStorage.setItem('notif_push', permission === 'granted' ? 'true' : 'false');
    updatePushUI(permission);

    if (permission === 'granted') {
        // Send a test notification so user sees it working
        new Notification('NextStep Notifications Enabled! 🎉', {
            body: 'You\'ll now get alerts when new civic events are posted.',
            icon: 'images/logo.png'
        });
    } else {
        const toggle = document.getElementById('push-notif');
        if (toggle) toggle.checked = false;
        showProfileToast('Push notifications were not enabled.', 'info');
    }
}

function updatePushUI(permissionState) {
    const desc = document.getElementById('push-notif-desc');
    if (!desc) return;
    if (permissionState === 'granted') {
        desc.textContent = '✓ Push notifications are active';
        desc.style.color = '#10b981';
    } else if (permissionState === 'denied') {
        desc.textContent = '✕ Blocked — enable in browser settings';
        desc.style.color = '#ef4444';
    } else {
        desc.textContent = 'Allow alerts when new events are posted';
        desc.style.color = '';
    }
}

// Load notification preferences
function loadNotificationPreferences() {
    try {
        const emailNotif = localStorage.getItem('notif_email');
        const eventReminders = localStorage.getItem('notif_events');
        const newsletter = localStorage.getItem('notif_newsletter');
        const pushPref = localStorage.getItem('notif_push');

        if (emailNotif !== null) {
            const el = document.getElementById('email-notif');
            if (el) el.checked = emailNotif === 'true';
        }
        if (eventReminders !== null) {
            const el = document.getElementById('event-reminders');
            if (el) el.checked = eventReminders === 'true';
        }
        if (newsletter !== null) {
            const el = document.getElementById('newsletter');
            if (el) el.checked = newsletter === 'true';
        }

        // Push toggle
        const pushToggle = document.getElementById('push-notif');
        if (pushToggle) {
            if (!('Notification' in window)) {
                // Hide push row if not supported
                const row = document.getElementById('push-notif-row');
                if (row) row.style.display = 'none';
            } else {
                // Reflect current browser permission
                if (Notification.permission === 'granted') {
                    pushToggle.checked = true;
                    localStorage.setItem('notif_push', 'true');
                    updatePushUI('granted');
                } else if (Notification.permission === 'denied') {
                    pushToggle.checked = false;
                    updatePushUI('denied');
                } else {
                    pushToggle.checked = pushPref === 'true';
                }
            }
        }
    } catch (e) {
        console.error('Error loading preferences:', e);
    }
}

// Setup notification toggles (auto-save on change, except push which needs explicit save)
function setupNotificationToggles() {
    ['email-notif', 'event-reminders', 'newsletter'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.addEventListener('change', saveNotificationPreferences);
    });
}

// Check URL hash for direct tab access
function checkURLHash() {
    const hash = window.location.hash.substring(1);
    const validTabs = ['overview', 'settings', 'notifications', 'activity',
                       'profile', 'activity']; // legacy names too
    if (hash && validTabs.includes(hash)) {
        // Map legacy names to new names
        const nameMap = { profile: 'overview' };
        const target = nameMap[hash] || hash;
        const btn = document.querySelector(`.sidebar-nav-item[data-tab="${target}"]`);
        switchTab(target, btn);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page initializing...');
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserData();
            loadBadgeStatistics();
            loadRecentActivity();
            loadNotificationPreferences();
            setupNotificationToggles();
            checkURLHash();
            
            console.log('Profile page initialized successfully');
        } else {
            window.location.href = 'login.html';
        }
    });
});

window.addEventListener('hashchange', checkURLHash);

window.switchTab = switchTab;
window.updateAccountName = updateAccountName;
window.updateUserPassword = updateUserPassword;
window.logoutUser = logoutUser;