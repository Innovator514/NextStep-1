// ============================================================
//  badges.js  —  Badge system + Streak engine for NextStep
// ============================================================

// ── User progress ───────────────────────────────────────────
let userProgress = {
    eventsAttended: 0,
    volunteeredHours: 0,
    townHallSpeeches: 0,
    environmentalEvents: 0,
    youthEvents: 0,
    innovationSummits: 0,
    earlyRegistrations: 0,
    consecutiveMonths: 0,
    friendsInvited: 0,
    isFoundingMember: false,
    eventsCreated: 0,
    electionsVoted: 0,
    serviceProjects: 0,
    networkConnections: 0,
    sustainabilityInitiatives: 0,
    currentStreak: 0,
    longestStreak: 0
};

function loadUserProgress() {
    const saved = localStorage.getItem('userProgress');
    if (saved) userProgress = { ...userProgress, ...JSON.parse(saved) };
}

function saveUserProgress() {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

// ── Badge definitions ───────────────────────────────────────
const badges = [
    { id: 1,  name: "First Step",         description: "Attended your first civic event",              icon: '<img src="https://cdn-icons-png.flaticon.com/128/599/599224.png"   alt="First Step">',        category: "milestone",     progressKey: "eventsAttended",            required: 1   },
    { id: 2,  name: "Active Citizen",      description: "Attended 5 civic events",                      icon: '<img src="https://cdn-icons-png.flaticon.com/128/956/956100.png"   alt="Active Citizen">',    category: "participation", progressKey: "eventsAttended",            required: 5   },
    { id: 3,  name: "Community Champion",  description: "Attended 10 civic events",                     icon: '<img src="https://cdn-icons-png.flaticon.com/128/2827/2827957.png" alt="Champion">',          category: "participation", progressKey: "eventsAttended",            required: 10  },
    { id: 4,  name: "Civic Hero",          description: "Attended 25 civic events",                     icon: '<img src="https://cdn-icons-png.flaticon.com/128/4766/4766834.png" alt="Civic Hero">',        category: "participation", progressKey: "eventsAttended",            required: 25  },
    { id: 5,  name: "Volunteer",           description: "Volunteered at your first event",              icon: '<img src="https://cdn-icons-png.flaticon.com/128/10729/10729191.png" alt="Volunteer">',       category: "participation", progressKey: "volunteeredHours",          required: 1   },
    { id: 6,  name: "Helping Hand",        description: "Volunteered 10 hours",                         icon: '<img src="https://cdn-icons-png.flaticon.com/128/10845/10845170.png" alt="Helping Hand">',    category: "impact",        progressKey: "volunteeredHours",          required: 10  },
    { id: 7,  name: "Time Champion",       description: "Volunteered 50 hours",                         icon: '<img src="https://cdn-icons-png.flaticon.com/128/14118/14118953.png" alt="Time Champion">',   category: "impact",        progressKey: "volunteeredHours",          required: 50  },
    { id: 8,  name: "Voice of Change",     description: "Spoke at a town hall meeting",                 icon: '<img src="https://cdn-icons-png.flaticon.com/128/2168/2168463.png" alt="Voice">',             category: "leadership",    progressKey: "townHallSpeeches",          required: 1   },
    { id: 9,  name: "Earth Guardian",      description: "Participated in 3 environmental events",       icon: '<img src="https://cdn-icons-png.flaticon.com/128/8635/8635653.png" alt="Earth Guardian">',    category: "impact",        progressKey: "environmentalEvents",       required: 3   },
    { id: 10, name: "Youth Leader",        description: "Attended 5 youth-focused events",              icon: '<img src="https://cdn-icons-png.flaticon.com/128/1344/1344761.png" alt="Youth Leader">',      category: "leadership",    progressKey: "youthEvents",               required: 5   },
    { id: 11, name: "Tech Innovator",      description: "Attended 3 innovation summits",                icon: '<img src="https://cdn-icons-png.flaticon.com/128/11995/11995575.png" alt="Tech Innovator">',  category: "participation", progressKey: "innovationSummits",         required: 3   },
    { id: 12, name: "Early Bird",          description: "Registered for an event 1 month in advance",  icon: '<img src="https://cdn-icons-png.flaticon.com/128/1230/1230870.png" alt="Early Bird">',        category: "milestone",     progressKey: "earlyRegistrations",        required: 1   },
    { id: 13, name: "Streak Master",       description: "Attended events for 3 consecutive months",     icon: '<img src="https://cdn-icons-png.flaticon.com/128/14261/14261136.png" alt="Streak Master">',   category: "milestone",     progressKey: "consecutiveMonths",         required: 3   },
    { id: 14, name: "Social Butterfly",    description: "Invited 5 friends to events",                  icon: '<img src="https://cdn-icons-png.flaticon.com/128/338/338337.png"  alt="Social Butterfly">',   category: "leadership",    progressKey: "friendsInvited",            required: 5   },
    { id: 15, name: "Founding Member",     description: "One of the first 100 users",                  icon: '<img src="https://cdn-icons-png.flaticon.com/128/616/616490.png"  alt="Founding Member">',    category: "milestone",     progressKey: "isFoundingMember",          required: 1   },
    { id: 16, name: "Community Builder",   description: "Created or organized a local event",           icon: '<img src="https://cdn-icons-png.flaticon.com/128/3079/3079652.png" alt="Community Builder">', category: "leadership",    progressKey: "eventsCreated",             required: 1   },
    { id: 17, name: "Democracy Champion",  description: "Voted in 3 local elections",                   icon: '<img src="https://cdn-icons-png.flaticon.com/128/3553/3553691.png" alt="Democracy">',         category: "participation", progressKey: "electionsVoted",            required: 3   },
    { id: 18, name: "Neighborhood Hero",   description: "Completed 5 community service projects",       icon: '<img src="https://cdn-icons-png.flaticon.com/128/2917/2917995.png" alt="Neighborhood Hero">', category: "impact",        progressKey: "serviceProjects",           required: 5   },
    { id: 19, name: "Super Connector",     description: "Networked with 25 community members",          icon: '<img src="https://cdn-icons-png.flaticon.com/128/681/681494.png"  alt="Super Connector">',    category: "leadership",    progressKey: "networkConnections",        required: 25  },
    { id: 20, name: "Sustainability Star", description: "Participated in 10 environmental initiatives", icon: '<img src="https://cdn-icons-png.flaticon.com/128/2990/2990970.png" alt="Sustainability">',    category: "impact",        progressKey: "sustainabilityInitiatives", required: 10  },
    // 🔥 Streak badges
    { id: 21, name: "Spark",           description: "Check in 3 days in a row",                 icon: '🔥',   category: "streak", progressKey: "currentStreak", required: 3   },
    { id: 22, name: "On Fire",         description: "Check in 7 days in a row",                 icon: '🔥🔥', category: "streak", progressKey: "currentStreak", required: 7   },
    { id: 23, name: "Week Warrior",    description: "Maintain a 14-day daily streak",           icon: '⚡',   category: "streak", progressKey: "currentStreak", required: 14  },
    { id: 24, name: "Monthly Legend",  description: "Keep your streak alive for 30 days",      icon: '🌟',   category: "streak", progressKey: "currentStreak", required: 30  },
    { id: 25, name: "Century Strong",  description: "Reach a 100-day daily check-in streak",   icon: '💯',   category: "streak", progressKey: "currentStreak", required: 100 },
];

// ── Badge helpers ────────────────────────────────────────────
function isBadgeEarned(badge) {
    return getBadgeProgress(badge) >= badge.required;
}

function getBadgeProgress(badge) {
    if (badge.progressKey === 'isFoundingMember') return userProgress.isFoundingMember ? 1 : 0;
    return userProgress[badge.progressKey] || 0;
}

// ============================================================
//  STREAK ENGINE
// ============================================================
const STREAK_KEY        = 'streakData';
const STREAK_MILESTONES = [3, 7, 14, 30, 100];

function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

function loadStreakData() {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastCheckin: null, history: [] };
    try { return JSON.parse(raw); } catch (e) { return { currentStreak: 0, longestStreak: 0, lastCheckin: null, history: [] }; }
}

