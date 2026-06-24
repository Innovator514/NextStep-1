// Profile page JavaScript - Fixed Photo Upload with Full Persistence

import { getAuth, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { initNotifications, markAllRead, destroyNotifications } from './notifications.js';
import { kitSubscribe, kitUnsubscribe } from './notifications-email.js';
import { syncMemberRecord } from './member-sync.js';

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
                            <div class="avatar-notif-dot" id="avatar-notif-dot" title="You have unread notifications"></div>
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
                    <div class="avatar-notif-dot" id="avatar-notif-dot" title="You have unread notifications"></div>
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
    destroyNotifications();
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
        const statStreak = document.getElementById('stat-streak');
        if (statEvents) statEvents.textContent = eventsAttended;
        if (statBadges) statBadges.textContent = earnedCount;
        if (statHours)  statHours.textContent  = hours + 'h';
        if (statStreak) statStreak.textContent = (userProgress.currentStreak || 0) + 'd';

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
        const emailRegistration = document.getElementById('email-registration')?.checked ?? true;
        const eventReminders = document.getElementById('event-reminders')?.checked ?? true;
        const newsletter = document.getElementById('newsletter')?.checked ?? false;
        // Always save to localStorage as fast local cache
        localStorage.setItem('notif_email', emailNotif);
        localStorage.setItem('notif_email_registration', emailRegistration);
        localStorage.setItem('notif_events', eventReminders);
        localStorage.setItem('notif_newsletter', newsletter);
        // Also sync to Firestore if logged in
        syncNotifToFirestore({ emailNotif, emailRegistration, eventReminders, newsletter });
        // Keep the Kit (ConvertKit) newsletter list in sync with the toggle
        syncNewsletterWithKit(newsletter);
    } catch (e) {
        console.error('Error saving preferences:', e);
    }
}

// Subscribe/unsubscribe the current user's email from the Kit newsletter list
async function syncNewsletterWithKit(newsletterEnabled) {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) return;
        const firstName = (user.displayName || '').split(' ')[0] || '';
        if (newsletterEnabled) {
            await kitSubscribe(user.email, firstName, { source: 'profile-settings' });
        } else {
            await kitUnsubscribe(user.email);
        }
    } catch (e) {
        console.warn('Kit newsletter sync error:', e);
    }
}

// Sync notification preferences to Firestore
async function syncNotifToFirestore(prefs) {
    try {
        const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const auth = window.firebaseAuth;
        if (!auth || !auth.currentUser) return;
        const db = getFirestore();
        await setDoc(
            doc(db, 'users', auth.currentUser.uid, 'settings', 'notifications'),
            { ...prefs, updatedAt: Date.now() },
            { merge: true }
        );
    } catch (e) {
        console.warn('Could not sync notification prefs to Firestore:', e);
    }
}

