// Badge definitions - Array of all available badges in the system
const badges = [
    {
        id: 1, // Unique identifier for this badge
        name: "First Step", // Display name of the badge
        description: "Attended your first civic event", // What user needs to do to earn it
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/599/599224.png" alt="First Step">', // Badge icon HTML
        category: "milestone", // Category type for filtering
        earned: true, // Whether user has earned this badge
        progress: 1, // Current progress toward earning
        required: 1 // Required amount to earn the badge
    },
    {
        id: 2,
        name: "Active Citizen",
        description: "Attended 5 civic events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/956/956100.png" alt="Active Citizen">',
        category: "participation",
        earned: true,
        progress: 5,
        required: 5
    },
    {
        id: 3,
        name: "Community Champion",
        description: "Attended 10 civic events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/2827/2827957.png" alt="Community Champion">',
        category: "participation",
        earned: true,
        progress: 10,
        required: 10
    },
    {
        id: 4,
        name: "Civic Hero",
        description: "Attended 25 civic events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/4766/4766834.png" alt="Civic Hero">',
        category: "participation",
        earned: false,
        progress: 12,
        required: 25
    },
    {
        id: 5,
        name: "Volunteer",
        description: "Volunteered at your first event",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/10729/10729191.png" alt="Volunteer">',
        category: "participation",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 6,
        name: "Helping Hand",
        description: "Volunteered 10 hours",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/10845/10845170.png" alt="Helping Hand">',
        category: "impact",
        earned: true,
        progress: 10,
        required: 10
    },
    {
        id: 7,
        name: "Time Champion",
        description: "Volunteered 50 hours",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/14118/14118953.png" alt="Time Champion">',
        category: "impact",
        earned: false,
        progress: 24,
        required: 50
    },
    {
        id: 8,
        name: "Voice of Change",
        description: "Spoke at a town hall meeting",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/2168/2168463.png" alt="Voice of Change">',
        category: "leadership",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 9,
        name: "Earth Guardian",
        description: "Participated in 3 environmental events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/8635/8635653.png" alt="Earth Guardian">',
        category: "impact",
        earned: true,
        progress: 3,
        required: 3
    },
    {
        id: 10,
        name: "Youth Leader",
        description: "Attended 5 youth-focused events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/1344/1344761.png" alt="Youth Leader">',
        category: "leadership",
        earned: false,
        progress: 2,
        required: 5
    },
    {
        id: 11,
        name: "Tech Innovator",
        description: "Attended 3 innovation summits",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/11995/11995575.png" alt="Tech Innovator">',
        category: "participation",
        earned: false,
        progress: 1,
        required: 3
    },
    {
        id: 12,
        name: "Early Bird",
        description: "Registered for an event 1 month in advance",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/1230/1230870.png" alt="Early Bird">',
        category: "milestone",
        earned: true,
        progress: 1,
        required: 1
    },
    {
        id: 13,
        name: "Streak Master",
        description: "Attended events for 3 consecutive months",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/14261/14261136.png" alt="Streak Master">',
        category: "milestone",
        earned: false,
        progress: 2,
        required: 3
    },
    {
        id: 14,
        name: "Social Butterfly",
        description: "Invited 5 friends to events",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/338/338337.png" alt="Social Butterfly">',
        category: "leadership",
        earned: false,
        progress: 3,
        required: 5
    },
    {
        id: 15,
        name: "Founding Member",
        description: "One of the first 100 users",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/616/616490.png" alt="Founding Member">',
        category: "milestone",
        earned: false,
        progress: 0,
        required: 1
    },
    {
        id: 16,
        name: "Community Builder",
        description: "Created or organized a local event",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/3079/3079652.png" alt="Community Builder">',
        category: "leadership",
        earned: false,
        progress: 0,
        required: 1
    },
    {
        id: 17,
        name: "Democracy Champion",
        description: "Voted in 3 local elections",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/3553/3553691.png" alt="Democracy Champion">',
        category: "participation",
        earned: true,
        progress: 3,
        required: 3
    },
    {
        id: 18,
        name: "Neighborhood Hero",
        description: "Completed 5 community service projects",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/2917/2917995.png" alt="Neighborhood Hero">',
        category: "impact",
        earned: false,
        progress: 3,
        required: 5
    },
    {
        id: 19,
        name: "Super Connector",
        description: "Networked with 25 community members",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/681/681494.png" alt="Super Connector">',
        category: "leadership",
        earned: false,
        progress: 18,
        required: 25
    },
    {
        id: 20,
        name: "Sustainability Star",
        description: "Participated in 10 environmental initiatives",
        icon: '<img src="https://cdn-icons-png.flaticon.com/128/2990/2990970.png" alt="Sustainability Star">',
        category: "impact",
        earned: false,
        progress: 6,
        required: 10
    }
];