function saveStreakData(data) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// Auto-reset streak if a day was skipped; called on every page load.
function reconcileStreak() {
    const data = loadStreakData();
    if (data.lastCheckin) {
        const gap = daysBetween(data.lastCheckin, todayStr());
        if (gap > 1) {
            data.currentStreak = 0;
            saveStreakData(data);
        }
    }
    return data;
}

// Returns { alreadyDone, newStreak, milestones[] }
function doCheckIn() {
    const data  = reconcileStreak();
    const today = todayStr();

    if (data.lastCheckin === today) {
        return { alreadyDone: true, newStreak: data.currentStreak, milestones: [] };
    }

    const gap = data.lastCheckin ? daysBetween(data.lastCheckin, today) : 1;
    data.currentStreak = (gap === 1) ? data.currentStreak + 1 : 1;
    data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    data.lastCheckin   = today;

    if (!Array.isArray(data.history)) data.history = [];
    data.history.push(today);
    if (data.history.length > 100) data.history = data.history.slice(-100);

    const prev       = data.currentStreak - 1;
    const milestones = STREAK_MILESTONES.filter(m => prev < m && data.currentStreak >= m);

    saveStreakData(data);

    userProgress.currentStreak = data.currentStreak;
    userProgress.longestStreak = data.longestStreak;
    saveUserProgress();

    return { alreadyDone: false, newStreak: data.currentStreak, milestones };
}

