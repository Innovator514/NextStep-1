// scroll-progress.js — NextStep scroll progress bar
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Double check it doesn't already exist to avoid duplicates
    if (document.getElementById('scroll-progress')) return;

    // 2. Create and insert the bar securely at the top of the body
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    // 3. Track scrolling metrics smoothly
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      // Update the CSS width profile dynamically
      bar.style.width = progress + '%';
    });
  });
})();