/**
 * notifications.js — NextStep Inbox
 * Reads from the Firestore `inbox` collection and renders messages
 * into the Notifications tab inbox on profile.html.
 *
 * Exports used by profile.js:
 *   initNotifications(uid)  — start real-time listener
 *   markAllRead()           — mark every visible message read
 *   destroyNotifications()  — unsubscribe listener (on sign-out)
 *
 * NOTE: Queries deliberately omit orderBy so no composite index is needed.
 *       Sorting is done client-side after merging the two result sets.
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
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
const db  = getFirestore(app);

let _unsubscribe  = null;
let _uid          = null;
let _messages     = [];
let _showAll      = false;
const PREVIEW_LIMIT = 5;

const PRIORITY = {
  urgent:    { label: 'Urgent',    cls: 'notif-priority-urgent',    icon: 'fa-circle-exclamation' },
  important: { label: 'Important', cls: 'notif-priority-important', icon: 'fa-star' },
  normal:    { label: '',          cls: '',                          icon: 'fa-envelope' },
};

// ── Public API ─────────────────────────────────────────────────────────────

export function initNotifications(uid) {
  _uid = uid;
  if (_unsubscribe) _unsubscribe();

  // Two simple single-field where() queries — no composite index needed.
  // We sort client-side after merging.
  const qAll = query(
    collection(db, 'inbox'),
    where('recipientType', '==', 'all')
  );

  const qPersonal = query(
    collection(db, 'inbox'),
    where('recipientUid', '==', uid)
  );

  let allDocs      = new Map();
  let personalDocs = new Map();

  function mergeAndRender() {
    const combined = new Map([...allDocs, ...personalDocs]);
    _messages = Array.from(combined.values()).sort((a, b) => {
      const ta = a.sentAt?.toDate?.() ?? new Date(0);
      const tb = b.sentAt?.toDate?.() ?? new Date(0);
      return tb - ta;  // newest first
    });
    renderInbox(_messages);
    updateBadges(_messages);
  }

  const unsubAll = onSnapshot(qAll, snap => {
    allDocs = new Map();
    snap.forEach(d => allDocs.set(d.id, { _id: d.id, ...d.data() }));
    mergeAndRender();
  }, err => console.error('[notifications] broadcast query failed:', err));

  const unsubPersonal = onSnapshot(qPersonal, snap => {
    personalDocs = new Map();
    snap.forEach(d => personalDocs.set(d.id, { _id: d.id, ...d.data() }));
    mergeAndRender();
  }, err => console.error('[notifications] personal query failed:', err));

  _unsubscribe = () => { unsubAll(); unsubPersonal(); };
}

export async function markAllRead() {
  if (!_messages.length) return;
  const unread = _messages.filter(m => !m.read);
  if (!unread.length) return;
  const batch = writeBatch(db);
  unread.forEach(m => batch.update(doc(db, 'inbox', m._id), { read: true }));
  await batch.commit();
}

export function destroyNotifications() {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  _messages = [];
  _uid      = null;
  _showAll  = false;
}

// ── Rendering ──────────────────────────────────────────────────────────────

function renderInbox(messages) {
  const container = document.getElementById('notif-inbox');
  if (!container) return;

  if (!messages.length) {
    container.innerHTML = `
      <div class="notif-item-empty">
        <i class="fas fa-bell-slash"></i>
        <span>No notifications yet</span>
      </div>`;
    return;
  }

  const visible   = _showAll ? messages : messages.slice(0, PREVIEW_LIMIT);
  const remaining = messages.length - PREVIEW_LIMIT;

  const itemsHTML = visible.map(msg => {
    const p = PRIORITY[msg.priority] || PRIORITY.normal;
    const dateStr = msg.sentAt?.toDate
      ? msg.sentAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Just now';
    const unreadClass   = msg.read ? '' : 'notif-item-unread';
    const priorityBadge = p.label ? `<span class="notif-priority-badge ${p.cls}">${p.label}</span>` : '';
    const safeBody = (msg.body || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');

    return `
      <div class="notif-item ${unreadClass}" data-id="${msg._id}">
        <div class="notif-item-header notif-item-toggle" onclick="window._notifToggle(this)" role="button" aria-expanded="false">
          <div class="notif-item-icon ${p.cls}"><i class="fas ${p.icon}"></i></div>
          <div class="notif-item-meta">
            <div class="notif-item-subject">${priorityBadge}${escapeHTML(msg.subject || '(No subject)')}</div>
            <div class="notif-item-date">${dateStr}</div>
          </div>
          <div class="notif-item-right">
            ${!msg.read ? `<div class="notif-unread-dot" title="Unread"></div>` : ''}
            <i class="fas fa-chevron-down notif-chevron"></i>
          </div>
        </div>
        <div class="notif-item-body notif-item-body-collapsed">
          <div class="notif-item-body-inner">${safeBody}</div>
          <div class="notif-item-actions">
            ${!msg.read
              ? `<button class="notif-action-btn" onclick="window._notifMarkRead('${msg._id}')"><i class="fas fa-check"></i> Mark read</button>`
              : `<span class="notif-read-label"><i class="fas fa-check-double"></i> Read</span>`}
          </div>
        </div>
      </div>`;
  }).join('');

  // "Show all / Show fewer" button
  let footerHTML = '';
  if (messages.length > PREVIEW_LIMIT) {
    if (!_showAll) {
      footerHTML = `
        <div class="notif-show-more-row">
          <button class="notif-show-more-btn" onclick="window._notifToggleAll()">
            <i class="fas fa-chevron-down"></i> Show ${remaining} more message${remaining !== 1 ? 's' : ''}
          </button>
        </div>`;
    } else {
      footerHTML = `
        <div class="notif-show-more-row">
          <button class="notif-show-more-btn" onclick="window._notifToggleAll()">
            <i class="fas fa-chevron-up"></i> Show fewer
          </button>
        </div>`;
    }
  }

  container.innerHTML = itemsHTML + footerHTML;
}

// Toggle a single message open/closed
window._notifToggle = function(headerEl) {
  const item    = headerEl.closest('.notif-item');
  const body    = item.querySelector('.notif-item-body');
  const chevron = headerEl.querySelector('.notif-chevron');
  const isOpen  = body.classList.contains('notif-item-body-open');

  body.classList.toggle('notif-item-body-collapsed', isOpen);
  body.classList.toggle('notif-item-body-open', !isOpen);
  chevron.classList.toggle('notif-chevron-open', !isOpen);
  headerEl.setAttribute('aria-expanded', String(!isOpen));
};

// Toggle show-all / show-fewer
window._notifToggleAll = function() {
  _showAll = !_showAll;
  renderInbox(_messages);
};

function updateBadges(messages) {
  const count = messages.filter(m => !m.read).length;
  const badge = document.getElementById('sidebar-notif-count');
  if (badge) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  const dot = document.getElementById('avatar-notif-dot');
  if (dot) dot.style.display = count > 0 ? 'block' : 'none';

  updateNavProfileBadges(count);
}

// ── Self-contained CSS for the nav badge/alert ──────────────────────────────
// auth-check.js (and therefore this nav badge) runs on EVERY page, but
// notifications.css is only <link>-ed on profile.html. Rather than requiring
// every page in the site to add that stylesheet, inject the small amount of
// CSS the badge needs directly, once, the first time it's needed.
let _navBadgeStylesInjected = false;
function ensureNavBadgeStyles() {
  if (_navBadgeStylesInjected || document.getElementById('nav-notif-badge-styles')) return;
  _navBadgeStylesInjected = true;

  const style = document.createElement('style');
  style.id = 'nav-notif-badge-styles';
  style.textContent = `
    .profile-btn-notif-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 9px;
      background: #ef4444;
      color: white;
      font-size: 0.68rem;
      font-weight: 800;
      font-family: 'Open Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      line-height: 1;
      pointer-events: none;
      box-shadow: 0 2px 6px rgba(239,68,68,0.5);
      z-index: 10;
    }
    .profile-btn-notif-badge.hidden { display: none; }
    .profile-dropdown { position: relative; }

    .profile-menu-notif-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 6px 10px;
      background: #fee2e2;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #991b1b;
      cursor: pointer;
      transition: background 0.15s;
    }
    .profile-menu-notif-alert:hover { background: #fecaca; }
    .profile-menu-notif-alert.hidden { display: none; }
    .profile-menu-notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(239,68,68,0.2);
    }
    [data-theme="dark"] .profile-menu-notif-alert { background: rgba(239,68,68,0.18); color: #fca5a5; }
    [data-theme="dark"] .profile-menu-notif-alert:hover { background: rgba(239,68,68,0.28); }
  `;
  document.head.appendChild(style);
}

// ── Red notification indicators on the top-nav profile button + dropdown ──
// These live outside profile.html's own markup (built by auth-check.js), so
// we find/create them by the classes already defined in style.css.
function updateNavProfileBadges(count) {
  ensureNavBadgeStyles();

  // 1) Small red count badge on the round profile button itself.
  const profileBtn = document.querySelector('.profile-btn');
  if (profileBtn) {
    let navBadge = profileBtn.querySelector('.profile-btn-notif-badge');
    if (!navBadge) {
      navBadge = document.createElement('span');
      navBadge.className = 'profile-btn-notif-badge';
      profileBtn.appendChild(navBadge);
    }
    navBadge.textContent = count > 99 ? '99+' : count;
    navBadge.classList.toggle('hidden', count === 0);
  }

  // 2) Unread alert row inside the profile dropdown menu.
  const menuHeader = document.querySelector('.profile-menu-header');
  if (menuHeader) {
    let alertEl = menuHeader.querySelector('.profile-menu-notif-alert');
    if (!alertEl) {
      alertEl = document.createElement('div');
      alertEl.className = 'profile-menu-notif-alert';
      alertEl.innerHTML = `<span class="profile-menu-notif-dot"></span><span class="profile-menu-notif-text"></span>`;
      alertEl.addEventListener('click', () => {
        const menu = document.querySelector('.profile-menu');
        if (menu) menu.classList.remove('show');
        const notifTabBtn = document.querySelector('.sidebar-nav-item[data-tab="notifications"]');
        if (notifTabBtn) {
          notifTabBtn.click();
        } else {
          window.location.href = 'profile.html#notifications';
        }
      });
      menuHeader.appendChild(alertEl);
    }
    const textEl = alertEl.querySelector('.profile-menu-notif-text');
    textEl.textContent = count === 1 ? '1 new message' : `${count} new messages`;
    alertEl.classList.toggle('hidden', count === 0);
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

window._notifMarkRead = async function(id) {
  try {
    await updateDoc(doc(db, 'inbox', id), { read: true });
  } catch (e) {
    console.warn('[notifications] markRead error:', e);
  }
};