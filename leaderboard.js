// leaderboard.js — Fetches user progress from Firestore and renders the leaderboard

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs
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

// ── State ──────────────────────────────────────────────
let allUsers = [];       // full list after Firestore load
let currentTab = 'combined';
let currentUserId = null;

// ── Auth: track who's logged in so we can highlight "You" ──
onAuthStateChanged(auth, (user) => {
  currentUserId = user ? user.uid : null;
  if (allUsers.length > 0) renderTab(currentTab); // re-render if data already loaded
});

// ── Fetch all user progress docs from Firestore ────────
async function loadLeaderboard() {
  try {
    const snapshot = await getDocs(collection(db, 'userProgress'));

    allUsers = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      allUsers.push({
        uid:       docSnap.id,
        name:      data.displayName  || data.name || 'Anonymous',
        photoURL:  data.photoURL     || null,
        events:    Number(data.eventsAttended)   || 0,
        badges:    Number(data.badgesEarned)      || 0,
        hours:     Number(data.volunteeredHours)  || 0,
        // combined = weighted sum: events×3 + badges×5 + hours×2
        combined:  (Number(data.eventsAttended) || 0) * 3
                 + (Number(data.badgesEarned)    || 0) * 5
                 + (Number(data.volunteeredHours)|| 0) * 2
      });
    });

    // Update footer timestamp
    const footer = document.getElementById('lb-footer');
    if (footer) footer.textContent = `Last updated: ${new Date().toLocaleString()}`;

    renderTab(currentTab);

  } catch (err) {
    console.error('Error loading leaderboard:', err);
    document.getElementById('lb-podium').innerHTML = `
      <div class="lb-empty">
        <i class="fas fa-exclamation-circle"></i>
        Could not load leaderboard. Please refresh.
      </div>`;
    document.getElementById('lb-list').innerHTML = '';
  }
}

// ── Tab switching ──────────────────────────────────────
window.switchTab = function(tab, btn) {
  currentTab = tab;

  // Update button styles
  document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderTab(tab);
};

// ── Render ─────────────────────────────────────────────
function renderTab(tab) {
  const key = tab;    // 'combined' | 'events' | 'badges' | 'hours'

  // Sort descending
  const sorted = [...allUsers].sort((a, b) => b[key] - a[key]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  renderPodium(top3, key);
  renderList(rest, key, 4);   // ranks start at 4
}

// ── Podium (top 3) ─────────────────────────────────────
function renderPodium(top3, key) {
  const podium = document.getElementById('lb-podium');

  if (top3.length === 0) {
    podium.innerHTML = `
      <div class="lb-empty">
        <i class="fas fa-users"></i>
        No data yet — be the first on the board!
      </div>`;
    return;
  }

  // Rank order for display: 2, 1, 3  (silver, gold, bronze)
  const orderedRanks = [
    { rank: 2, user: top3[1] },
    { rank: 1, user: top3[0] },
    { rank: 3, user: top3[2] }
  ].filter(r => r.user);

  const crowns = { 1: '👑', 2: '🥈', 3: '🥉' };
  const { label, unit } = tabMeta(key);

  podium.innerHTML = orderedRanks.map(({ rank, user }) => {
    const isMe = user.uid === currentUserId;
    const avatarHTML = user.photoURL
      ? `<img src="${user.photoURL}" alt="${user.name}">`
      : getInitials(user.name);

    return `
      <div class="podium-card rank-${rank} ${isMe ? 'is-me' : ''}" style="animation-delay:${rank * 0.1}s">
        ${rank === 1 ? `<div class="podium-crown">${crowns[1]}</div>` : ''}
        <div class="podium-rank-badge">${rank}</div>
        <div class="podium-avatar">${avatarHTML}</div>
        <div class="podium-name">${escHtml(user.name)}</div>
        <div class="podium-score">${formatScore(user[key], key)}</div>
        <div class="podium-score-label">${label}</div>
      </div>
    `;
  }).join('');
}

// ── Rows (rank 4 onward) ───────────────────────────────
function renderList(users, key, startRank) {
  const list = document.getElementById('lb-list');

  if (users.length === 0) {
    list.innerHTML = '';
    return;
  }

  const { label } = tabMeta(key);

  list.innerHTML = users.map((user, i) => {
    const rank = startRank + i;
    const isMe = user.uid === currentUserId;
    const avatarHTML = user.photoURL
      ? `<img src="${user.photoURL}" alt="${user.name}">`
      : getInitials(user.name);

    return `
      <div class="lb-row ${isMe ? 'is-me' : ''}" style="animation-delay:${i * 0.04}s">
        <div class="lb-row-rank">#${rank}</div>
        <div class="lb-row-avatar">${avatarHTML}</div>
        <div class="lb-row-info">
          <div class="lb-row-name">${escHtml(user.name)}</div>
          <div class="lb-row-sub">${label}</div>
        </div>
        <div>
          <div class="lb-row-score">${formatScore(user[key], key)}</div>
          <div class="lb-row-score-label">${label}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Helpers ────────────────────────────────────────────
function tabMeta(key) {
  return {
    combined: { label: 'Combined Score', unit: 'pts' },
    events:   { label: 'Events Attended', unit: '' },
    badges:   { label: 'Badges Earned',   unit: '' },
    hours:    { label: 'Volunteer Hours',  unit: 'h' }
  }[key] || { label: key, unit: '' };
}

function formatScore(val, key) {
  if (key === 'hours') return val + 'h';
  if (key === 'combined') return val + ' pts';
  return String(val);
}

function getInitials(name) {
  if (!name || name === 'Anonymous') return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ───────────────────────────────────────────────
loadLeaderboard();