// ── Streak Banner UI ─────────────────────────────────────────
function renderStreakBanner() {
    const data  = reconcileStreak();
    const today = todayStr();
    const alreadyIn = data.lastCheckin === today;

    // Sync fields into userProgress for badge rendering
    userProgress.currentStreak = data.currentStreak;
    userProgress.longestStreak = data.longestStreak;

    const countEl = document.getElementById('streak-count');
    if (!countEl) return; // not on badges page

    document.getElementById('streak-count').textContent = data.currentStreak;
    document.getElementById('streak-best').textContent  = data.longestStreak;

    // Flame intensity
    const flameEl = document.getElementById('streak-flame-icon');
    if (flameEl) {
        if (data.currentStreak >= 30)     flameEl.textContent = '🔥🔥🔥';
        else if (data.currentStreak >= 7) flameEl.textContent = '🔥🔥';
        else                              flameEl.textContent = '🔥';
    }

    // Next-milestone hint
    const nextEl = document.getElementById('streak-next-milestone');
    if (nextEl) {
        const next = STREAK_MILESTONES.find(m => m > data.currentStreak);
        nextEl.textContent = next
            ? next - data.currentStreak + ' day' + (next - data.currentStreak !== 1 ? 's' : '') + ' until next reward'
            : '🏅 All streak badges earned!';
    }

    // 7-day dot calendar
    const dotsEl = document.getElementById('streak-dots');
    if (dotsEl) {
        dotsEl.innerHTML = '';
        for (let i = 6; i >= 0; i--) {
            const d  = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.getFullYear() + '-' +
                       String(d.getMonth() + 1).padStart(2, '0') + '-' +
                       String(d.getDate()).padStart(2, '0');
            const hit     = Array.isArray(data.history) && data.history.includes(ds);
            const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
            const dot = document.createElement('div');
            dot.className = 'streak-dot' + (hit ? ' active' : '');
            dot.innerHTML = '<span class="streak-dot-day">' + dayName + '</span>' +
                            '<span class="streak-dot-circle">' + (hit ? '✓' : '') + '</span>';
            dotsEl.appendChild(dot);
        }
    }

    // Button / confirmed message
    const btnEl = document.getElementById('streak-checkin-btn');
    const msgEl = document.getElementById('streak-checked-msg');
    if (alreadyIn) {
        if (btnEl) btnEl.style.display = 'none';
        if (msgEl) msgEl.style.display = 'block';
    } else {
        if (btnEl) btnEl.style.display = 'inline-flex';
        if (msgEl) msgEl.style.display = 'none';
    }
}

