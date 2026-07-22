// admin.js - Admin functionality for NextStep
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isAdmin = false;

// Check admin status on auth change
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    isAdmin = adminDoc.exists() && adminDoc.data().isAdmin === true;
  } else {
    isAdmin = false;
  }
  renderAdminUI();
});

// Render the admin bar and inject modal HTML once
function renderAdminUI() {
  const existing = document.getElementById('admin-bar');
  if (existing) existing.remove();

  if (!isAdmin) return;

  const bar = document.createElement('div');
  bar.id = 'admin-bar';
  bar.innerHTML = `
    <style>
      #admin-bar {
        position: fixed;
        bottom: 120px;
        right: 24px;
        z-index: 5000;
      }
      #admin-add-btn {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 14px 24px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 6px 24px rgba(37,99,235,0.4);
        font-family: 'Open Sans', sans-serif;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #admin-add-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(37,99,235,0.5);
      }
      .admin-event-actions {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      .admin-edit-btn, .admin-delete-btn {
        padding: 6px 14px;
        border-radius: 8px;
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
        transition: all 0.2s;
      }
      .admin-edit-btn {
        background: #fef3c7;
        color: #92400e;
      }
      .admin-edit-btn:hover { background: #fde68a; }
      .admin-delete-btn {
        background: #fee2e2;
        color: #991b1b;
      }
      .admin-delete-btn:hover { background: #fecaca; }

      #admin-modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        z-index: 9000;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #admin-modal-overlay.open { display: flex; }
      #admin-modal {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        width: min(560px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: modalPop 0.3s ease;
      }
      @keyframes modalPop {
        from { opacity:0; transform: scale(0.95) translateY(10px); }
        to   { opacity:1; transform: scale(1) translateY(0); }
      }
      #admin-modal h2 {
        font-size: 1.5rem;
        font-weight: 800;
        color: rgb(1,9,67);
        margin: 0 0 1.5rem;
      }
      .admin-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      .admin-form-grid .full-width { grid-column: 1 / -1; min-width: 0; }
      .admin-form-group { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .admin-form-group label {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
      }
      .admin-form-group input,
      .admin-form-group select,
      .admin-form-group textarea {
        padding: 9px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Open Sans', sans-serif;
        color: rgb(1,9,67);
        transition: border-color 0.2s;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .admin-form-group input:focus,
      .admin-form-group select:focus,
      .admin-form-group textarea:focus { border-color: #2563eb; }
      .admin-form-group textarea { resize: vertical; min-height: 80px; }
      .admin-modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid #e2e8f0;
      }
      .admin-btn-cancel {
        padding: 10px 22px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        background: white;
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s;
      }
      .admin-btn-cancel:hover { background: #f1f5f9; }
      .admin-btn-save {
        padding: 10px 28px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        border: none;
        border-radius: 10px;
        color: white;
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .admin-btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(37,99,235,0.35); }

      /* Virtual / Volunteer / Recurring toggle switches */
      .af-toggle-row { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
      .af-toggle {
        display: flex; align-items: center; gap: 8px; flex: 1 1 140px; min-width: 0;
        padding: 9px 12px; border: 2px solid #e2e8f0; border-radius: 8px; box-sizing: border-box;
        cursor: pointer; user-select: none; transition: border-color 0.2s, background 0.2s;
      }
      .af-toggle:hover { border-color: #c7d2fe; }
      .af-toggle.is-on { border-color: #2563eb; background: #eff6ff; }
      .af-toggle input[type="checkbox"] { display: none; }
      .af-toggle-track {
        position: relative; width: 34px; height: 20px; border-radius: 999px; background: #cbd5e1;
        flex-shrink: 0; transition: background 0.2s;
      }
      .af-toggle-track::after {
        content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
        border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform 0.2s;
      }
      .af-toggle.is-on .af-toggle-track { background: #2563eb; }
      .af-toggle.is-on .af-toggle-track::after { transform: translateX(14px); }
      .af-toggle-label {
        font-weight: 700; font-size: 13px; color: rgb(1,9,67);
        white-space: normal; overflow-wrap: break-word; line-height: 1.25; min-width: 0;
      }
      @media (max-width: 480px) {
        .af-toggle-row { flex-direction: column; }
        .af-toggle { flex: 1 1 auto; min-width: 0; }
      }

      .af-recurring-panel { display: none; margin-top: 4px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
      .af-recurring-panel.is-visible { display: block; }
      .af-recurring-panel .admin-form-grid { grid-template-columns: 1fr 1fr; margin-bottom: 0; }

      #admin-delete-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 9500;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #admin-delete-overlay.open { display: flex; }
      #admin-delete-modal {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        width: min(400px, 100%);
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      }
      #admin-delete-modal .del-icon { font-size: 48px; margin-bottom: 12px; }
      #admin-delete-modal h3 { font-size: 1.3rem; font-weight: 800; color: #991b1b; margin: 0 0 8px; }
      #admin-delete-modal p { color: #64748b; margin: 0 0 1.5rem; }
      .del-actions { display: flex; gap: 10px; justify-content: center; }
      .del-btn-cancel {
        padding: 10px 22px; border: 2px solid #e2e8f0; border-radius: 10px;
        background: white; font-family: 'Open Sans', sans-serif; font-size: 14px;
        font-weight: 600; cursor: pointer; color: #64748b;
      }
      .del-btn-confirm {
        padding: 10px 22px; background: linear-gradient(135deg, #ef4444, #dc2626);
        border: none; border-radius: 10px; color: white;
        font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer;
      }
    </style>

    <button id="admin-add-btn" onclick="window.openAdminModal()">
      ＋ Add Event
    </button>

    <!-- Event create/edit modal -->
    <div id="admin-modal-overlay">
      <div id="admin-modal">
        <h2 id="admin-modal-title">Add Event</h2>
        <div class="admin-form-grid">
          <div class="admin-form-group full-width">
            <label>Title</label>
            <input id="af-title" type="text" placeholder="Event title">
          </div>
          <div class="admin-form-group">
            <label>Date</label>
            <input id="af-date" type="text" placeholder="March 2, 2026">
          </div>
          <div class="admin-form-group">
            <label>Time</label>
            <input id="af-time" type="text" placeholder="7:00 PM">
          </div>
          <div class="admin-form-group">
            <label>Category</label>
            <select id="af-category">
              <option value="political">Political</option>
              <option value="youth">Youth</option>
              <option value="innovation">Innovation</option>
              <option value="environmental">Environmental</option>
              <option value="education">Education</option>
              <option value="religious">Religious</option>
            </select>
          </div>
          <div class="admin-form-group full-width">
            <div class="af-toggle-row">
              <label class="af-toggle" id="af-virtual-toggle" for="af-is-virtual">
                <input type="checkbox" id="af-is-virtual">
                <span class="af-toggle-track"></span>
                <span class="af-toggle-label">🎥 Virtual Event</span>
              </label>
              <label class="af-toggle" id="af-volunteer-toggle" for="af-is-volunteer">
                <input type="checkbox" id="af-is-volunteer">
                <span class="af-toggle-track"></span>
                <span class="af-toggle-label">🤝 Volunteer Opportunity</span>
              </label>
              <label class="af-toggle" id="af-recurring-toggle" for="af-is-recurring">
                <input type="checkbox" id="af-is-recurring">
                <span class="af-toggle-track"></span>
                <span class="af-toggle-label">🔁 Recurring Event</span>
              </label>
            </div>
          </div>
          <div class="admin-form-group full-width af-recurring-panel" id="af-recurring-panel">
            <div class="admin-form-grid">
              <div class="admin-form-group">
                <label>Repeats</label>
                <select id="af-recurring-frequency" onchange="window.onAfRecurringFrequencyChange()">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom dates</option>
                </select>
              </div>
              <div class="admin-form-group" id="af-recurring-count-wrap">
                <label>Number of occurrences</label>
                <input type="number" id="af-recurring-count" min="2" max="52" value="4">
              </div>
            </div>
            <div class="admin-form-group full-width" id="af-recurring-custom-wrap" style="display:none;">
              <label>Additional dates (one per line or comma-separated)</label>
              <textarea id="af-recurring-custom-dates" placeholder="Jul 5, 2026, Jul 19, 2026"></textarea>
            </div>
            <p id="af-recurring-hint" style="font-size:12px; color:#64748b; margin:8px 0 0;">Starting from the date above, this will publish separate event listings on that schedule. Each occurrence can be edited or deleted individually afterward.</p>
          </div>
          <div class="admin-form-group">
            <label>Location Name</label>
            <input id="af-location" type="text" placeholder="Mizner Park Amphitheater">
          </div>
          <div class="admin-form-group full-width">
            <label>Address</label>
            <input id="af-address" type="text" placeholder="590 Plaza Real, Boca Raton, FL 33432">
          </div>
          <div class="admin-form-group">
            <label>Latitude</label>
            <input id="af-lat" type="number" step="any" placeholder="26.354">
          </div>
          <div class="admin-form-group">
            <label>Longitude</label>
            <input id="af-lng" type="number" step="any" placeholder="-80.084">
          </div>
          <div class="admin-form-group full-width">
            <label>Short Description</label>
            <input id="af-description" type="text" placeholder="One sentence summary">
          </div>
          <div class="admin-form-group full-width">
            <label>Full Description</label>
            <textarea id="af-fullDescription" placeholder="Full event details..."></textarea>
          </div>
          <div class="admin-form-group">
            <label>Organizer</label>
            <input id="af-organizer" type="text" placeholder="Organization name">
          </div>
          <div class="admin-form-group">
            <label>Contact Email</label>
            <input id="af-contact" type="email" placeholder="contact@org.com">
          </div>
          <div class="admin-form-group">
            <label>Phone</label>
            <input id="af-phone" type="text" placeholder="(561) 555-0000">
          </div>
          <div class="admin-form-group">
            <label>Capacity</label>
            <input id="af-capacity" type="number" placeholder="100">
          </div>
          <div class="admin-form-group full-width">
            <label>Requirements</label>
            <input id="af-requirements" type="text" placeholder="Open to all residents">
          </div>
          <div class="admin-form-group full-width">
            <label>Accessibility</label>
            <input id="af-accessibility" type="text" placeholder="Wheelchair accessible">
          </div>
          <div class="admin-form-group full-width">
            <label>Parking</label>
            <input id="af-parking" type="text" placeholder="Free parking available">
          </div>
        </div>
        <div class="admin-modal-actions">
          <button class="admin-btn-cancel" onclick="window.closeAdminModal()">Cancel</button>
          <button class="admin-btn-save" onclick="window.saveAdminEvent()">Save Event</button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div id="admin-delete-overlay">
      <div id="admin-delete-modal">
        <div class="del-icon">🗑️</div>
        <h3>Delete Event?</h3>
        <p>This will permanently remove the event. This cannot be undone.</p>
        <div class="del-actions">
          <button class="del-btn-cancel" onclick="window.closeDeleteConfirm()">Cancel</button>
          <button class="del-btn-confirm" onclick="window.confirmDeleteEvent()">Delete</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(bar);
  setupAfToggles();
  addAdminButtonsToCards();
}

// Wire up the Virtual / Volunteer / Recurring toggle switches (call once per DOM injection)
function setupAfToggle(toggleId, checkboxId, onChange) {
  const wrap = document.getElementById(toggleId);
  const box  = document.getElementById(checkboxId);
  if (!wrap || !box) return;
  const sync = () => {
    wrap.classList.toggle('is-on', box.checked);
    if (onChange) onChange(box.checked);
  };
  wrap.addEventListener('click', (e) => {
    if (e.target !== box) {
      e.preventDefault();
      box.checked = !box.checked;
    }
    sync();
  });
  sync();
}

function setupAfToggles() {
  setupAfToggle('af-virtual-toggle', 'af-is-virtual');
  setupAfToggle('af-volunteer-toggle', 'af-is-volunteer');
  setupAfToggle('af-recurring-toggle', 'af-is-recurring', (isOn) => {
    const panel = document.getElementById('af-recurring-panel');
    if (panel) panel.classList.toggle('is-visible', isOn);
  });
}

// Swap between "number of occurrences" and "custom dates" depending on frequency
window.onAfRecurringFrequencyChange = function() {
  const isCustom = document.getElementById('af-recurring-frequency').value === 'custom';
  document.getElementById('af-recurring-count-wrap').style.display  = isCustom ? 'none' : '';
  document.getElementById('af-recurring-custom-wrap').style.display = isCustom ? '' : 'none';
};

// Compute the list of date strings for a recurring event series.
// The base/start date is always included as the first entry.
function computeAfRecurringDates(startDateStr, frequency, count) {
  if (frequency === 'custom') {
    const raw = document.getElementById('af-recurring-custom-dates').value || '';
    const extra = raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    return [startDateStr, ...extra];
  }

  const base = new Date(startDateStr);
  if (isNaN(base.getTime())) return [startDateStr]; // fall back to a single event if unparseable

  const stepDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : null;
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime());
    if (stepDays) {
      d.setDate(d.getDate() + stepDays * i);
    } else {
      d.setMonth(d.getMonth() + i); // monthly
    }
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  return dates;
}

function addAdminButtonsToCards() {
  if (!isAdmin) return;
  document.querySelectorAll('.event-card').forEach(card => {
    if (card.querySelector('.admin-event-actions')) return;
    const eventId = getEventIdFromCard(card);
    if (!eventId) return;
    const actions = document.createElement('div');
    actions.className = 'admin-event-actions';
    actions.innerHTML = `
      <button class="admin-edit-btn" onclick="event.stopPropagation(); window.openAdminModal('${eventId}')">✏️ Edit</button>
      <button class="admin-delete-btn" onclick="event.stopPropagation(); window.openDeleteConfirm('${eventId}')">🗑️ Delete</button>
    `;
    const body = card.querySelector('.event-body');
    if (body) body.appendChild(actions);
  });
}

function getEventIdFromCard(card) {
  const onclick = card.getAttribute('onclick') || '';
  const match = onclick.match(/openEventPopup\('([^']+)'\)/);
  return match ? match[1] : null;
}

let editingId = null;
let deletingId = null;

window.openAdminModal = function(eventId = null) {
  editingId = eventId;
  document.getElementById('admin-modal-title').textContent = eventId ? 'Edit Event' : 'Add Event';

  ['title','date','time','location','address','description','fullDescription',
   'organizer','contact','phone','requirements','accessibility','parking'].forEach(f => {
    document.getElementById('af-' + f).value = '';
  });
  document.getElementById('af-lat').value = '';
  document.getElementById('af-lng').value = '';
  document.getElementById('af-capacity').value = '';
  document.getElementById('af-category').value = 'political';

  // Reset the toggles
  document.getElementById('af-is-virtual').checked = false;
  document.getElementById('af-is-volunteer').checked = false;
  document.getElementById('af-is-recurring').checked = false;
  document.getElementById('af-virtual-toggle').classList.remove('is-on');
  document.getElementById('af-volunteer-toggle').classList.remove('is-on');
  document.getElementById('af-recurring-toggle').classList.remove('is-on');
  document.getElementById('af-recurring-panel').classList.remove('is-visible');
  document.getElementById('af-recurring-frequency').value = 'weekly';
  document.getElementById('af-recurring-custom-dates').value = '';
  window.onAfRecurringFrequencyChange();
  document.getElementById('af-recurring-hint').textContent =
    'Starting from the date above, this will publish separate event listings on that schedule. Each occurrence can be edited or deleted individually afterward.';

  if (eventId && window.eventsData) {
    const ev = window.eventsData.find(e => e.id === eventId);
    if (ev) {
      document.getElementById('af-title').value = ev.title || '';
      document.getElementById('af-date').value = ev.date || '';
      document.getElementById('af-time').value = ev.time || '';
      document.getElementById('af-category').value = ev.category || 'political';
      document.getElementById('af-location').value = ev.location || '';
      document.getElementById('af-address').value = ev.address || '';
      document.getElementById('af-lat').value = ev.lat || '';
      document.getElementById('af-lng').value = ev.lng || '';
      document.getElementById('af-description').value = ev.description || '';
      document.getElementById('af-fullDescription').value = ev.fullDescription || '';
      document.getElementById('af-organizer').value = ev.organizer || '';
      document.getElementById('af-contact').value = ev.contact || '';
      document.getElementById('af-phone').value = ev.phone || '';
      document.getElementById('af-capacity').value = ev.capacity || '';
      document.getElementById('af-requirements').value = ev.requirements || '';
      document.getElementById('af-accessibility').value = ev.accessibility || '';
      document.getElementById('af-parking').value = ev.parking || '';

      document.getElementById('af-is-virtual').checked = !!ev.isVirtual;
      document.getElementById('af-is-volunteer').checked = !!ev.isVolunteer;
      document.getElementById('af-virtual-toggle').classList.toggle('is-on', !!ev.isVirtual);
      document.getElementById('af-volunteer-toggle').classList.toggle('is-on', !!ev.isVolunteer);

      // Recurring stays available during edit — checking it now adds new
      // occurrences going forward from this event's date; it doesn't touch
      // any occurrences that already exist.
      document.getElementById('af-recurring-hint').textContent =
        "This adds new occurrences starting from this event's date, on the schedule below. It won't change any occurrences that already exist.";
    }
  }

  document.getElementById('admin-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeAdminModal = function() {
  document.getElementById('admin-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
};

window.saveAdminEvent = async function() {
  if (!isAdmin) return;

  const isVirtual   = document.getElementById('af-is-virtual').checked;
  const isVolunteer = document.getElementById('af-is-volunteer').checked;
  const isRecurring = document.getElementById('af-is-recurring').checked;

  const eventData = {
    title: document.getElementById('af-title').value.trim(),
    date: document.getElementById('af-date').value.trim(),
    time: document.getElementById('af-time').value.trim(),
    category: document.getElementById('af-category').value,
    location: document.getElementById('af-location').value.trim(),
    address: document.getElementById('af-address').value.trim(),
    lat: parseFloat(document.getElementById('af-lat').value) || 0,
    lng: parseFloat(document.getElementById('af-lng').value) || 0,
    description: document.getElementById('af-description').value.trim(),
    fullDescription: document.getElementById('af-fullDescription').value.trim(),
    organizer: document.getElementById('af-organizer').value.trim(),
    contact: document.getElementById('af-contact').value.trim(),
    phone: document.getElementById('af-phone').value.trim(),
    capacity: parseInt(document.getElementById('af-capacity').value) || 100,
    requirements: document.getElementById('af-requirements').value.trim(),
    accessibility: document.getElementById('af-accessibility').value.trim(),
    parking: document.getElementById('af-parking').value.trim(),
    registered: 0,
    tags: [],
    badgeProgress: { eventsAttended: 1 },
    isVirtual: isVirtual,
    isVolunteer: isVolunteer,
    updatedAt: serverTimestamp()
  };

  if (!eventData.title) { alert('Title is required'); return; }

  let addedCount = 1;

  try {
    if (isRecurring) {
      const frequency = document.getElementById('af-recurring-frequency').value;
      const count     = Math.max(2, Math.min(52, Number(document.getElementById('af-recurring-count').value) || 4));
      const dates     = computeAfRecurringDates(eventData.date, frequency, count); // dates[0] === eventData.date

      if (editingId) {
        // Update this event in place as the anchor of the series, then
        // create only the *new* occurrences after it. Any occurrences that
        // already existed from a prior series are left untouched.
        const existing = window.eventsData ? window.eventsData.find(e => e.id === editingId) : null;
        const recurringGroupId = existing?.recurringGroupId || ('rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8));

        const anchorData = {
          ...eventData,
          recurring: true,
          recurringGroupId,
          recurringFrequency: frequency,
          recurringIndex: existing?.recurringIndex ?? 0,
        };
        await updateDoc(doc(db, 'events', editingId), anchorData);
        if (window.eventsData) {
          const idx = window.eventsData.findIndex(e => e.id === editingId);
          if (idx !== -1) window.eventsData[idx] = { ...window.eventsData[idx], ...anchorData };
        }

        const newDates = dates.slice(1); // skip the anchor date — that's the event we just updated
        for (let i = 0; i < newDates.length; i++) {
          const occurrenceData = {
            ...eventData,
            date: newDates[i],
            createdAt: serverTimestamp(),
            recurring: true,
            recurringGroupId,
            recurringFrequency: frequency,
            recurringIndex: (existing?.recurringIndex ?? 0) + i + 1,
          };
          const docRef = await addDoc(collection(db, 'events'), occurrenceData);
          occurrenceData.id = docRef.id;
          if (window.eventsData) window.eventsData.push(occurrenceData);
        }
        addedCount = newDates.length;
      } else {
        const recurringGroupId = 'rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        for (let i = 0; i < dates.length; i++) {
          const occurrenceData = {
            ...eventData,
            date: dates[i],
            createdAt: serverTimestamp(),
            recurring: true,
            recurringGroupId,
            recurringFrequency: frequency,
            recurringIndex: i,
          };
          const docRef = await addDoc(collection(db, 'events'), occurrenceData);
          occurrenceData.id = docRef.id;
          if (window.eventsData) window.eventsData.push(occurrenceData);
        }
        addedCount = dates.length;
      }
    } else if (editingId) {
      await updateDoc(doc(db, 'events', editingId), eventData);
      if (window.eventsData) {
        const idx = window.eventsData.findIndex(e => e.id === editingId);
        if (idx !== -1) window.eventsData[idx] = { ...window.eventsData[idx], ...eventData };
      }
    } else {
      eventData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'events'), eventData);
      eventData.id = docRef.id;
      if (window.eventsData) window.eventsData.push(eventData);
    }

 // NEW
window.closeAdminModal();

try {
  if (typeof renderEvents === 'function') {
    renderEvents(window.currentFilter || 'all');
    setTimeout(() => {
      if (typeof addAdminButtonsToCards === 'function') {
        addAdminButtonsToCards();
      }
    }, 100);
  }
} catch (renderErr) {
  console.warn('renderEvents not available on this page:', renderErr);
}

setTimeout(() => {
  try {
    if (typeof refreshMapMarkers === 'function') {
      refreshMapMarkers();
    }
  } catch (mapErr) {
    console.warn('refreshMapMarkers not available on this page:', mapErr);
  }
}, 150);

if (isRecurring && addedCount > 1) {
  alert(editingId ? `✅ Event updated and ${addedCount} new occurrence(s) added!` : `✅ Published ${addedCount} recurring events!`);
} else {
  alert(editingId ? '✅ Event updated!' : '✅ Event added!');
}
  } catch (err) {
    console.error('Error saving event:', err);
    alert('Error saving event: ' + err.message);
  }
};

window.openDeleteConfirm = function(eventId) {
  deletingId = eventId;
  document.getElementById('admin-delete-overlay').classList.add('open');
};

window.closeDeleteConfirm = function() {
  document.getElementById('admin-delete-overlay').classList.remove('open');
  deletingId = null;
};

window.confirmDeleteEvent = async function() {
  if (!isAdmin || !deletingId) return;
  try {
    await deleteDoc(doc(db, 'events', deletingId));
    if (window.eventsData) {
      window.eventsData = window.eventsData.filter(e => e.id !== deletingId);
    }
// NEW
window.closeDeleteConfirm();

try {
  if (typeof renderEvents === 'function') {
    renderEvents(window.currentFilter || 'all');
    setTimeout(() => {
      if (typeof addAdminButtonsToCards === 'function') {
        addAdminButtonsToCards();
      }
    }, 100);
  }
} catch (renderErr) {
  console.warn('renderEvents not available on this page:', renderErr);
}

setTimeout(() => {
  try {
    if (typeof refreshMapMarkers === 'function') {
      refreshMapMarkers();
    }
  } catch (mapErr) {
    console.warn('refreshMapMarkers not available on this page:', mapErr);
  }
}, 150);

alert('🗑️ Event deleted.');
  } catch (err) {
    console.error('Error deleting event:', err);
    alert('Error: ' + err.message);
  }
};