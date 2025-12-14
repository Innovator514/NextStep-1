// Exact centroid of Boca Raton
const boca = [26.3684, -80.1289];
var map = L.map('map', {
    zoomControl: false
}).setView(boca, 13);

// Stadia Maps – Alidade Smooth
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com">Stadia Maps</a>'
}).addTo(map);

// Create LayerGroups for categories
var political = L.layerGroup();
var youth = L.layerGroup();
var innovation = L.layerGroup();
var environmental = L.layerGroup();
var education = L.layerGroup();

// Define custom icons for each category
const customIcons = {
    political: L.icon({
        iconUrl: 'images/political.png', // Replace with image 5 (blue vote icon) URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    }),
    youth: L.icon({
        iconUrl: 'images/youth.png', // Replace with image 6 (red people icon) URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    }),
    innovation: L.icon({
        iconUrl: 'images/innovation.png', // Replace with image 3 (yellow lightbulb icon) URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    }),
    environmental: L.icon({
        iconUrl: 'images/environmental.png', // Replace with image 2 (green recycle icon) URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    }),
    education: L.icon({
        iconUrl: 'images/education.png', // Replace with image 1 (orange graduation cap icon) URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
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
    // Use custom icon based on category
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