// Check-in button handler (called from HTML)
window.streakCheckIn = function () {
    const { alreadyDone, newStreak, milestones } = doCheckIn();
    if (alreadyDone) return;

    const btnEl   = document.getElementById('streak-checkin-btn');
    const msgEl   = document.getElementById('streak-checked-msg');
    const countEl = document.getElementById('streak-count');
    const flameEl = document.getElementById('streak-flame-icon');
    const nextEl  = document.getElementById('streak-next-milestone');

    if (btnEl)   btnEl.style.display = 'none';
    if (msgEl)   msgEl.style.display = 'block';
    if (countEl) countEl.textContent = newStreak;

    if (flameEl) {
        flameEl.classList.add('streak-flame-pop');
        setTimeout(() => flameEl.classList.remove('streak-flame-pop'), 600);
        if (newStreak >= 30)     flameEl.textContent = '🔥🔥🔥';
        else if (newStreak >= 7) flameEl.textContent = '🔥🔥';
    }

    if (nextEl) {
        const next = STREAK_MILESTONES.find(m => m > newStreak);
        nextEl.textContent = next
            ? next - newStreak + ' day' + (next - newStreak !== 1 ? 's' : '') + ' until next reward'
            : '🏅 All streak badges earned!';
    }

    // Re-draw dots
    renderStreakBanner();

    // Fire toast for each milestone crossed
    milestones.forEach(m => {
        const badge = badges.find(b => b.category === 'streak' && b.required === m);
        if (badge) showBadgeNotification(badge);
    });

    if (document.getElementById('badges-grid')) renderBadges(currentFilter);
};

// ── Render badges ────────────────────────────────────────────
let currentFilter = 'all';

