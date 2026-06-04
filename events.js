// events.js - Updated to use centralized data and support popups
// Load events-data.js and event-popup.js BEFORE this file

// Current filter
let currentFilter = 'all';

// Load user progress from localStorage
function loadUserProgress() {
    const saved = localStorage.getItem('userProgress');
    return saved ? JSON.parse(saved) : {
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
        sustainabilityInitiatives: 0
    };
}

// Save user progress to localStorage
function saveUserProgress(userProgress) {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

// Render Events
function renderEvents(filter = 'all') {
    const eventsGrid = document.getElementById('events-grid');
    
    const filteredEvents = filter === 'all' 
        ? window.eventsData 
        : window.eventsData.filter(event => event.category === filter);
    
    eventsGrid.innerHTML = filteredEvents.map(event => {
        return `
        <div class="event-card" data-category="${event.category}" style="cursor: pointer;" onclick="openEventPopup('${event.id}')">
            <div class="event-header ${event.category}">
                <div class="event-category">${event.category}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-date">${event.date}</div>
            </div>
            <div class="event-body">
                <div class="event-time">
                    <span><strong><i class="fa-regular fa-calendar"></i> Time:</strong> ${event.time}</span>
                </div>
                <div class="event-location">
                    <span><strong><i class="fa-solid fa-location-arrow"></i> Location:</strong> ${event.location}</span>
                </div>
                <div class="event-description">${event.description}</div>
                <button 
                    class="view-details-btn"
                    onclick="event.stopPropagation(); openEventPopup('${event.id}')"
                    style="
                        margin-top: 1rem;
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #2563eb, #3b82f6);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        transition: all 0.3s ease;
                        font-size: 0.95rem;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 99, 235, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                >
                    View More Details
                </button>
            </div>
        </div>
    `}).join('');
}

// Filter Logic
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.getAttribute('data-category');
        currentFilter = category;
        renderEvents(category);
    });
});

// Handle newsletter form submission
function handleNewsletter(event) {
    event.preventDefault();
    const input = event.target.querySelector('.newsletter-input');
    const email = input.value;
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    input.value = '';
}

// Load events from Firestore and merge with local data
async function loadFirestoreEvents() {
    try {
        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const firebaseConfig = {
            apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
            authDomain: "nextstep-12b9a.firebaseapp.com",
            projectId: "nextstep-12b9a",
            storageBucket: "nextstep-12b9a.firebasestorage.app",
            messagingSenderId: "630600034259",
            appId: "1:630600034259:web:6b6284e147a6f79cda7126",
            measurementId: "G-WH3JL7Y7BR"
        };

        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const snapshot = await getDocs(collection(db, 'events'));
        const firestoreEvents = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const alreadyExists = window.eventsData.some(e => e.id === doc.id);
            if (!alreadyExists) {
                firestoreEvents.push({ ...data, id: doc.id });
            }
        });

        if (firestoreEvents.length > 0) {
            window.eventsData = [...window.eventsData, ...firestoreEvents];
        }

        console.log(`Loaded ${firestoreEvents.length} events from Firestore`);
    } catch (err) {
        console.error('Error loading Firestore events:', err);
    }

    // Always render after attempting to load
    renderEvents(currentFilter);
}

// Initial load — fetch Firestore events then render
loadFirestoreEvents();

