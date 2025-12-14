// Badge definitions
const badges = [
    {
        id: 1,
        name: "First Step",
        description: "Attended your first civic event",
        icon: "🎯",
        category: "milestone",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 2,
        name: "Active Citizen",
        description: "Attended 5 civic events",
        icon: "⭐",
        category: "participation",
        earned: true,
        progress: 5,
        required: 5
    },
    {
        id: 3,
        name: "Community Champion",
        description: "Attended 10 civic events",
        icon: "🏆",
        category: "participation",
        earned: true,
        progress: 10,
        required: 10
    },
    {
        id: 4,
        name: "Civic Hero",
        description: "Attended 25 civic events",
        icon: "🦸",
        category: "participation",
        earned: false,
        progress: 12,
        required: 25
    },
    {
        id: 5,
        name: "Volunteer",
        description: "Volunteered at your first event",
        icon: "🤝",
        category: "participation",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 6,
        name: "Helping Hand",
        description: "Volunteered 10 hours",
        icon: "💪",
        category: "impact",
        earned: true,
        progress: 10,
        required: 10
    },
    {
        id: 7,
        name: "Time Champion",
        description: "Volunteered 50 hours",
        icon: "⏰",
        category: "impact",
        earned: false,
        progress: 24,
        required: 50
    },
    {
        id: 8,
        name: "Voice of Change",
        description: "Spoke at a town hall meeting",
        icon: "🎤",
        category: "leadership",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 9,
        name: "Earth Guardian",
        description: "Participated in 3 environmental events",
        icon: "🌍",
        category: "impact",
        earned: true,
        progress: 3,
        required: 3
    },
    {
        id: 10,
        name: "Youth Leader",
        description: "Attended 5 youth-focused events",
        icon: "🎓",
        category: "leadership",
        earned: false,
        progress: 2,
        required: 5
    },
    {
        id: 11,
        name: "Tech Innovator",
        description: "Attended 3 innovation summits",
        icon: "💡",
        category: "participation",
        earned: false,
        progress: 1,
        required: 3
    },
    {
        id: 12,
        name: "Early Bird",
        description: "Registered for an event 1 month in advance",
        icon: "🐦",
        category: "milestone",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 13,
        name: "Streak Master",
        description: "Attended events for 3 consecutive months",
        icon: "🔥",
        category: "milestone",
        earned: false,
        progress: 2,
        required: 3
    },
    {
        id: 14,
        name: "Social Butterfly",
        description: "Invited 5 friends to events",
        icon: "🦋",
        category: "leadership",
        earned: false,
        progress: 3,
        required: 5
    },
    {
        id: 15,
        name: "Founding Member",
        description: "One of the first 100 users",
        icon: "🌟",
        category: "milestone",
        earned: false,
        progress: 0,
        required: 1
    }
];

let currentFilter = 'all';

// Render badges
function renderBadges(filter = 'all') {
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';

    let filteredBadges = badges;

    // Apply filters
    if (filter === 'earned') {
        filteredBadges = badges.filter(b => b.earned);
    } else if (filter === 'locked') {
        filteredBadges = badges.filter(b => !b.earned);
    } else if (filter !== 'all') {
        filteredBadges = badges.filter(b => b.category === filter);
    }

    filteredBadges.forEach(badge => {
        const progressPercent = Math.min((badge.progress / badge.required) * 100, 100);
        
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${badge.earned ? 'earned' : 'locked'}`;
        badgeCard.setAttribute('data-category', badge.category);
        badgeCard.setAttribute('data-status', badge.earned ? 'earned' : 'locked');
        
        badgeCard.innerHTML = `
            ${badge.earned 
                ? '<div class="earned-badge">✓ Earned</div>' 
                : '<div class="locked-badge">🔒 Locked</div>'
            }
            <div class="badge-category category-${badge.category}">
                ${badge.category}
            </div>
            <div class="badge-icon">
                ${badge.icon}
            </div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
            ${!badge.earned ? `
                <div class="badge-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">
                        ${badge.progress} / ${badge.required}
                    </div>
                </div>
            ` : ''}
        `;
        
        grid.appendChild(badgeCard);
    });

    updateStats();
}

// Update statistics
function updateStats() {
    const earnedCount = badges.filter(b => b.earned).length;
    const totalCount = badges.length;
    const completionPercent = Math.round((earnedCount / totalCount) * 100);

    document.getElementById('earned-count').textContent = earnedCount;
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('completion-percent').textContent = completionPercent + '%';
}

// Filter badges
function filterBadges(filter) {
    currentFilter = filter;
    
    // Update active button
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Re-render badges with filter
    renderBadges(filter);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Badges page loaded');
    renderBadges();
});