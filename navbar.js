/* ═══════════════════════════════════════════════════════════
   navbar-dropdown.js
   Adds identical hover/click dropdowns under both "Events" and "Contact Us".
   Add <script src="navbar-dropdown.js"></script> before </body>.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function setupDropdown({ targetHref, dropdownHtml }) {
    const links = document.querySelectorAll('.navbar-item a');
    let targetItem = null;
    
    links.forEach(a => {
      if (a.getAttribute('href') === targetHref) {
        targetItem = a.closest('.navbar-item');
      }
    });
    if (!targetItem) return;

    targetItem.classList.add('has-dropdown');
    targetItem.setAttribute('aria-haspopup', 'true');

    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.innerHTML = dropdownHtml;
    targetItem.appendChild(dropdown);

    /* Mobile: toggle on tap */
    const parentLink = targetItem.querySelector('a:first-child');
    parentLink.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        targetItem.classList.toggle('open');
      }
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!targetItem.contains(e.target)) targetItem.classList.remove('open');
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') targetItem.classList.remove('open');
    });
  }

  function initAllDropdowns() {
    // 1. Build the Events Dropdown
    setupDropdown({
      targetHref: 'events.html',
      dropdownHtml: `
        <a class="nav-dropdown-item" href="events.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-calendar-alt"></i></span>
          Events List
        </a>
        <a class="nav-dropdown-item" href="past-events.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-images"></i></span>
          Gallery
        </a>
      `
    });

    // 2. Build the Contact Us Dropdown
    setupDropdown({
      targetHref: 'contact.html',
      dropdownHtml: `
        <a class="nav-dropdown-item" href="contact.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-paper-plane"></i></span>
          Message Us
        </a>
        <a class="nav-dropdown-item" href="contact-team.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-users"></i></span>
          Meet the Team
        </a>
        <div class="nav-dropdown-divider"></div>
        <a class="nav-dropdown-item" href="contact-blog.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-water"></i></span>
          Wave Blog
        </a>
        <a class="nav-dropdown-item" href="contact-faq.html" role="menuitem">
          <span class="dd-icon"><i class="fas fa-question-circle"></i></span>
          FAQ
        </a>
      `
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllDropdowns);
  } else {
    initAllDropdowns();
  }
})();