// Load notification preferences from Firestore (falls back to localStorage)
async function loadNotifFromFirestore() {
    try {
        const auth = window.firebaseAuth;
        if (!auth || !auth.currentUser) return;
        const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'notifications'));
        if (snap.exists()) {
            const data = snap.data();
            // Update localStorage cache
            if (data.emailNotif !== undefined) localStorage.setItem('notif_email', data.emailNotif);
            if (data.emailRegistration !== undefined) localStorage.setItem('notif_email_registration', data.emailRegistration);
            if (data.eventReminders !== undefined) localStorage.setItem('notif_events', data.eventReminders);
            if (data.newsletter !== undefined) localStorage.setItem('notif_newsletter', data.newsletter);
            // Update UI toggles
            const emailEl = document.getElementById('email-notif');
            const emailRegEl = document.getElementById('email-registration');
            const eventsEl = document.getElementById('event-reminders');
            const newsletterEl = document.getElementById('newsletter');
            if (emailEl && data.emailNotif !== undefined) emailEl.checked = data.emailNotif;
            if (emailRegEl && data.emailRegistration !== undefined) emailRegEl.checked = data.emailRegistration;
            if (eventsEl && data.eventReminders !== undefined) eventsEl.checked = data.eventReminders;
            if (newsletterEl && data.newsletter !== undefined) newsletterEl.checked = data.newsletter;
        }
    } catch (e) {
        console.warn('Could not load notification prefs from Firestore:', e);
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
        const emailRegistration = localStorage.getItem('notif_email_registration');
        const eventReminders = localStorage.getItem('notif_events');
        const newsletter = localStorage.getItem('notif_newsletter');
        const pushPref = localStorage.getItem('notif_push');

        if (emailNotif !== null) {
            const el = document.getElementById('email-notif');
            if (el) el.checked = emailNotif === 'true';
        }
        if (emailRegistration !== null) {
            const el = document.getElementById('email-registration');
            if (el) el.checked = emailRegistration === 'true';
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
    // Also load from Firestore (will update UI when ready)
    loadNotifFromFirestore();
}

// Setup notification toggles (auto-save on change, except push which needs explicit save)
function setupNotificationToggles() {
    ['email-notif', 'email-registration', 'event-reminders', 'newsletter'].forEach(id => {
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
            syncMemberRecord(user);
            loadUserData();
            loadBadgeStatistics();
            loadRecentActivity();
            loadNotificationPreferences();
            setupNotificationToggles();
            checkURLHash();

            // Start real-time in-app notifications (inbox, badges, avatar dot)
            initNotifications(user.uid);

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
// ═══════════════════════════════════════════════════
// ENHANCED PROFILE PAGE — Additional Functionality
// ═══════════════════════════════════════════════════

// ── Overview stat cards ──
function updateOverviewStats() {
    try {
        const saved = localStorage.getItem('userProgress');
        const p = saved ? JSON.parse(saved) : {};
        const events = p.eventsAttended || 0;
        const hours  = p.volunteeredHours || 0;
        const streak = p.currentStreak || 0;

        // Badge count
        const badges = [1,5,10,25,1,10,50,1,3,5,3,1,3,5,1,1,3,5,25,10]; // required counts
        const keys   = ['eventsAttended','eventsAttended','eventsAttended','eventsAttended',
                        'volunteeredHours','volunteeredHours','volunteeredHours',
                        'townHallSpeeches','environmentalEvents','youthEvents',
                        'innovationSummits','earlyRegistrations','consecutiveMonths',
                        'friendsInvited','isFoundingMember','eventsCreated',
                        'electionsVoted','serviceProjects','networkConnections','sustainabilityInitiatives'];
        let earned = 0;
        badges.forEach((req, i) => {
            const val = keys[i] === 'isFoundingMember' ? (p[keys[i]] ? 1 : 0) : (p[keys[i]] || 0);
            if (val >= req) earned++;
        });

        // Update overview stat row
        const n = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        n('ov-events-n',  events);
        n('ov-streak-n',  streak ? streak + 'd' : '0d');
        n('ov-badges-n',  earned);
        n('ov-hours-n',   hours + 'h');

        // Update sidebar streak
        const statStreak = document.getElementById('stat-streak');
        if (statStreak) statStreak.textContent = streak ? streak + 'd' : '0';

        // Update activity tab summary
        n('act-total-events',   events);
        n('act-total-hours',    hours + 'h');
        n('act-longest-streak', (p.longestStreak || streak) + 'd');
        n('act-badges-earned',  earned);

        // Render recent achievements
        renderRecentAchievements(p, earned);

    } catch (e) {
        console.error('updateOverviewStats error:', e);
    }
}

// ── Achievement chips ──
const ACHIEVEMENT_DEFS = [
    { key: 'eventsAttended', req: 1,  icon: 'fa-calendar-check', label: 'First Step' },
    { key: 'eventsAttended', req: 5,  icon: 'fa-calendar-check', label: 'Regular' },
    { key: 'eventsAttended', req: 10, icon: 'fa-calendar-check', label: 'Committed' },
    { key: 'volunteeredHours', req: 1, icon: 'fa-hands-helping', label: 'Volunteer' },
    { key: 'volunteeredHours', req: 10, icon: 'fa-hands-helping', label: 'Service Pro' },
    { key: 'townHallSpeeches', req: 1, icon: 'fa-microphone', label: 'Spoke Up' },
    { key: 'consecutiveMonths', req: 3, icon: 'fa-fire', label: '3-Month Streak' },
    { key: 'isFoundingMember', req: 1, icon: 'fa-star', label: 'Founding Member' },
];

function renderRecentAchievements(progress, earnedCount) {
    const container = document.getElementById('recent-achievements');
    if (!container) return;

    const earned = ACHIEVEMENT_DEFS.filter(a => {
        const val = a.key === 'isFoundingMember' ? (progress[a.key] ? 1 : 0) : (progress[a.key] || 0);
        return val >= a.req;
    });

    if (earned.length === 0) {
        container.innerHTML = `<div class="ov-achievement-empty"><i class="fas fa-star"></i><span>Attend your first event to earn achievements!</span></div>`;
        return;
    }

    // Show up to 6 most recent (last in list = most recently defined)
    container.innerHTML = earned.slice(-6).reverse().map(a =>
        `<div class="achievement-chip"><i class="fas ${a.icon}"></i>${a.label}</div>`
    ).join('');
}

// ── Activity from Firestore ──
async function loadActivityFromFirestore() {
    const listEl = document.getElementById('activity-list');
    if (!listEl) return;

    try {
        const auth = window.firebaseAuth;
        if (!auth || !auth.currentUser) {
            renderActivityFallback(listEl);
            return;
        }

        const { getFirestore, collection, query, orderBy, limit, getDocs } =
            await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const uid = auth.currentUser.uid;

        // Try to fetch from users/{uid}/attendance subcollection
        const q = query(
            collection(db, 'users', uid, 'attendance'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        const snap = await getDocs(q);

        let items = [];
        snap.forEach(doc => {
            const d = doc.data();
            items.push({
                id: doc.id,
                title: d.eventTitle || d.title || 'Event',
                date: d.date || d.eventDate || null,
                timestamp: d.timestamp?.toDate?.() || new Date(d.date || Date.now()),
                type: d.volunteeredHours > 0 ? 'volunteer' : 'attended',
                hours: d.volunteeredHours || 0,
                location: d.location || '',
                category: d.category || '',
            });
        });

        if (items.length === 0) {
            // Fallback to localStorage
            renderActivityFallback(listEl);
            return;
        }

        window._allActivityItems = items;
        renderActivityItems(items, listEl);
        updateActivitySummaryFromItems(items);

        // Also render preview on Overview tab
        renderOverviewActivityPreview(items.slice(0, 3));

    } catch (e) {
        console.warn('Firestore activity load failed, using localStorage fallback:', e);
        renderActivityFallback(listEl);
    }
}

function renderActivityFallback(listEl) {
    // Use existing localStorage approach
    try {
        const completedEventsIds = JSON.parse(localStorage.getItem('completedEvents') || '[]');
        const eventsData = window.eventsData || [];
        const items = eventsData
            .filter(ev => completedEventsIds.includes(ev.id))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(ev => ({
                id: ev.id,
                title: ev.title,
                date: ev.date,
                timestamp: new Date(ev.date),
                type: (ev.badgeProgress?.volunteeredHours > 0) ? 'volunteer' : 'attended',
                hours: ev.badgeProgress?.volunteeredHours || 0,
                location: ev.location || '',
                category: ev.category || '',
            }));

        window._allActivityItems = items;

        if (items.length === 0) {
            listEl.innerHTML = `
                <div class="activity-empty">
                    <i class="fas fa-seedling"></i>
                    <p>No activity yet — start attending events!</p>
                    <a href="events.html" class="settings-btn" style="text-decoration:none;display:inline-block;margin-top:1rem;">Browse Events →</a>
                </div>`;
        } else {
            renderActivityItems(items, listEl);
            updateActivitySummaryFromItems(items);
            renderOverviewActivityPreview(items.slice(0, 3));
        }
    } catch (e) {
        console.error('Activity fallback error:', e);
        listEl.innerHTML = `<div class="activity-empty"><i class="fas fa-seedling"></i><p>No activity yet.</p></div>`;
    }
}

function renderActivityItems(items, container) {
    if (!container) return;
    if (items.length === 0) {
        container.innerHTML = `<div class="activity-empty"><i class="fas fa-seedling"></i><p>No activity matches this filter.</p></div>`;
        return;
    }
    container.innerHTML = items.map(item => {
        const dateStr = item.timestamp
            ? item.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : (item.date || '');
        const icon = item.type === 'volunteer' ? 'fa-hands-helping' : 'fa-calendar-check';
        const chipClass = item.type === 'volunteer' ? 'type-volunteer' : 'type-event';
        const chipLabel = item.type === 'volunteer' ? `Volunteered · ${item.hours}h` : 'Attended';
        const meta = [item.location, item.category].filter(Boolean).join(' · ');

        return `<div class="activity-item" data-type="${item.type}">
            <div class="activity-icon"><i class="fas ${icon}"></i></div>
            <div class="activity-details">
                <div class="activity-item-date">${dateStr}</div>
                <div class="activity-title">${item.title}</div>
                ${meta ? `<div class="activity-meta">${meta}</div>` : ''}
                <span class="activity-type-chip ${chipClass}"><i class="fas ${icon}"></i>${chipLabel}</span>
            </div>
        </div>`;
    }).join('');
}

function updateActivitySummaryFromItems(items) {
    const events = items.filter(i => i.type !== 'badge').length;
    const hours  = items.reduce((s, i) => s + (i.hours || 0), 0);
    const n = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    n('act-total-events', events);
    n('act-total-hours',  hours + 'h');
}

function renderOverviewActivityPreview(items) {
    const container = document.getElementById('ov-recent-activity');
    if (!container) return;
    if (items.length === 0) {
        container.innerHTML = `<div class="activity-empty"><i class="fas fa-seedling"></i><p>No activity yet.</p></div>`;
        return;
    }
    renderActivityItems(items, container);
}

// ── Activity filter ──
window.filterActivity = function(filter, btn) {
    document.querySelectorAll('.activity-filter').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const all = window._allActivityItems || [];
    const filtered = filter === 'all' ? all : all.filter(i => i.type === filter);
    renderActivityItems(filtered, document.getElementById('activity-list'));
};

// ── Theme preferences ──
window.setTheme = function(theme) {
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('theme-' + theme);
    if (btn) btn.classList.add('active');

    localStorage.setItem('themePreference', theme);

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
    }
    showProfileToast('Appearance updated', 'success');
};

function loadThemePreference() {
    const saved = localStorage.getItem('themePreference') || 'system';
    const btn = document.getElementById('theme-' + saved);
    if (btn) btn.classList.add('active');
}

// ── Privacy settings ──
window.savePrivacySettings = function() {
    const prefs = {
        leaderboard: document.getElementById('privacy-leaderboard')?.checked ?? true,
        attendance:  document.getElementById('privacy-attendance')?.checked ?? true,
        analytics:   document.getElementById('privacy-analytics')?.checked ?? true,
    };
    localStorage.setItem('privacySettings', JSON.stringify(prefs));
    syncPrivacyToFirestore(prefs);
    showProfileToast('Privacy settings saved', 'success');
};

async function syncPrivacyToFirestore(prefs) {
    try {
        const auth = window.firebaseAuth;
        if (!auth?.currentUser) return;
        const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'privacy'), prefs, { merge: true });
    } catch (e) { console.warn('Privacy sync error:', e); }
}

function loadPrivacySettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('privacySettings') || '{}');
        const s = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.checked = val; };
        s('privacy-leaderboard', saved.leaderboard ?? true);
        s('privacy-attendance',  saved.attendance  ?? true);
        s('privacy-analytics',   saved.analytics   ?? true);
    } catch (e) {}
}

