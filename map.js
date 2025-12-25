// Exact centroid of Boca Raton
const boca = [26.3684, -80.1289];
var map = L.map('map', {
    zoomControl: false
}).setView(boca, 13);

// Light mode tile layer
const lightTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com">Stadia Maps</a>'
});

// Dark mode tile layer
const darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com">Stadia Maps</a>'
});

// Function to apply correct tile layer based on theme
function applyMapTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Remove both tile layers first
    map.eachLayer(function(layer) {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });
    
    // Add the appropriate tile layer
    if (currentTheme === 'dark') {
        darkTiles.addTo(map);
    } else {
        lightTiles.addTo(map);
    }
}

// Apply initial theme
applyMapTheme();

// Listen for theme changes
document.addEventListener('themeChanged', function(e) {
    applyMapTheme();
});

// Create LayerGroups for categories
var political = L.layerGroup();
var youth = L.layerGroup();
var innovation = L.layerGroup();
var environmental = L.layerGroup();
var education = L.layerGroup();

// Define custom icons with shadows for each category
// Icon size: 69x92 pixels
// Shadow size: 41x41 pixels
// iconAnchor: position of the "tip" of the icon (bottom center for markers)
// shadowAnchor: where shadow connects to icon tip

const iconShadow = L.icon({
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

const customIcons = {
    political: L.icon({
        iconUrl: 'images/political.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],      // Display size: scaled down from 69x92
        shadowSize: [41, 41],
        iconAnchor: [17, 46],    // Bottom center (half of width, full height)
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]    // Popup appears above marker
    }),
    youth: L.icon({
        iconUrl: 'images/youth.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],
        shadowSize: [41, 41],
        iconAnchor: [17, 46],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]
    }),
    innovation: L.icon({
        iconUrl: 'images/innovation.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],
        shadowSize: [41, 41],
        iconAnchor: [17, 46],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]
    }),
    environmental: L.icon({
        iconUrl: 'images/environmental.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],
        shadowSize: [41, 41],
        iconAnchor: [17, 46],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]
    }),
    education: L.icon({
        iconUrl: 'images/education.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],
        shadowSize: [41, 41],
        iconAnchor: [17, 46],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]
    })
};

// ---------- EVENTS DATA ----------
const eventsData = [
    {
        title: "Town Hall Meeting",
        date: "November 21, 2025",
        time: "7:00 PM",
        location: "Mizner Park Amphitheater",
        lat: 26.354,
        lng: -80.084,
        category: "political",
        description: "Join us for a community discussion on local governance."
    },
    {
        title: "Youth Leadership Workshop",
        date: "December 5, 2025",
        time: "3:00 PM",
        location: "Boca Raton Community Center",
        lat: 26.3682,
        lng: -80.1036,
        category: "youth",
        description: "Empowering the next generation of civic leaders."
    },
    {
        title: "Tech Innovation Summit",
        date: "December 10, 2025",
        time: "9:00 AM",
        location: "FAU Tech Runway",
        lat: 26.3748,
        lng: -80.1027,
        category: "innovation",
        description: "Discover cutting-edge technology solutions for civic challenges."
    },
    {
        title: "Beach Clean-Up Day",
        date: "December 15, 2025",
        time: "8:00 AM",
        location: "South Beach Park",
        lat: 26.3421,
        lng: -80.0758,
        category: "environmental",
        description: "Help keep our beaches clean and beautiful."
    },
    {
        title: "Education Forum",
        date: "December 20, 2025",
        time: "6:30 PM",
        location: "Boca Raton Library",
        lat: 26.3587,
        lng: -80.0831,
        category: "education",
        description: "Discuss the future of education in our community."
    },
    {
        title: "City Council Meeting",
        date: "January 5, 2026",
        time: "7:00 PM",
        location: "City Hall",
        lat: 26.3586,
        lng: -80.0831,
        category: "political",
        description: "Monthly city council meeting open to the public."
    }
];

// ---------- CREATE MARKERS FROM DATA ----------
const categoryMap = {
    political: political,
    youth: youth,
    innovation: innovation,
    environmental: environmental,
    education: education
};

eventsData.forEach(event => {
    // Use custom icon with shadow based on category
    const marker = L.marker([event.lat, event.lng], {
        icon: customIcons[event.category]
    });
    
    marker.bindPopup(`
        <div style="min-width: 200px;">
            <span style="font-weight: bold; font-size: 18px; color: #2563eb;">${event.title}</span><br>
            <span style="color: #64748b; font-size: 14px;">📅 ${event.date}</span><br>
            <span style="color: #64748b; font-size: 14px;">⏰ ${event.time}</span><br>
            <span style="color: #64748b; font-size: 14px;">📍 ${event.location}</span><br>
            <span style="color: #64748b; font-size: 13px; margin-top: 8px; display: block;">${event.description}</span>
        </div>
    `);
    
    // Add marker to appropriate category layer
    marker.addTo(categoryMap[event.category]);
});

// Add LayerGroups to map by default
political.addTo(map);
youth.addTo(map);
innovation.addTo(map);
environmental.addTo(map);
education.addTo(map);

// ---------- FILTER CONTROL ----------
var filterControl = L.control({ position: 'topleft' });

filterControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'filter-buttons leaflet-bar');

    div.innerHTML = `
        <label class="filter-political"><input type="checkbox" id="politicalCheckbox" checked> Political</label>
        <label class="filter-youth"><input type="checkbox" id="youthCheckbox" checked> Youth</label>
        <label class="filter-innovation"><input type="checkbox" id="innovationCheckbox" checked> Innovation</label>
        <label class="filter-environmental"><input type="checkbox" id="environmentalCheckbox" checked> Environmental</label>
        <label class="filter-education"><input type="checkbox" id="educationCheckbox" checked> Education</label>
    `;

    L.DomEvent.disableClickPropagation(div);

    return div;
};

filterControl.addTo(map);

// ---------- FILTER LOGIC ----------
function updateLayers() {
    if (document.getElementById('politicalCheckbox').checked) {
        map.addLayer(political);
    } else {
        map.removeLayer(political);
    }

    if (document.getElementById('youthCheckbox').checked) {
        map.addLayer(youth);
    } else {
        map.removeLayer(youth);
    }

    if (document.getElementById('innovationCheckbox').checked) {
        map.addLayer(innovation);
    } else {
        map.removeLayer(innovation);
    }

    if (document.getElementById('environmentalCheckbox').checked) {
        map.addLayer(environmental);
    } else {
        map.removeLayer(environmental);
    }

    if (document.getElementById('educationCheckbox').checked) {
        map.addLayer(education);
    } else {
        map.removeLayer(education);
    }
}

// Add event listeners for all checkboxes
['political', 'youth', 'innovation', 'environmental', 'education'].forEach(id => {
    document.getElementById(id + 'Checkbox').addEventListener('change', updateLayers);
});

// ---------- ZOOM CONTROL ----------
L.control.zoom({ position: 'bottomleft' }).addTo(map);