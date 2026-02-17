// Exact location of Boca Raton
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
const customIcons = {
    political: L.icon({
        iconUrl: 'images/political.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 46],
        shadowSize: [41, 41],
        iconAnchor: [17, 46],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -40]
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

// Create category layer group mapping
const categoryMap = {
    political: political,
    youth: youth,
    innovation: innovation,
    environmental: environmental,
    education: education
};

// Category-specific gradients (matching events.css and events-popup.js)
const categoryGradients = {
    political: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    youth: 'linear-gradient(135deg, #fb923c, #f59e0b)',
    innovation: 'linear-gradient(135deg, #c95444, #ca3d2a)',
    environmental: 'linear-gradient(135deg, #34d399, #10b981)',
    education: 'linear-gradient(135deg, #ba3eeb, #b325eb)'
};

// Category-specific icon colors
const categoryIconColors = {
    political: '#2563eb',
    youth: '#f59e0b',
    innovation: '#ca3d2a',
    environmental: '#10b981',
    education: '#b325eb'
};

// Create markers from centralized event data
window.eventsData.forEach(event => {
    // Use custom icon based on category
    const marker = L.marker([event.lat, event.lng], {
        icon: customIcons[event.category]
    });
    
    // Get category-specific gradient and icon color
    const gradient = categoryGradients[event.category];
    const iconColor = categoryIconColors[event.category];
    
    // Create popup content with category-specific colors
    const popupContent = `
        <div style="min-width: 250px; font-family: 'Open Sans', sans-serif;">
            <div style="background: ${gradient}; color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
                <span style="font-weight: bold; font-size: 18px; display: block; margin-bottom: 4px;">${event.title}</span>
                <span style="font-size: 11px; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; display: inline-block;">${event.category}</span>
            </div>
            <div style="padding: 0 4px;">
                <div style="margin-bottom: 10px;">
                    <div style="color: #64748b; font-size: 13px; margin-bottom: 4px;"><strong style="color: ${iconColor};"><i class="fa-regular fa-calendar"></i></strong> ${event.date} at ${event.time}</div>
                    <div style="color: #64748b; font-size: 13px; margin-bottom: 4px;"><strong style="color: ${iconColor};"><i class="fa-solid fa-location-dot"></i></strong> ${event.location}</div>
                    <div style="color: #64748b; font-size: 13px;"><strong style="color: ${iconColor};"><i class="fa-regular fa-user"></i></strong> ${event.registered}/${event.capacity} registered</div>
                </div>
                <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 12px 0;">${event.description}</p>
                <button 
                    onclick="openEventPopup('${event.id}')"
                    style="
                        width: 100%;
                        padding: 10px 16px;
                        background: ${gradient};
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'Open Sans', sans-serif;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                >
                    View More Details
                </button>
            </div>
        </div>
    `;
    
    marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup category-' + event.category
    });
    
    // Add marker to appropriate category layer
    marker.addTo(categoryMap[event.category]);
});

// Add custom popup styles
const popupStyle = document.createElement('style');
popupStyle.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .custom-popup .leaflet-popup-content {
        margin: 0;
        line-height: 1.4;
    }
    
    .custom-popup .leaflet-popup-tip {
        box-shadow: 0 3px 14px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(popupStyle);

// Add LayerGroups to map by default
political.addTo(map);
youth.addTo(map);
innovation.addTo(map);
environmental.addTo(map);
education.addTo(map);

// Filter control
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

// Filter logic
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

// Zoom control
L.control.zoom({ position: 'bottomleft' }).addTo(map);