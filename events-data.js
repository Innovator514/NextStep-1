    // events-data.js - Centralized event data for entire site
    // This file is the SINGLE SOURCE OF TRUTH for all event information

    const eventsData = [
      
]


    // Make data globally available
    if (typeof window !== 'undefined') {
        window.eventsData = eventsData;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = eventsData;
    }