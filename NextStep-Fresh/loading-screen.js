// loading-screen.js — NextStep branded loader
(function () {
  // Inject loader HTML
  const loader = document.createElement('div');
  loader.id = 'nextstep-loader';
  loader.innerHTML = `
    <img src="images/logo.png" alt="NextStep" class="loader-logo">
    <p class="loader-tagline">Your Voice. Your Future. Your NextStep.</p>
    <div class="loader-bar-track">
      <div class="loader-bar-fill"></div>
    </div>
  `;
  document.body.prepend(loader);

  // Hide after 1s then remove from DOM
  window.addEventListener('load', function () {
    setTimeout(function () {
      loader.classList.add('hidden');
      setTimeout(function () {
        loader.remove();
      }, 500); // matches CSS transition duration
    }, 1000);
  });
})();