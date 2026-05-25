// announcement-banner.js — NextStep at the Beach event banner
(function () {
  const BANNER_KEY = 'nextstep-beach-banner-dismissed';

  // Don't show if already dismissed
  if (sessionStorage.getItem(BANNER_KEY)) return;

  const banner = document.createElement('div');
  banner.id = 'announcement-banner';
  banner.innerHTML = `
    <span class="announcement-emoji">🏖️</span>
    <div class="announcement-text">
      <span><strong>NextStep at the Beach</strong> — Ocean Pollution Awareness Event · June 7th, 8:00–11:00 AM · South Pavilion</span>
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSd35nPgEZRsY90ArrUuzdWEidjMsGM5azONIG2TB-B25qOQZA/viewform?usp=header"
         target="_blank" rel="noopener" class="announcement-link">
        Sign Up <i class="fas fa-arrow-right"></i>
      </a>
    </div>
    <button class="announcement-close" id="banner-close" aria-label="Dismiss announcement">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.prepend(banner);
  document.body.classList.add('banner-visible');

  // Slide in after short delay
  setTimeout(function () {
    banner.classList.add('visible');
  }, 500);

  // Dismiss on close
  document.getElementById('banner-close').addEventListener('click', function () {
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    document.body.classList.remove('banner-visible');
    sessionStorage.setItem(BANNER_KEY, 'true');
    setTimeout(function () { banner.remove(); }, 400);
  });
})();