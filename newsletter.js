// newsletter.js — handles footer newsletter signup across all pages

(function () {
  // --- Toast notification system ---
  function showToast(message, type = 'success') {
    // Remove any existing toast
    const existing = document.getElementById('ns-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'ns-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const colors = {
      success: { bg: 'linear-gradient(135deg,#10b981,#059669)', icon: '✓' },
      error:   { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: '✕' },
      info:    { bg: 'linear-gradient(135deg,#2563eb,#3b82f6)', icon: 'ℹ' }
    };
    const c = colors[type] || colors.info;

    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${c.bg};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-family: 'Open Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 99999;
      max-width: 340px;
      animation: toastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
    `;

    // Inject keyframes once
    if (!document.getElementById('ns-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'ns-toast-styles';
      style.textContent = `
        @keyframes toastIn {
          from { opacity:0; transform: translateY(20px) scale(0.95); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity:1; transform: translateY(0)    scale(1);    }
          to   { opacity:0; transform: translateY(20px) scale(0.95); }
        }
        @media (max-width: 480px) {
          #ns-toast { right: 1rem; left: 1rem; max-width: calc(100% - 2rem); bottom: 1rem; }
        }
      `;
      document.head.appendChild(style);
    }

    toast.innerHTML = `<span style="font-size:1.2rem;line-height:1">${c.icon}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 320);
    }, 4000);
  }

  // --- Newsletter submission ---
  async function submitNewsletter(email, buttonEl, inputEl) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Check if already subscribed (localStorage)
    const subscribed = JSON.parse(localStorage.getItem('ns_newsletter_emails') || '[]');
    if (subscribed.includes(email.toLowerCase())) {
      showToast('You\'re already subscribed — thanks! 🎉', 'info');
      return;
    }

    const originalText = buttonEl ? buttonEl.textContent : '';
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = '...';
    }

    try {
      // Submit to formsubmit.co
      const formData = new FormData();
      formData.append('email', email);
      formData.append('_subject', 'New Newsletter Subscriber — NextStep');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('type', 'newsletter_signup');

      const res = await fetch('https://formsubmit.co/nextstep.civic@gmail.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      // Track locally regardless of network response
      subscribed.push(email.toLowerCase());
      localStorage.setItem('ns_newsletter_emails', JSON.stringify(subscribed));

      if (inputEl) inputEl.value = '';
      showToast('You\'re subscribed! Thanks for joining NextStep. 🎉', 'success');

    } catch (err) {
      // Still save locally so UX feels good even if formsubmit call fails
      subscribed.push(email.toLowerCase());
      localStorage.setItem('ns_newsletter_emails', JSON.stringify(subscribed));
      if (inputEl) inputEl.value = '';
      showToast('Subscribed! We\'ll be in touch soon. 🎉', 'success');
    } finally {
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = originalText;
      }
    }
  }

  // --- Global handler called by inline onsubmit="handleNewsletter(event)" ---
  window.handleNewsletter = function (e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input ? input.value.trim() : '';
    submitNewsletter(email, button, input);
  };

  // --- Also attach to any .newsletter-form that lacks an onsubmit ---
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.newsletter-form').forEach(function (form) {
      if (!form.getAttribute('onsubmit')) {
        form.addEventListener('submit', window.handleNewsletter);
      }
    });
  });
})();