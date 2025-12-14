// Chat elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Events data
const eventsData = [
    {
        title: "Town Hall Meeting",
        date: "November 21, 2025",
        time: "7:00 PM",
        location: "Mizner Park Amphitheater",
        category: "political",
        description: "Join us for a community discussion on local governance."
    },
    {
        title: "Youth Leadership Workshop",
        date: "December 5, 2025",
        time: "3:00 PM",
        location: "Boca Raton Community Center",
        category: "youth",
        description: "Empowering the next generation of civic leaders."
    },
    {
        title: "Tech Innovation Summit",
        date: "December 10, 2025",
        time: "9:00 AM",
        location: "FAU Tech Runway",
        category: "innovation",
        description: "Discover cutting-edge technology solutions for civic challenges."
    },
    {
        title: "Beach Clean-Up Day",
        date: "December 15, 2025",
        time: "8:00 AM",
        location: "South Beach Park",
        category: "environmental",
        description: "Help keep our beaches clean and beautiful."
    },
    {
        title: "Education Forum",
        date: "December 20, 2025",
        time: "6:30 PM",
        location: "Boca Raton Library",
        category: "education",
        description: "Discuss the future of education in our community."
    }
];

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message on Enter (but Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendButton.addEventListener('click', sendMessage);

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (!isUser) {
        contentDiv.innerHTML = `<strong>Compass</strong>${content}`;
    } else {
        contentDiv.innerHTML = `<p>${content}</p>`;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <strong>NextStep Assistant</strong>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Generate response based on user input
function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Events queries
    if (lowerMessage.includes('event') || lowerMessage.includes('happening') || lowerMessage.includes('upcoming')) {
        let response = '<p>Here are our upcoming events in Boca Raton:</p><ul>';
        eventsData.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>Location: ${event.location}<br><em>${event.description}</em></li>`;
        });
        response += '</ul><p>Visit our Events page or Map to see more details!</p>';
        return response;
    }
    
    // Specific event categories
    if (lowerMessage.includes('political') || lowerMessage.includes('government') || lowerMessage.includes('council')) {
        const politicalEvents = eventsData.filter(e => e.category === 'political');
        let response = '<p>Here are our political/government events:</p><ul>';
        politicalEvents.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>${event.location}</li>`;
        });
        response += '</ul>';
        return response;
    }
    
    if (lowerMessage.includes('youth') || lowerMessage.includes('young') || lowerMessage.includes('student')) {
        const youthEvents = eventsData.filter(e => e.category === 'youth');
        let response = '<p>Here are our youth-focused events:</p><ul>';
        youthEvents.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>${event.location}</li>`;
        });
        response += '</ul>';
        return response;
    }
    
    if (lowerMessage.includes('environment') || lowerMessage.includes('clean') || lowerMessage.includes('beach')) {
        const envEvents = eventsData.filter(e => e.category === 'environmental');
        let response = '<p>Here are our environmental events:</p><ul>';
        envEvents.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>${event.location}</li>`;
        });
        response += '</ul>';
        return response;
    }
    
    if (lowerMessage.includes('education') || lowerMessage.includes('school')) {
        const eduEvents = eventsData.filter(e => e.category === 'education');
        let response = '<p>Here are our education-related events:</p><ul>';
        eduEvents.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>${event.location}</li>`;
        });
        response += '</ul>';
        return response;
    }
    
    if (lowerMessage.includes('innovation') || lowerMessage.includes('tech') || lowerMessage.includes('technology')) {
        const techEvents = eventsData.filter(e => e.category === 'innovation');
        let response = '<p>Here are our innovation and technology events:</p><ul>';
        techEvents.forEach(event => {
            response += `<li><strong>${event.title}</strong><br>${event.date} at ${event.time}<br>${event.location}</li>`;
        });
        response += '</ul>';
        return response;
    }
    
    // Civic engagement info
    if (lowerMessage.includes('civic') || lowerMessage.includes('engagement') || lowerMessage.includes('get involved') || lowerMessage.includes('participate')) {
        return `<p>Civic engagement means actively participating in your community to make a positive difference. Here's how you can get involved:</p>
        <ul>
            <li><strong>Attend Local Events:</strong> Check out our Events page for upcoming community gatherings</li>
            <li><strong>Volunteer:</strong> Many of our events welcome volunteers</li>
            <li><strong>Stay Informed:</strong> Attend town halls and city council meetings</li>
            <li><strong>Voice Your Opinion:</strong> Participate in community forums and discussions</li>
        </ul>
        <p>Every action, no matter how small, contributes to a stronger community!</p>`;
    }
    
    // About NextStep
    if (lowerMessage.includes('nextstep') || lowerMessage.includes('about') || lowerMessage.includes('who are you')) {
        return `<p>NextStep is a civic engagement platform dedicated to strengthening democracy by connecting citizens with local civic opportunities in Boca Raton, Florida.</p>
        <p>We believe that engaged communities create positive change, and every voice matters in shaping our shared future. Our mission is to make civic participation accessible, engaging, and impactful for everyone.</p>
        <p>Through our platform, you can discover local events, connect with your community, and make a real difference!</p>`;
    }
    
    // Contact info
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
        return `<p>You can reach us at:</p>
        <p><strong>Email:</strong> info@nextstep.org</p>
        <p>Or visit our Contact page to send us a message directly!</p>`;
    }
    
    // Volunteer
    if (lowerMessage.includes('volunteer') || lowerMessage.includes('help out')) {
        return `<p>We'd love to have you volunteer! Here are some ways you can help:</p>
        <ul>
            <li>Assist at our community events</li>
            <li>Help with event planning and coordination</li>
            <li>Spread the word about civic engagement opportunities</li>
            <li>Share your skills and expertise with the community</li>
        </ul>
        <p>Contact us at info@nextstep.org to learn more about volunteer opportunities!</p>`;
    }
    
    // Default response
    return `<p>I'm here to help you learn about civic engagement and local events in Boca Raton! You can ask me about:</p>
    <ul>
        <li>Upcoming events (political, youth, environmental, education, innovation)</li>
        <li>How to get involved in your community</li>
        <li>Information about NextStep</li>
        <li>Volunteer opportunities</li>
        <li>How to contact us</li>
    </ul>
    <p>What would you like to know?</p>`;
}

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Disable send button
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate thinking time
    setTimeout(() => {
        removeTypingIndicator();
        
        // Generate and add response
        const response = generateResponse(message);
        addMessage(response);
        
        // Re-enable send button
        sendButton.disabled = false;
    }, 1000);
}