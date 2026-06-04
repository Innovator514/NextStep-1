// loading-screen.js — NextStep branded loader (Once Per Session Fix)
(function () {
  // 1. Check if the user has already seen the loader during this browser session
  const LOADER_KEY = 'nextstep-loader-displayed';
  if (sessionStorage.getItem(LOADER_KEY)) return;

  // 2. Inject CSS rules dynamically
  const style = document.createElement('style');
  style.textContent = `
    #nextstep-loader {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }
    #nextstep-loader.hidden {
      opacity: 0;
      visibility: hidden;
    }
    .loader-logo {
      width: 120px;
      height: auto;
      animation: loaderPulse 1.2s ease-in-out infinite;
      filter: brightness(0) invert(1);
    }
    .loader-tagline {
      color: rgba(255, 255, 255, 0.9);
      font-family: 'Open Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      animation: loaderFadeIn 0.6s ease 0.2s both;
    }
    .loader-bar-track {
      width: 180px;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      animation: loaderFadeIn 0.6s ease 0.3s both;
    }
    .loader-bar-fill {
      height: 100%;
      width: 0%;
      background: white;
      border-radius: 10px;
      animation: loaderBar 1s ease 0.3s forwards;
    }
    @keyframes loaderPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.06); opacity: 0.85; }
    }
    @keyframes loaderFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes loaderBar {
      0% { width: 0%; }
      60% { width: 75%; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  // 3. Setup loader build logic
  function initLoader() {
    if (document.getElementById('nextstep-loader')) return;

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

    function dismissLoader() {
      setTimeout(function () {
        loader.classList.add('hidden');
        
        // Mark session as complete so they don't see it on subsequent clicks
        sessionStorage.setItem(LOADER_KEY, 'true');

        setTimeout(function () {
          loader.remove();
          style.remove();
        }, 500);
      }, 1000);
    }

    if (document.readyState === 'complete') {
      dismissLoader();
    } else {
      window.addEventListener('load', dismissLoader);
    }
  }

  // 4. Dom execution filtering
  if (document.body) {
    initLoader();
  } else {
    document.addEventListener('DOMContentLoaded', initLoader);
  }
})();