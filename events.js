// Events Data (same as map.js)
const eventsData = [
    {
        title: "Town Hall Meeting",
        date: "November 21, 2025",
        time: "7:00 PM",
        location: "Mizner Park Amphitheater",
        lat: 26.354,
        lng: -80.084,
        category: "political",
        description: "Join us for a community discussion on local governance and make your voice heard."
    },
    {
        title: "Youth Leadership Workshop",
        date: "December 5, 2025",
        time: "3:00 PM",
        location: "Boca Raton Community Center",
        lat: 26.3682,
        lng: -80.1036,
        category: "youth",
        description: "Empowering the next generation of civic leaders through interactive workshops."
    },
    {
        title: "Tech Innovation Summit",
        date: "December 10, 2025",
        time: "9:00 AM",
        location: "FAU Tech Runway",
        lat: 26.3748,
        lng: -80.1027,
        category: "innovation",
        description: "Discover cutting-edge technology solutions for civic challenges and community development."
    },
    {
        title: "Beach Clean-Up Day",
        date: "December 15, 2025",
        time: "8:00 AM",
        location: "South Beach Park",
        lat: 26.3421,
        lng: -80.0758,
        category: "environmental",
        description: "Help keep our beaches clean and beautiful. Supplies provided, just bring your enthusiasm!"
    },
    {
        title: "Education Forum",
        date: "December 20, 2025",
        time: "6:30 PM",
        location: "Boca Raton Library",
        lat: 26.3587,
        lng: -80.0831,
        category: "education",
        description: "Discuss the future of education in our community with school board members and educators."
    },
    {
        title: "City Council Meeting",
        date: "January 5, 2026",
        time: "7:00 PM",
        location: "City Hall",
        lat: 26.3586,
        lng: -80.0831,
        category: "political",
        description: "Monthly city council meeting open to the public. Voice your concerns and stay informed."
    },
    {
        title: "Meeting",
        date: "January 5, 2026",
        time: "7:00 PM",
        location: "City Hall",
        lat: 26.3586,
        lng: -80.0831,
        category: "political",
        description: "Monthly city council meeting open to the public. Voice your concerns and stay informed."
    }

];

// Render Events
function renderEvents(filter = 'all') {
    const eventsGrid = document.getElementById('events-grid');
    
    const filteredEvents = filter === 'all' 
        ? eventsData 
        : eventsData.filter(event => event.category === filter);
    
    eventsGrid.innerHTML = filteredEvents.map(event => `
        <div class="event-card" data-category="${event.category}">
            <div class="event-header ${event.category}">
                <div class="event-category">${event.category}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-date"> ${event.date}</div>
            </div>
            <div class="event-body">
                <div class="event-time">
                    <span><strong>Time:</strong> ${event.time}</span>
                </div>
                <div class="event-location">
                    <span><strong>Location:</strong> ${event.location}</span>
                </div>
                <div class="event-description">${event.description}</div>
            </div>
        </div>
    `).join('');
}

// Filter Logic
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter category
        const category = button.getAttribute('data-category');
        
        // Render filtered events
        renderEvents(category);
    });
});

// Initial render
renderEvents('all');