// cookie-consent.js — NextStep cookie consent banner
(function () {
  // Don't show if already decided
  if (localStorage.getItem('nextstep-cookies')) return;

  // Create banner
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-text">
      <p>
        <strong>🍪 We use cookies</strong> — NextStep uses cookies and similar technologies to keep you signed in,
        remember your preferences (like dark mode), and analyze how our platform is used via Firebase.
        By continuing, you agree to our
        <a href="privacy-policy.html">Privacy Policy</a>.
      </p>
    </div>
    <div class="cookie-buttons">
      <button class="cookie-btn-decline" id="cookie-decline">Decline</button>
      <button class="cookie-btn-accept" id="cookie-accept">Accept All</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Slide in after short delay
  setTimeout(function () {
    banner.classList.add('visible');
  }, 800);

  function dismiss(choice) {
    localStorage.setItem('nextstep-cookies', choice);
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    setTimeout(function () { banner.remove(); }, 400);
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    dismiss('accepted');
  });

  document.getElementById('cookie-decline').addEventListener('click', function () {
    dismiss('declined');
  });
})();