function renderBadges(filter) {
    if (filter === undefined) filter = 'all';
    const grid = document.getElementById('badges-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let list = badges;
    if (filter === 'earned')      list = badges.filter(b => isBadgeEarned(b));
    else if (filter === 'locked') list = badges.filter(b => !isBadgeEarned(b));
    else if (filter !== 'all')    list = badges.filter(b => b.category === filter);

    list.forEach(function(badge, index) {
        const progress        = getBadgeProgress(badge);
        const earned          = isBadgeEarned(badge);
        const progressPercent = Math.min((progress / badge.required) * 100, 100);
        const isStreak        = badge.category === 'streak';

        const card = document.createElement('div');
        card.className = 'badge-card ' + (earned ? 'earned' : 'locked') + (isStreak ? ' streak-badge-card' : '');
        card.setAttribute('data-category', badge.category);
        card.setAttribute('data-status',   earned ? 'earned' : 'locked');
        card.style.animationDelay = (index * 0.05) + 's';

        const barColor = isStreak ? 'background:linear-gradient(135deg,#f97316,#ef4444);' : '';

        const iconHTML = badge.icon.startsWith('<img')
            ? '<div class="badge-icon">' + badge.icon + '</div>'
            : '<div class="badge-icon streak-emoji-icon">' + badge.icon + '</div>';

        const progressLabel = isStreak
            ? progress + ' / ' + badge.required + ' days'
            : progress + ' / ' + badge.required;

        card.innerHTML =
            (earned
                ? '<div class="earned-badge">✓ Earned</div>'
                : '<div class="locked-badge"><i class="fa-solid fa-lock"></i> Locked</div>') +
            '<div class="badge-category category-' + badge.category + '">' +
                (isStreak ? '🔥 ' : '') + badge.category +
            '</div>' +
            iconHTML +
            '<div class="badge-name">' + badge.name + '</div>' +
            '<div class="badge-description">' + badge.description + '</div>' +
            '<div class="badge-progress">' +
                '<div class="progress-bar-container">' +
                    '<div class="progress-bar ' + (earned ? 'completed' : '') + '" style="width:' + progressPercent + '%;' + barColor + '"></div>' +
                '</div>' +
                '<div class="progress-text">' + progressLabel + '</div>' +
            '</div>';

        grid.appendChild(card);
    });

    updateStats();
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats() {
    const earned  = badges.filter(b => isBadgeEarned(b)).length;
    const total   = badges.length;
    const pct     = Math.round((earned / total) * 100);

    const eEl = document.getElementById('earned-count');
    const tEl = document.getElementById('total-count');
    const pEl = document.getElementById('completion-percent');
    if (eEl) eEl.textContent = earned;
    if (tEl) tEl.textContent = total;
    if (pEl) pEl.textContent = pct + '%';
}

// ── updateProgress (called by check-in process) ───────────────
function updateProgress(progressKey, amount) {
    if (amount === undefined) amount = 1;
    const old = Object.assign({}, userProgress);

    if (progressKey === 'isFoundingMember') {
        userProgress[progressKey] = true;
    } else {
        userProgress[progressKey] = (userProgress[progressKey] || 0) + amount;
    }

    saveUserProgress();

    badges.forEach(function(badge) {
        if (badge.progressKey === progressKey) {
            const wasEarned = progressKey === 'isFoundingMember'
                ? old[progressKey]
                : (old[progressKey] || 0) >= badge.required;
            if (!wasEarned && isBadgeEarned(badge)) showBadgeNotification(badge);
        }
    });

    if (document.getElementById('badges-grid')) renderBadges(currentFilter);
}

// ── Badge toast notification ──────────────────────────────────
function showBadgeNotification(badge) {
    var isStreak = badge.category === 'streak';
    var n        = document.createElement('div');
    n.style.cssText =
        'position:fixed;top:20px;right:20px;' +
        'background:linear-gradient(135deg,' + (isStreak ? '#f97316,#ef4444' : '#10b981,#059669') + ');' +
        'color:white;padding:1.5rem 2rem;border-radius:15px;' +
        'box-shadow:0 10px 40px rgba(' + (isStreak ? '249,115,22' : '16,185,129') + ',0.4);' +
        'z-index:10000;font-weight:600;animation:slideIn 0.5s ease;max-width:300px;';
    n.innerHTML =
        '<div style="font-size:1.2rem;margin-bottom:0.5rem;">' + (isStreak ? '🔥 Streak Badge!' : '🎉 Badge Earned!') + '</div>' +
        '<div style="font-size:1rem;">' + badge.name + '</div>' +
        '<div style="font-size:0.85rem;opacity:0.9;margin-top:0.3rem;">' + badge.description + '</div>';
    document.body.appendChild(n);
    setTimeout(function() {
        n.style.animation = 'slideOut 0.5s ease';
        setTimeout(function() { if (n.parentNode) n.parentNode.removeChild(n); }, 500);
    }, 5000);
}

// ── Filter ────────────────────────────────────────────────────
function filterBadges(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var clicked = Array.from(document.querySelectorAll('.filter-btn')).find(function(b) {
        var oc = b.getAttribute('onclick');
        return oc && oc.indexOf("'" + filter + "'") !== -1;
    });
    if (clicked) clicked.classList.add('active');
    else if (window.event && window.event.target) window.event.target.classList.add('active');
    renderBadges(filter);
}

// ── Newsletter ────────────────────────────────────────────────
function handleNewsletter(event) {
    event.preventDefault();
    var input = event.target.querySelector('.newsletter-input');
    alert("Thank you for subscribing! We'll send updates to " + input.value);
    input.value = '';
}

// ── Init ──────────────────────────────────────────────────────
function initBadgesPage() {
    if (!document.getElementById('badges-grid')) return;
    loadUserProgress();
    renderStreakBanner();
    renderBadges();
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var oc = this.getAttribute('onclick');
            if (oc) {
                var m = oc.match(/filterBadges\('([^']+)'\)/);
                if (m) filterBadges(m[1]);
            }
        });
    });
}

// ── Animation CSS ─────────────────────────────────────────────
(function() {
    if (document.getElementById('badge-animations')) return;
    var s = document.createElement('style');
    s.id  = 'badge-animations';
    s.textContent =
        '@keyframes slideIn  { from{transform:translateX(400px);opacity:0} to{transform:translateX(0);opacity:1} }' +
        '@keyframes slideOut { from{transform:translateX(0);opacity:1} to{transform:translateX(400px);opacity:0} }' +
        '@keyframes streakPop{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }' +
        '.streak-flame-pop{animation:streakPop 0.6s ease !important}';
    document.head.appendChild(s);
})();

// ── Boot ──────────────────────────────────────────────────────
loadUserProgress();
window.updateProgress   = updateProgress;
window.loadUserProgress = loadUserProgress;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBadgesPage);
} else {
    initBadgesPage();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { badges, renderBadges, filterBadges, updateStats, updateProgress, loadUserProgress };
}