// ── Delete account modal ──
window.confirmDeleteAccount = function() {
    const modal = document.getElementById('delete-modal');
    if (modal) { modal.style.display = 'flex'; }
};

window.closeDeleteModal = function() {
    const modal = document.getElementById('delete-modal');
    if (modal) { modal.style.display = 'none'; }
    const input = document.getElementById('delete-confirm-input');
    if (input) input.value = '';
};

window.executeDeleteAccount = async function() {
    const input = document.getElementById('delete-confirm-input');
    if (!input || input.value.trim() !== 'DELETE') {
        showProfileToast('Type DELETE exactly to confirm', 'error');
        return;
    }
    try {
        const user = auth.currentUser;
        if (!user) return;
        // Delete Firestore data
        const { getFirestore, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        await deleteDoc(doc(db, 'users', user.uid));
        // Delete auth user
        await user.delete();
        localStorage.clear();
        window.location.href = 'index.html';
    } catch (e) {
        if (e.code === 'auth/requires-recent-login') {
            showProfileToast('Please log out and back in before deleting your account', 'error');
        } else {
            showProfileToast('Error: ' + e.message, 'error');
        }
    }
};

// ── Notification inbox ──
// The inbox itself (rendering, real-time updates, read/unread, expandable
// detail drawer, badge counts) is fully handled by notifications.js, which is
// started via initNotifications(uid) in the auth.onAuthStateChanged handler
// above. "Mark all read" below delegates to that same module.
window.markAllNotificationsRead = function () {
    markAllRead().then(() => {
        showProfileToast('All notifications marked as read', 'success');
    });
};

// ── Hook into existing DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', function() {
    // These run after auth is confirmed (auth.onAuthStateChanged triggers loadUserData etc.)
    // We extend by observing auth state ourselves for the new features
    const authObj = window.firebaseAuth || auth;
    if (authObj && authObj.onAuthStateChanged) {
        authObj.onAuthStateChanged((user) => {
            if (user) {
                updateOverviewStats();
                loadActivityFromFirestore();
                loadThemePreference();
                loadPrivacySettings();
            }
        });
    } else {
        // Fallback: run after short delay
        setTimeout(() => {
            updateOverviewStats();
            loadActivityFromFirestore();
            loadThemePreference();
            loadPrivacySettings();
        }, 800);
    }
});