/* ═══════════════════════════════════════════════════
   GRID / CALENDAR VIEW TOGGLE
   Works with: id="events-grid", id="calendar-view",
               id="btn-grid", id="btn-calendar"
═══════════════════════════════════════════════════ */
function parseEventDate(str) {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
        return new Date(str.trim() + 'T12:00:00');
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

const CATEGORY_COLORS = {
    political:     '#2563eb',
    youth:         '#f59e0b',
    innovation:    '#ec4899',
    environmental: '#10b981',
    education:     '#8b5cf6',
    religious:     '#d97706',
    default:       '#64748b'
};

let currentView = localStorage.getItem('nextstep_events_view') || 'grid';
let calendarDate = new Date();

function setView(view) {
    currentView = view;
    localStorage.setItem('nextstep_events_view', view);

    const gridEl    = document.getElementById('events-grid');
    const calEl     = document.getElementById('calendar-view');
    const btnGrid   = document.getElementById('btn-grid');
    const btnCal    = document.getElementById('btn-calendar');

    btnGrid.classList.toggle('active', view === 'grid');
    btnCal.classList.toggle('active',  view === 'calendar');

    if (view === 'grid') {
        gridEl.style.display = '';
        calEl.style.display  = 'none';
        calEl.innerHTML      = '';
    } else {
        gridEl.style.display = 'none';
        calEl.style.display  = '';
        renderCalendarView();
    }
}

function renderCalendarView() {
    const calEl   = document.getElementById('calendar-view');
    const year    = calendarDate.getFullYear();
    const month   = calendarDate.getMonth();
    const today   = new Date();

    const monthName    = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();

    const visibleEvents = (window.eventsData || []).filter(ev => {
        if (currentFilter !== 'all' && ev.category !== currentFilter) return false;
        if (!ev.date) return false;
        const d = parseEventDate(ev.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const byDay = {};
    visibleEvents.forEach(ev => {
        const day = parseEventDate(ev.date).getDate();
        (byDay[day] = byDay[day] || []).push(ev);
    });

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    let cells = '';
    for (let i = 0; i < firstWeekday; i++) {
        cells += `<div class="cal-cell empty"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday    = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dayEvents  = byDay[d] || [];
        const dots       = dayEvents.slice(0, 3).map(ev => {
            const color = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.default;
            return `<span class="cal-dot" style="background:${color};" title="${ev.title}"></span>`;
        }).join('');
        const more       = dayEvents.length > 3
            ? `<span class="cal-more">+${dayEvents.length - 3}</span>` : '';

        cells += `
            <div class="cal-cell${isToday ? ' today' : ''}${dayEvents.length ? ' has-events' : ''}"
                 onclick="calendarDayClick(${d}, ${year}, ${month})">
              <div class="cal-day-num">${d}</div>
              <div class="cal-dots">${dots}${more}</div>
            </div>`;
    }

    calEl.innerHTML = `
        <div class="cal-wrap">
          <div class="cal-header">
            <button class="cal-nav-btn" onclick="calNav(-1)" aria-label="Previous month">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="cal-month-label">${monthName}</span>
            <button class="cal-nav-btn" onclick="calNav(1)" aria-label="Next month">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="cal-daynames">
            ${dayNames.map(n => `<div>${n}</div>`).join('')}
          </div>
          <div class="cal-grid">${cells}</div>
          <div class="cal-event-list" id="calEventList">
            <p class="cal-hint"><i class="fas fa-hand-pointer"></i> Click a day with dots to see its events</p>
          </div>
        </div>`;
}

function calNav(delta) {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1);
    renderCalendarView();
}

function calendarDayClick(day, year, month) {
    const events = (window.eventsData || []).filter(ev => {
        if (currentFilter !== 'all' && ev.category !== currentFilter) return false;
        if (!ev.date) return false;
        const d = parseEventDate(ev.date);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

    document.querySelectorAll('.cal-cell.selected').forEach(c => c.classList.remove('selected'));
    const cells = document.querySelectorAll('.cal-cell');
    let idx = 0;
    cells.forEach((c, i) => {
        if (!c.classList.contains('empty')) {
            idx++;
            if (idx === day) c.classList.add('selected');
        }
    });

    const listEl = document.getElementById('calEventList');
    if (!listEl) return;

    if (!events.length) {
        listEl.innerHTML = `<p class="cal-hint">No events on this day.</p>`;
        return;
    }

    const dateLabel = new Date(year, month, day).toLocaleDateString('default', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    listEl.innerHTML = `
        <div class="cal-list-heading"><i class="fas fa-calendar-day"></i> ${dateLabel}</div>
        ${events.map(ev => {
            const color = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.default;
            return `
            <div class="cal-event-item" style="border-left:4px solid ${color};"
                 onclick="openEventPopup('${ev.id}')" role="button" tabindex="0">
              <div class="cal-event-cat" style="color:${color};">${ev.category}</div>
              <div class="cal-event-title">${ev.title}</div>
              ${ev.time ? `<div class="cal-event-time"><i class="fas fa-clock"></i> ${ev.time}</div>` : ''}
            </div>`;
        }).join('')}`;
}

const _origFilterSetup = filterButtons;
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (currentView === 'calendar') {
            setTimeout(renderCalendarView, 0);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (currentView === 'calendar') setView('calendar');
});