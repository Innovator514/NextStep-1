/* ═══════════════════════════════════════════════════════════
   navbar-dropdown.js
   Adds a hover/click dropdown under "Contact Us" in the navbar.
   Add <script src="navbar-dropdown.js"></script> before </body>.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function initContactDropdown() {
    const links = document.querySelectorAll('.navbar-item a');
    let contactItem = null;
    links.forEach(a => {
      if (a.getAttribute('href') === 'contact.html') {
        contactItem = a.closest('.navbar-item');
      }
    });
    if (!contactItem) return;

    contactItem.classList.add('has-dropdown');
    contactItem.setAttribute('aria-haspopup', 'true');

    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.innerHTML = `
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
    `;
    contactItem.appendChild(dropdown);

    /* Mobile: toggle on tap */
    const parentLink = contactItem.querySelector('a:first-child');
    parentLink.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        contactItem.classList.toggle('open');
      }
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!contactItem.contains(e.target)) contactItem.classList.remove('open');
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') contactItem.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactDropdown);
  } else {
    initContactDropdown();
  }
})();