/**
 * dropdown-ios.js
 * Enables tap-to-open for nav dropdowns and the profile menu on
 * touch / pointer-coarse devices (iOS, Android).
 *
 * Works alongside the existing hover CSS — desktop hover is untouched.
 *
 * Usage: add this before </body> on every page that uses the shared navbar:
 *   <script src="dropdown-ios.js" defer></script>
 *
 * Dependencies: none (vanilla JS, no jQuery).
 */

(function () {
  'use strict';

  /* ─── Only activate on touch / coarse-pointer devices ─── */
  const isTouch =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    ('ontouchstart' in window) ||
    navigator.maxTouchPoints > 0;

  if (!isTouch) return; // desktop keeps pure CSS :hover behaviour

  /* ═══════════════════════════════════════════
     1. NAV DROPDOWNS  (.navbar-item.has-dropdown)
     The CSS already shows/hides via .open class.
     We intercept taps on the trigger <a> and toggle it.
  ═══════════════════════════════════════════ */
  function initNavDropdowns() {
    const items = document.querySelectorAll('.navbar-item.has-dropdown');

    items.forEach(function (item) {
      const trigger = item.querySelector(':scope > a');
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        const isOpen = item.classList.contains('open');

        // Close all other open dropdowns first
        items.forEach(function (other) {
          if (other !== item) other.classList.remove('open');
        });

        if (isOpen) {
          // Second tap on the same item → follow the link
          return;
        }

        // First tap → open the dropdown, don't navigate
        e.preventDefault();
        item.classList.add('open');
      });
    });

    // Tap anywhere outside → close all dropdowns
    document.addEventListener('touchstart', function (e) {
      items.forEach(function (item) {
        if (!item.contains(e.target)) {
          item.classList.remove('open');
        }
      });
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════
     2. PROFILE MENU  (.profile-dropdown / .profile-btn / .profile-menu)
     The CSS toggles visibility via .show class on .profile-menu.
     We wire the profile button to toggle it.
  ═══════════════════════════════════════════ */
  function initProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (!profileDropdown) return;

    const btn  = profileDropdown.querySelector('.profile-btn');
    const menu = profileDropdown.querySelector('.profile-menu');
    const arrow = btn && btn.querySelector('.dropdown-arrow');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = menu.classList.contains('show');
      menu.classList.toggle('show', !isOpen);
      if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
    });

    // Tap outside → close
    document.addEventListener('touchstart', function (e) {
      if (!profileDropdown.contains(e.target)) {
        menu.classList.remove('show');
        if (arrow) arrow.style.transform = '';
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════
     3. MOBILE PANEL sub-dropdown
     (contact us / has-dropdown inside .mobile-panel)
     On mobile the dropdown becomes a flush sub-list toggled by .open.
     We wire the parent <a> tap here too.
  ═══════════════════════════════════════════ */
  function initMobileSubDropdowns() {
    const mobilePanel = document.querySelector('.mobile-panel');
    if (!mobilePanel) return;

    const items = mobilePanel.querySelectorAll('.navbar-item.has-dropdown');

    items.forEach(function (item) {
      const trigger = item.querySelector(':scope > a');
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        item.classList.toggle('open');
      });
    });
  }

  /* ─── Run after DOM is ready ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initNavDropdowns();
    initProfileDropdown();
    initMobileSubDropdowns();
  }
})();