// Store current filter selection (default is 'all')
let currentFilter = 'all';

/**
 * Render badges with optional filter
 * @param {string} filter - Filter type: 'all', 'earned', 'locked', or category name
 */
function renderBadges(filter = 'all') {
    // Get the badges grid container element
    const grid = document.getElementById('badges-grid');
    if (!grid) return; // Exit if element doesn't exist
    
    // Clear existing badges from the grid
    grid.innerHTML = '';

    // Start with all badges
    let filteredBadges = badges;

    // Apply filters based on filter parameter
    if (filter === 'earned') {
        // Show only earned badges
        filteredBadges = badges.filter(b => b.earned);
    } else if (filter === 'locked') {
        // Show only locked (not earned) badges
        filteredBadges = badges.filter(b => !b.earned);
    } else if (filter !== 'all') {
        // Show badges from specific category
        filteredBadges = badges.filter(b => b.category === filter);
    }

    // Create and append badge cards for each filtered badge
    filteredBadges.forEach((badge, index) => {
        // Calculate progress percentage (max 100%)
        const progressPercent = Math.min((badge.progress / badge.required) * 100, 100);
        
        // Create badge card div element
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${badge.earned ? 'earned' : 'locked'}`; // Add earned/locked class
        badgeCard.setAttribute('data-category', badge.category); // Store category for filtering
        badgeCard.setAttribute('data-status', badge.earned ? 'earned' : 'locked'); // Store status
        
        // Add staggered animation delay for cascading effect
        badgeCard.style.animationDelay = `${index * 0.05}s`;
        
        // Build the badge card HTML content
        badgeCard.innerHTML = `
            ${badge.earned 
                ? '<div class="earned-badge">✓ Earned</div>' // Show earned badge
                : '<div class="locked-badge">🔒 Locked</div>' // Show locked badge
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
        
        // Add the badge card to the grid
        grid.appendChild(badgeCard);
    });

    // Update statistics display
    updateStats();
}

/**
 * Update statistics display (earned count, total, percentage)
 */
function updateStats() {
    // Calculate earned badges count
    const earnedCount = badges.filter(b => b.earned).length;
    // Get total badges count
    const totalCount = badges.length;
    // Calculate completion percentage
    const completionPercent = Math.round((earnedCount / totalCount) * 100);

    // Get stat display elements
    const earnedEl = document.getElementById('earned-count');
    const totalEl = document.getElementById('total-count');
    const percentEl = document.getElementById('completion-percent');

    // Update the displayed values
    if (earnedEl) earnedEl.textContent = earnedCount;
    if (totalEl) totalEl.textContent = totalCount;
    if (percentEl) percentEl.textContent = completionPercent + '%';
}

/**
 * Filter badges by category or status
 * @param {string} filter - Filter type to apply
 */
function filterBadges(filter) {
    // Store current filter selection
    currentFilter = filter;
    
    // Remove active class from all filter buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the clicked button
    const clickedButton = Array.from(buttons).find(btn => {
        // Get button text without spaces
        const btnText = btn.textContent.toLowerCase().replace(/\s+/g, '');
        // Get filter text without spaces
        const filterText = filter.toLowerCase().replace(/\s+/g, '');
        // Check if button text matches filter or onclick attribute contains filter
        return btnText === filterText || btn.getAttribute('onclick')?.includes(filter);
    });
    
    // Add active class to clicked button
    if (clickedButton) {
        clickedButton.classList.add('active');
    } else if (window.event && window.event.target) {
        // Fallback: add active to event target
        window.event.target.classList.add('active');
    }
    
    // Re-render badges with the selected filter
    renderBadges(filter);
}

/**
 * Handle newsletter form submission
 * @param {Event} event - Form submit event
 */
function handleNewsletter(event) {
    event.preventDefault(); // Prevent default form submission
    const input = event.target.querySelector('.newsletter-input'); // Get email input
    const email = input.value; // Get email value
    
    // Show success message to user
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    input.value = ''; // Clear input field
}

/**
 * Initialize the badges page
 */
function init() {
    // Log initialization info to console
    console.log('Badges page loaded');
    console.log(`Total badges: ${badges.length}`);
    console.log(`Earned badges: ${badges.filter(b => b.earned).length}`);
    
    // Render all badges on page load
    renderBadges();
    
    // Set up event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Extract filter value from onclick attribute or button text
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                // Parse the filter value from onclick="filterBadges('value')"
                const match = onclickAttr.match(/filterBadges\('([^']+)'\)/);
                if (match) {
                    filterBadges(match[1]); // Call filterBadges with extracted value
                }
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    // DOM still loading, wait for it
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM ready, initialize now
    init();
}

// Export functions for external use if in module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        badges,
        renderBadges,
        filterBadges,
        updateStats
    };
}