// mobile-nav.js — hamburger menu, re-syncs profile/auth state on every open
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const navdiv = document.querySelector('.navdiv');
    if (!navdiv) return;

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    navdiv.appendChild(hamburger);

    // Create panel shell (populated fresh each open)
    const mobilePanel = document.createElement('div');
    mobilePanel.className = 'mobile-panel';
    mobilePanel.setAttribute('aria-hidden', 'true');
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.parentNode.insertBefore(mobilePanel, navbar.nextSibling);

    // Build panel content fresh — captures current auth state
    function buildPanel() {
      mobilePanel.innerHTML = '';

      // ── Nav links list ──
      const navLinks = document.querySelector('.nav-links ul');
      if (navLinks) {
        const list = navLinks.cloneNode(true);
        list.className = 'mobile-nav-list';
        mobilePanel.appendChild(list);
      }

      // ── Auth / profile area ──
      // Always read .nav-right at open time (auth-check may have swapped it)
      const navRight = document.querySelector('.nav-right');
      if (navRight) {
        const rightClone = document.createElement('div');
        rightClone.className = 'mobile-nav-right';

        // If profile dropdown exists, clone the whole thing
        const profileDropdown = navRight.querySelector('.profile-dropdown');
        if (profileDropdown) {
          const pd = profileDropdown.cloneNode(true);
          // Make the cloned profile button close the panel when clicked
          const btn = pd.querySelector('.profile-btn');
          if (btn) {
            btn.onclick = function () {
              const menu = pd.querySelector('.profile-menu');
              if (menu) menu.classList.toggle('show');
            };
          }
          // Close panel when a profile menu link is clicked
          pd.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', closeMenu);
          });
          rightClone.appendChild(pd);
        } else {
          // Not logged in — clone login/signup links
          navRight.querySelectorAll('a, li').forEach(el => {
            rightClone.appendChild(el.cloneNode(true));
          });
        }
        mobilePanel.appendChild(rightClone);
      }

      // Close on link click
      mobilePanel.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function (e) {
          // Only close if it's a real navigation (not profile sub-menu toggle)
          if (!a.closest('.profile-menu')) closeMenu();
        });
      });
    }

    function openMenu() {
      buildPanel(); // re-build every time so auth state is current
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobilePanel.classList.add('open');
      mobilePanel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobilePanel.classList.remove('open');
      mobilePanel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      mobilePanel.classList.contains('open') ? closeMenu() : openMenu();
    });

    document.addEventListener('click', function (e) {
      if (mobilePanel.classList.contains('open') &&
          !mobilePanel.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  });
})();