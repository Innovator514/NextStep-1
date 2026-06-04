// back-to-top.js — NextStep scroll-to-top button (Stacked Layout Fix)
(function () {
  // 1. Inject the component's CSS rules dynamically with adjusted bottom spacing
  const style = document.createElement('style');
  style.textContent = `
    #back-to-top {
      position: fixed;
      bottom: 6rem; /* Pushed up to sit safely above the dark mode switch */
      right: 2rem;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
      z-index: 99999;
    }
    #back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    #back-to-top:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 28px rgba(37, 99, 235, 0.55);
    }
    #back-to-top:active {
      transform: translateY(-2px);
    }
    @media (max-width: 768px) {
      #back-to-top {
        bottom: 5rem; /* Adjusted for tighter mobile screen profiles */
        right: 1.25rem;
        width: 42px;
        height: 42px;
        font-size: 1rem;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Setup structural logic to build and mount the button elements safely
  function initBackToTop() {
    if (document.getElementById('back-to-top')) return;

    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    // Show or hide button based on page scroll threshold
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    // Smooth scroll straight back up on click
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Prevent crashing by ensuring document.body exists before running
  if (document.body) {
    initBackToTop();
  } else {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  }
})();