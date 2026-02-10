// event-popup.js - Reusable event details popup component
// Works on both events page and map page

(function() {
    'use strict';

    // Create popup CSS styles (only once)
    function injectPopupStyles() {
        if (document.getElementById('event-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'event-popup-styles';
        style.textContent = `
            /* Event Popup Overlay */
            .event-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                animation: fadeIn 0.3s ease forwards;
            }

            @keyframes fadeIn {
                to { opacity: 1; }
            }

            /* Popup Container */
            .event-popup {
                background: white;
                border-radius: 20px;
                max-width: 700px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                animation: popIn 0.3s ease forwards;
            }

            @keyframes popIn {
                to {
                    transform: scale(1);
                }
            }

            /* Popup Header */
            /* Popup Header (matches event card header exactly) */
            .event-popup-header {
                padding: 30px;
                color: white;
                position: relative;
                overflow: hidden;
            }

            /* Gradient overlay (same as event cards) */
            .event-popup-header::before {
                content: '';
                position: absolute;
                inset: 0;
                background: inherit;
                opacity: 0.9;
            }

            /* Ensure content stays above overlay */
            .event-popup-header > * {
                position: relative;
                z-index: 1;
            }

            /* Category pill (same look as events.css) */
            .event-popup-category {
                display: inline-block;
                padding: 0.3rem 0.8rem;
                background: rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 0.8rem;
            }
            .event-popup-close {
                position: absolute; 
                top: 20px; 
                right: 20px; 
                background: #f1f5f9; 
                border: none; 
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                cursor: pointer;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 24px; 
                color: #64748b; 
                transition: all 0.3s ease; 
            } 
            
            .event-popup-close:hover { background: #ef4444;
             color: white; transform: rotate(90deg) }


            /* Header title */
            .event-popup-title {
                font-size: 28px;
                font-weight: 800;
                line-height: 1.3;
                margin-bottom: 10px;
            }

            /* Organizer text */
            .event-popup-organizer {
                font-size: 14px;
                font-weight: 600;
                opacity: 0.95;
            }

            .event-popup-title {
                font-size: 28px;
                font-weight: 800;
                margin-bottom: 10px;
                line-height: 1.3;
            }

            .event-popup-organizer {
                font-size: 14px;
                font-weight: 600;
                opacity: 0.95;
            }

            /* Popup Body */
            .event-popup-body {
                padding: 30px;
            }

            .event-popup-section {
                margin-bottom: 25px;
            }

            .event-popup-section:last-child {
                margin-bottom: 0;
            }

            .event-popup-label {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #64748b;
                margin-bottom: 8px;
            }

            .event-popup-value {
                font-size: 16px;
                color: rgb(1, 9, 67);
                line-height: 1.6;
            }

            .event-popup-icon {
                margin-right: 8px;
                color: #2563eb;
            }

            /* Info Grid */
            .event-popup-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }

            .event-popup-info-card {
                background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
                padding: 15px;
                border-radius: 12px;
                border: 2px solid #e0e7ff;
            }

            /* Tags */
            .event-popup-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .event-popup-tag {
                background: #eff6ff;
                color: #2563eb;
                padding: 6px 14px;
                border-radius: 15px;
                font-size: 13px;
                font-weight: 600;
            }

            /* Progress Bar */
            .event-popup-capacity {
                margin-top: 15px;
            }

            .capacity-bar {
                background: #e0e7ff;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 8px;
            }

            .capacity-fill {
                background: linear-gradient(135deg, #2563eb, #3b82f6);
                height: 100%;
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .capacity-text {
                font-size: 14px;
                color: #64748b;
                margin-top: 5px;
            }

            /* Action Buttons */
            .event-popup-actions {
                display: flex;
                gap: 12px;
                margin-top: 30px;
                padding-top: 25px;
                border-top: 2px solid #e0e7ff;
            }

            .event-popup-btn {
                flex: 1;
                padding: 14px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-primary {
                background: linear-gradient(135deg, #2563eb, #3b82f6);
                color: white;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            }

            .btn-secondary {
                background: white;
                color: #2563eb;
                border: 2px solid #2563eb;
            }

            .btn-secondary:hover {
                background: #eff6ff;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .event-popup {
                    max-height: 95vh;
                    margin: 10px;
                }

                .event-popup-header,
                .event-popup-body {
                    padding: 20px;
                }

                .event-popup-title {
                    font-size: 22px;
                }

                .event-popup-info-grid {
                    grid-template-columns: 1fr;
                }

                .event-popup-actions {
                    flex-direction: column;
                }
                .event-popup-button {
                    width: 100%;
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    font-family: 'Open Sans', sans-serif;
                }

                .event-popup-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37,99,235,0.4);
                }
        }
        `;
        document.head.appendChild(style);
    }

    // Create popup HTML
    function createPopupHTML(event) {
        const capacityPercent = Math.round((event.registered / event.capacity) * 100);
        
        return `
            <div class="event-popup-overlay" onclick="if(event.target === this) closeEventPopup()">
                <div class="event-popup">
                    <div class="event-popup-header ${event.category}">
                        <button class="event-popup-close" onclick="closeEventPopup()" aria-label="Close">×</button>
                        <div class="event-popup-category category-${event.category}">${event.category}</div>
                        <h2 class="event-popup-title">${event.title}</h2>
                        <div class="event-popup-organizer">Organized by ${event.organizer}</div>
                    </div>

                    <div class="event-popup-body">
                        <!-- Date/Time/Location Grid -->
                    <div class="event-popup-info-grid">
                        <div class="event-popup-info-card">
                            <div class="event-popup-label"><i class="fa-regular fa-calendar"></i> Date & Time</div>
                            <div class="event-popup-value">${event.date}<br>${event.time}</div>
                        </div>
                        <div class="event-popup-info-card">
                            <div class="event-popup-label"><i class="fa-solid fa-location-arrow"></i> Location</div>
                            <div class="event-popup-value">${event.location}<br><small style="color: #64748b;">${event.address}</small></div>
                        </div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">About This Event</div>
                        <div class="event-popup-value">${event.fullDescription}</div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">Topics</div>
                        <div class="event-popup-tags">
                            ${event.tags.map(tag => `<span class="event-popup-tag">${tag}</span>`).join('')}
                        </div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">Requirements</div>
                        <div class="event-popup-value"><i class="fa-solid fa-clipboard-check"></i> ${event.requirements}</div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">Accessibility</div>
                        <div class="event-popup-value"><i class="fa-brands fa-accessible-icon"></i> ${event.accessibility}</div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">Parking</div>
                        <div class="event-popup-value"><i class="fa-solid fa-square-parking"></i> ${event.parking}</div>
                    </div>

                    <div class="event-popup-section event-popup-capacity">
                        <div class="event-popup-label">Registration Status</div>
                        <div class="capacity-bar">
                            <div class="capacity-fill" style="width: ${capacityPercent}%"></div>
                        </div>
                        <div class="capacity-text">${event.registered} of ${event.capacity} spots filled (${capacityPercent}%)</div>
                    </div>

                    <div class="event-popup-section">
                        <div class="event-popup-label">Contact Information</div>
                        <div class="event-popup-value">
                            <i class="fa-solid fa-envelope"></i> <a href="mailto:${event.contact}" style="color: #2563eb; text-decoration: none;">${event.contact}</a><br>
                            <i class="fa-solid fa-phone-volume"></i> ${event.phone}
                        </div>
                    </div>

                    <div class="event-popup-actions">
                        <button class="event-popup-btn btn-primary" onclick="registerForEvent('${event.id}')">
                            ✓ Register for Event
                        </button>
                        <button class="event-popup-btn btn-secondary" onclick="shareEvent('${event.id}')">
                            🔗 Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


    // Open popup
    window.openEventPopup = function(eventId) {
        console.log('Opening popup for event:', eventId);
        
        // CRITICAL FIX: Close any open Leaflet map popups BEFORE opening event popup
        if (typeof map !== 'undefined' && map.closePopup) {
            map.closePopup();
        }
        
        // Check if eventsData exists
        if (!window.eventsData) {
            console.error('eventsData not loaded! Make sure events-data.js loads before event-popup.js');
            alert('Error: Event data not loaded. Please refresh the page.');
            return;
        }
        
        // Find event data
        const event = window.eventsData.find(e => e.id === eventId);
        if (!event) {
            console.error('Event not found:', eventId);
            alert('Error: Event not found with ID: ' + eventId);
            return;
        }

        console.log('Found event:', event.title);

        // Inject styles if not already done
        injectPopupStyles();

        // Remove existing popup if any
        const existing = document.getElementById('event-popup-container');
        if (existing) existing.remove();

        // Create and append popup
        const container = document.createElement('div');
        container.id = 'event-popup-container';
        container.innerHTML = createPopupHTML(event);
        document.body.appendChild(container);

        console.log('Popup appended to body');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Add escape key listener
        const escapeHandler = function(e) {
            if (e.key === 'Escape') {
                window.closeEventPopup();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        container.dataset.escapeHandler = 'attached';
    };

    // Close popup
    window.closeEventPopup = function() {
        const container = document.getElementById('event-popup-container');
        if (!container) return;

        // Fade out animation
        const overlay = container.querySelector('.event-popup-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                container.remove();
                document.body.style.overflow = '';
            }, 300);
        } else {
            container.remove();
            document.body.style.overflow = '';
        }

        // Remove escape key listener
        document.removeEventListener('keydown', window.closeEventPopup);
    };

    // Register for event
    window.registerForEvent = function(eventId) {
        const event = window.eventsData.find(e => e.id === eventId);
        if (!event) return;

        // In a real app, this would make an API call
        alert(`You're registered for "${event.title}"!\n\nConfirmation email sent to your registered email address.\n\nEvent Details:\n ${event.date} at ${event.time}\n ${event.location}`);
        
        // Optionally close popup after registration
        window.closeEventPopup();
    };

    // Share event
    window.shareEvent = function(eventId) {
        const event = window.eventsData.find(e => e.id === eventId);
        if (!event) return;

        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Join me at ${event.title} on ${event.date}!`,
                url: window.location.href + '#event-' + eventId
            }).catch(err => console.log('Share cancelled'));
        } else {
            // Fallback: copy link to clipboard
            const url = window.location.href.split('#')[0] + '#event-' + eventId;
            navigator.clipboard.writeText(url).then(() => {
                alert('🔗 Event link copied to clipboard!\n\nShare it with friends and family.');
            }).catch(() => {
                alert('Event link:\n' + url);
            });
        }
    };

    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);

    // Log that popup component is ready
    console.log('✅ Event popup component loaded and ready');
    console.log('Functions available:', {
        openEventPopup: typeof window.openEventPopup,
        closeEventPopup: typeof window.closeEventPopup,
        registerForEvent: typeof window.registerForEvent,
        shareEvent: typeof window.shareEvent
    });

    // Test function - call this in console to verify: testEventPopup()
    window.testEventPopup = function() {
        if (!window.eventsData || window.eventsData.length === 0) {
            console.error('❌ No event data found!');
            return;
        }
        console.log('✅ Testing with first event:', window.eventsData[0].id);
        window.openEventPopup(window.eventsData[0].id);
    };

})();