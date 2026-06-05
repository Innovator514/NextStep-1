// Get contact form element
const contactForm = document.getElementById('contact-form');
let currentStep = 1;      // Current step in multi-step form
const totalSteps = 3;     // Total number of steps

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        // Remove all non-digits
        let value = e.target.value.replace(/\D/g, '');
        
        // Format as (123) 456-7890
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;  // Update input with formatted value
    });
}

// Email validation function
function isValidEmail(email) {
    // Regular expression for email validation
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);  // Test email against pattern
}

// Show specific step in multi-step form
function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < stepNumber) {
            step.classList.add('completed');     // Mark as completed
            step.classList.remove('active');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');        // Mark as current
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');  // Reset future steps
        }
    });
    
    // Update progress lines between steps
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        if (index < stepNumber - 1) {
            line.classList.add('completed');     // Completed line
        } else {
            line.classList.remove('completed');  // Incomplete line
        }
    });
    
    currentStep = stepNumber;  // Update current step variable
}

// Validate current step before proceeding
function validateStep(stepNumber) {
    const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    const validationScope = step || contactForm || document;
    const inputs = validationScope.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';  // Red border for empty required field
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value.trim())) {
            input.style.borderColor = '#ef4444';  // Red border for invalid email
            isValid = false;
        } else if (input.id === 'message' && input.value.trim().length < 25) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '';  // Reset border color
        }
    });
    
    if (!isValid) {
        showMessage("⚠️ Please fill in all required fields correctly.", "error");
    }
    
    return isValid;  // Return validation result
}

// Next button handlers
document.querySelectorAll('.next-button').forEach(button => {
    button.addEventListener('click', () => {
        if (validateStep(currentStep)) {       // Validate current step
            if (currentStep < totalSteps) {    // Not on last step
                showStep(currentStep + 1);     // Go to next step
            }
        }
    });
});

// Previous button handlers
document.querySelectorAll('.prev-button').forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep > 1) {                 // Not on first step
            showStep(currentStep - 1);         // Go to previous step
        }
    });
});

// Clear validation styling on input
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(239, 68, 68)') {  // If has error styling
            this.style.borderColor = '';                       // Clear it
        }
    });
});

const messagePrompts = {
    volunteer: {
        prompt: 'Tell us which kinds of opportunities you like, your availability, and whether you need volunteer hours verified.',
        starter: 'I am interested in volunteering with NextStep. I am available on [days/times], and I am most interested in [events, outreach, research, social media, or another area]. Please let me know the next steps.'
    },
    partnership: {
        prompt: 'Include your organization, who you serve, the kind of collaboration you want, and your ideal timeline.',
        starter: 'I am reaching out from [organization]. We serve [audience/community] and would like to partner with NextStep on [event, listing, outreach, or project]. Our timeline is [date/timeframe], and the best follow-up contact is [name/contact].'
    },
    event: {
        prompt: 'Include the event name, date, time, location, organizer, registration link, audience, and deadline if there is one.',
        starter: 'I would like to submit an event for NextStep. Event name: [name]. Date/time: [date and time]. Location: [location]. Organizer: [organizer]. Registration link: [link]. Audience/requirements: [details].'
    },
    feedback: {
        prompt: 'Tell us what page or feature you used, what worked, what was confusing, and what you would change.',
        starter: 'I have feedback about [page/feature]. What worked well was [details]. What felt confusing or could be improved was [details]. My suggestion is [idea].'
    },
    press: {
        prompt: 'Include your outlet, deadline, topic, requested format, and any questions you want us to answer.',
        starter: 'I am contacting NextStep for a press/media request. Outlet: [outlet]. Deadline: [deadline]. Topic: [topic]. I am hoping to schedule [interview/comment/background information] and can be reached at [contact].'
    },
    sponsorship: {
        prompt: 'Share your organization, sponsorship interest, budget range if known, timeline, and what impact you hope to support.',
        starter: 'I am interested in sponsoring NextStep. Organization: [name]. We are interested in supporting [events, student outreach, platform development, or another area]. Timeline/budget: [details]. Please send more information about sponsorship options.'
    },
    other: {
        prompt: 'Share the main question, any relevant context, and what kind of response would be most helpful.',
        starter: 'I am reaching out about [topic]. Here is the context: [details]. I would appreciate help with [question/request], and the best way to follow up is [email/phone].'
    }
};

function initMessageHelper() {
    const messageInput = document.getElementById('message');
    const inquiryType = document.getElementById('inquiry-type');
    const promptText = document.getElementById('message-prompt');
    const countText = document.getElementById('message-count');
    const starterButton = document.getElementById('message-fill-button');

    if (!messageInput || !promptText || !countText) return;

    function updateCounter() {
        const text = messageInput.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        countText.textContent = `${words} word${words === 1 ? '' : 's'} / ${chars} character${chars === 1 ? '' : 's'}`;
        countText.classList.toggle('needs-more', chars > 0 && chars < 25);
        countText.classList.toggle('ready', chars >= 25);
    }

    function updatePrompt() {
        const selectedType = inquiryType ? inquiryType.value : '';
        const details = messagePrompts[selectedType] || messagePrompts.other;
        promptText.textContent = details.prompt;
    }

    if (inquiryType) {
        inquiryType.addEventListener('change', updatePrompt);
    }
    messageInput.addEventListener('input', updateCounter);

    if (starterButton) {
      starterButton.addEventListener('click', () => {
        const selectedType = inquiryType ? inquiryType.value : '';
        const details = messagePrompts[selectedType] || messagePrompts.other;
        const currentText = messageInput.value.trim();
        messageInput.value = currentText ? `${currentText}\n\n${details.starter}` : details.starter;
        messageInput.focus();
        updateCounter();
      });
    }

    updatePrompt();
    updateCounter();
}

initMessageHelper();

// Form submission handler
if (contactForm) {
    contactForm.addEventListener("submit", async function(e) {
        e.preventDefault();  // Prevent default form submission

        if (!validateStep(currentStep)) {  // Validate final step
            return;
        }

        const submitBtn = this.querySelector('.submit-button');
        const originalBtnText = submitBtn.innerHTML;
        
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span><span class="button-icon">⏳</span>`;

        // Prepare form data for FormSubmit
        const formData = new FormData(this);
        
        // Add hidden fields required by FormSubmit
        formData.append('_captcha', 'false'); // Disable captcha
        formData.append('_subject', 'New Contact Form Submission from NextStep');
        formData.append('_template', 'table'); // Use table format
        
        const url = "https://formsubmit.co/nextstep.civic@gmail.com";

        try {
            // Submit form data
            const response = await fetch(url, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Success
            showMessage("✓ Message sent successfully! We'll get back to you soon.", "success");
            this.reset();          // Reset form
            showStep(1);           // Go back to first step, if this page uses steps
            const inquiryType = document.getElementById('inquiry-type');
            const messageInput = document.getElementById('message');
            if (inquiryType) inquiryType.dispatchEvent(new Event('change'));
            if (messageInput) messageInput.dispatchEvent(new Event('input'));
            
            // Scroll to success message
            window.scrollTo({
                top: document.querySelector('.form-card').offsetTop - 100,
                behavior: 'smooth'
            });

        } catch (err) {
            console.error('Form submission error:', err);
            showMessage("⚠️ Something went wrong. Please try again or email us directly at nextstep.civic@gmail.com.", "error");
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Display success/error messages
function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message box
    const box = document.createElement("div");
    box.className = `form-message ${type}`;  // Add success or error class
    box.innerHTML = text;
    box.setAttribute('role', 'alert');       // Accessibility
    box.setAttribute('aria-live', 'polite'); // Screen reader announcement

    // Insert at top of form
    const formCard = document.querySelector(".form-card");
    if (formCard) {
        formCard.prepend(box);
        
        // Auto-remove after 6 seconds
        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(-10px)';
            box.style.transition = 'all 0.3s ease';
            setTimeout(() => box.remove(), 300);
        }, 6000);
    }
}

// FAQ Accordion functionality
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Availability Status - Shows if support is online
function updateAvailabilityStatus() {
    const now = new Date();
    const day = now.getDay();   // 0 = Sunday, 6 = Saturday
    const hour = now.getHours(); // 0-23
    
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('availability-text');
    
    if (!statusDot || !statusText) return;
    
    // Check if it's during business hours
    let isOnline = false;
    
    if (day >= 1 && day <= 5) {           // Monday to Friday
        isOnline = hour >= 9 && hour < 18; // 9 AM to 6 PM
    } else if (day === 6) {                // Saturday
        isOnline = hour >= 10 && hour < 16; // 10 AM to 4 PM
    }
    
    // Update UI based on online status
    if (isOnline) {
        statusDot.classList.remove('offline');
        statusText.textContent = 'We\'re online now!';
    } else {
        statusDot.classList.add('offline');
        
        // Calculate next available time
        if (day === 0) {  // Sunday
            statusText.textContent = 'Back Monday at 9:00 AM';
        } else if (day === 6 && hour >= 16) {  // Saturday after hours
            statusText.textContent = 'Back Monday at 9:00 AM';
        } else if (day >= 1 && day <= 5 && hour >= 18) {  // Weekday after hours
            statusText.textContent = 'Back tomorrow at 9:00 AM';
        } else if (day >= 1 && day <= 5 && hour < 9) {  // Weekday before hours
            statusText.textContent = 'Back today at 9:00 AM';
        } else {
            statusText.textContent = 'Currently offline';
        }
    }
}

// Update availability on load and every minute
updateAvailabilityStatus();
setInterval(updateAvailabilityStatus, 60000);  // Check every 60 seconds

// Initialize form to first step on pages that still use step markup
if (document.querySelector('.form-step')) {
    showStep(1);
}
    /* ================================================
       TEAM DATA — edit this array to update the team
       ================================================ */
    const teamMembers = [
    {
        name: "Emily Yu",
        role: "President & Founder",
        bio: "Emily is a student leader passionate about STEM, innovation, and community engagement. At school, she participates in organizations such as Mu Alpha Theta, FTC Robotics, and DECA, where she enjoys teamwork, problem-solving, and leadership. As part of NextStep, she hopes to empower students by making opportunities and resources more accessible. Outside of academics, Emily enjoys playing the clarinet, ",
        image: "images/team/emily.png",
        email: "mailto:emilysmile315@gmail.com",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Julia Spett",
        role: "President & Founder",
        bio: "Julia manages logistics, event systems, and internal coordination to keep projects organized and scalable.",
        image: "images/team/julia.jpg",
        email: "mailto:julia@nextstep-civic.org",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Arianna Shaprow",
        role: "Vice President of Partnership and Outreach",
        bio: "Arianna is an award-winning poet and social activist who has been featured in news outlets across the country, including ABC, Fox, CBS, NBC, and The CW. Arianna’s exhibitions in museums and writings have been highlighted in The New York Times Kids Edition, Miami Voyage Magazine, and the Boca Raton Observer. She is passionate about civil service, social activism, and her artistic endeavors.",
        image: "images/team/arianna.jpeg",
        email: "mailto:ariannashaprow@gmail.com",
        instagram: "https://www.instagram.com/ariannashaprow/",
    },
    {
        name: "Sophie Bollela",
        role: "Vice President of Outreach",
        bio: "Sophie Bollella is the Vice President of the department of social media and engagement. She has received diverse academic awards. Including the principles award, which means being well-rounded in sports, academics, and social aspects of the community. This was given due to playing sports her whole life and being a captain, being in high level classes, and being apart of clubs. This then allows her to be able to see and hear the needs of different types of people. Additionally in helping out the local community by doing volunteer work for beach cleanups, fun runs, and animal welfare.",
        image: "images/team/sophie.jpeg",
        email: "mailto:sophiebollella10@gmail.com",
    },
    {
        name: "Zakia",
        role: "Vice President of Outreach",
        bio: "She is an award-winning poet and social activist who has been featured in news outlets across the country, including ABC, Fox, CBS, NBC, and The CW. Arianna’s exhibitions in museums and writings have been highlighted in The New York Times Kids Edition, Miami Voyage Magazine, and the Boca Raton Observer. She is passionate about civil service, social activism, and her artistic endeavors.",
        image: "images/team/zakia.jpeg",
        email: "mailto:zakia@nextstep-civic.org",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Lily Montero",
        role: "Marketing & Social Media Director",
        bio: "She is an award-winning poet and social activist who has been featured in news outlets across the country, including ABC, Fox, CBS, NBC, and The CW. Arianna’s exhibitions in museums and writings have been highlighted in The New York Times Kids Edition, Miami Voyage Magazine, and the Boca Raton Observer. She is passionate about civil service, social activism, and her artistic endeavors.",
        image: "images/team/lily.JPG",
        email: "mailto:lilymontero@gmail.com",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Cynthia Chen",
        role: "Director of Product & Web Development",
        bio: "She is an award-winning poet and social activist who has been featured in news outlets across the country, including ABC, Fox, CBS, NBC, and The CW. Arianna’s exhibitions in museums and writings have been highlighted in The New York Times Kids Edition, Miami Voyage Magazine, and the Boca Raton Observer. She is passionate about civil service, social activism, and her artistic endeavors.",
        image: "images/team/cynthia.jpg",
        email: "mailto:cynthia@nextstep-civic.org",
        instagram: "#",
        linkedin: "#"
    },
        {
        name: "Keerith Mahal",
        role: "Events & Engagement Director",
        bio: "Keerith Mahal is an accomplished student, writer, and honor student recognized for her academic achievement and creativity. She earned first place in the Palm Beach County Insight Through Education Kindness Contest for promoting positive community values through communication and storytelling. As a writer for the Sikh Youth Writers Association, she creates engaging content about her Sikh faith and culture, demonstrating strong writing skills and a commitment to personal growth and meaningful impact.",
        image: "images/team/keerith.PNG",
        email: "mailto:keerith@nextstep-civic.org",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Jasmine Behroozi",
        role: "Director of Partnerships",
        bio: "Hi, I’m Jasmine! I’m a student who enjoys being involved in my community and helping out with local projects and events. I’m especially interested in environmental initiatives and finding ways to bring people together. Through NextStep, I hope to help make a positive impact and encourage others to get more involved in the community too.",
        image: "images/team/jasmine.JPEG",
        email: "mailto:behroozijasmine@gmail.com",
        instagram: "#",
        linkedin: "#"
    },
    {
        name: "Kiran Behroozi",
        role: "Research & Policy Coordinator",
        bio: "She is an award-winning poet and social activist who has been featured in news outlets across the country, including ABC, Fox, CBS, NBC, and The CW. Arianna’s exhibitions in museums and writings have been highlighted in The New York Times Kids Edition, Miami Voyage Magazine, and the Boca Raton Observer. She is passionate about civil service, social activism, and her artistic endeavors.",
        image: "images/team/kiran.jpeg",
        email: "mailto:kiran.behroozi@gmail.com",
        instagram: "#",
        linkedin: "#"
    }
    ];

function createTeamCard(member) {
  return `
    <div class="team-card">

      <div class="team-image-wrapper">
        <img src="${member.image}" alt="${member.name}" class="team-image">
      </div>

      <div class="team-card-content">

        <h3 class="team-member-name">
          ${member.name}
        </h3>

        <div class="team-member-role">
          ${member.role}
        </div>

        <p class="team-member-bio">
          ${member.bio}
        </p>

        <div class="team-member-links">

          <a href="${member.email}" class="team-contact-btn">
            <i class="fas fa-envelope"></i>
          </a>

          <a href="${member.instagram}" class="team-contact-btn">
            <i class="fab fa-instagram"></i>
          </a>

          <a href="${member.linkedin}" class="team-contact-btn">
            <i class="fab fa-linkedin-in"></i>
          </a>

        </div>

      </div>

    </div>
  `;
}

function renderTeamGrid() {
  const grid = document.getElementById("teamGrid");

  const topTwo = teamMembers.slice(0, 2);
  const middleThree = teamMembers.slice(2, 5);
  const remaining = teamMembers.slice(5);

  grid.innerHTML = `
  
    <div class="team-row top-row">
      ${topTwo.map(createTeamCard).join("")}
    </div>

    <div class="team-row middle-row">
      ${middleThree.map(createTeamCard).join("")}
    </div>

    <div class="team-row bottom-row">
      ${remaining.map(createTeamCard).join("")}
    </div>

  `;
}
    /* Build team cards */
    function buildTeamCards() {
      const grid = document.getElementById('teamGrid');
      grid.innerHTML = teamMembers.map((m, i) => `
        <div class="team-card" style="animation-delay:${i * 0.07}s">
          <div class="team-avatar" style="background:${m.gradient};">${m.emoji}</div>
          <div class="team-member-name">${m.name}</div>
          <div class="team-member-role">${m.role}</div>
          <div class="team-member-bio">${m.bio}</div>
          <div class="team-member-links">
            ${m.linkedin ? `<a href="${m.linkedin}" class="team-social-link" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
            ${m.twitter  ? `<a href="${m.twitter}"  class="team-social-link" title="Twitter"><i class="fab fa-x-twitter"></i></a>` : ''}
            ${m.github   ? `<a href="${m.github}"   class="team-social-link" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
            ${m.email    ? `<a href="mailto:${m.email}" class="team-social-link" title="Email"><i class="fas fa-envelope"></i></a>` : ''}
          </div>
        </div>
      `).join('');
    }

    /* Toggle open/close */
    function toggleTeam() {
      const btn    = document.getElementById('teamToggleBtn');
      const drawer = document.getElementById('teamDrawer');
      const isOpen = drawer.classList.contains('open');

      if (!isOpen && document.getElementById('teamGrid').children.length === 0) {
        buildTeamCards();
      }

      drawer.classList.toggle('open');
      btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    }

    /* ================================================
       WAVE BLOG DATA
       ================================================ */
    let wavePosts = [

    ];
    const builtInWavePosts = wavePosts.slice();

    const waveCategorySlugs = {
      'Civic Engagement': 'civic',
      Environment: 'environment',
      Youth: 'youth',
      Innovation: 'innovation',
      Community: 'community',
      Education: 'education'
    };

    function escapeHTML(value) {
      return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]));
    }

    function stripHTML(value) {
      const temp = document.createElement('div');
      temp.innerHTML = value || '';
      return temp.textContent || temp.innerText || '';
    }

    function getPostCategorySlug(post) {
      return post.categorySlug || waveCategorySlugs[post.categoryLabel] || waveCategorySlugs[post.category] || String(post.category || 'civic').toLowerCase().replace(/\s+/g, '-');
    }

    function getPostCategoryLabel(post) {
      return post.categoryLabel || post.category || 'Wave';
    }

    function getPostExcerpt(post) {
      if (post.excerpt) return post.excerpt;
      return stripHTML(post.body).slice(0, 150).trim() + '...';
    }

    function normalizeWavePost(post) {
      return {
        title: post.title || 'Untitled Wave Post',
        category: post.categoryLabel || post.category || 'Wave',
        categoryLabel: post.categoryLabel || post.category || 'Wave',
        categorySlug: post.category || post.categorySlug || waveCategorySlugs[post.categoryLabel] || waveCategorySlugs[post.category] || 'civic',
        date: post.date || 'Recently',
        readTime: post.readTime || '4 min',
        emoji: post.emoji || '🌊',
        gradient: post.gradient || 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        excerpt: post.excerpt || '',
        body: post.body || '<p>No post body has been added yet.</p>'
      };
    }

    function createWaveCard(post, index, featured = false) {
      const category = getPostCategoryLabel(post);
      return `
        <a class="wave-card${featured ? ' featured' : ''}" href="#" onclick="openPost(${index});return false;" data-cat="${escapeHTML(getPostCategorySlug(post))}">
          <div class="wave-card-img" style="background:${escapeHTML(post.gradient)};">
            <span>${escapeHTML(post.emoji)}</span><span class="wave-card-cat">${escapeHTML(category)}</span>
          </div>
          <div class="wave-card-body">
            <div class="wave-card-meta">
              <span><i class="fas fa-calendar-alt"></i> ${escapeHTML(post.date)}</span>
              <span><i class="fas fa-clock"></i> ${escapeHTML(post.readTime)}</span>
            </div>
            <div class="wave-card-title">${escapeHTML(post.title)}</div>
            <div class="wave-card-excerpt">${escapeHTML(getPostExcerpt(post))}</div>
            <span class="wave-read-more">Read more <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>
      `;
    }

    function renderWavePosts() {
      const featuredRow = document.querySelector('.blog-featured-row');
      const rowThree = document.querySelector('.blog-row-3');
      const rowTwo = document.querySelector('.blog-row-2');
      if (!featuredRow || !rowThree || !rowTwo) return;

      const normalizedPosts = wavePosts.map(normalizeWavePost);
      wavePosts = normalizedPosts;

      featuredRow.innerHTML = normalizedPosts.length ? `
        ${createWaveCard(normalizedPosts[0], 0, true)}
        <div class="wave-sidebar">
          ${normalizedPosts.slice(1, 3).map((post, offset) => createWaveCard(post, offset + 1)).join('')}
        </div>
      ` : '<div class="wave-empty-state">No Wave posts are published yet.</div>';

      rowThree.innerHTML = normalizedPosts.slice(3, 6).map((post, offset) => createWaveCard(post, offset + 3)).join('');
      rowTwo.innerHTML = normalizedPosts.slice(6).map((post, offset) => createWaveCard(post, offset + 6)).join('');
    }

    async function loadWavePostsFromFirestore() {
      if (!document.querySelector('.blog-featured-row')) return;
      renderWavePosts();

      try {
        const [{ initializeApp, getApps }, { getFirestore, collection, getDocs, query, orderBy }] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
        ]);
        const firebaseConfig = {
          apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
          authDomain: "nextstep-12b9a.firebaseapp.com",
          projectId: "nextstep-12b9a",
          storageBucket: "nextstep-12b9a.firebasestorage.app",
          messagingSenderId: "630600034259",
          appId: "1:630600034259:web:6b6284e147a6f79cda7126",
          measurementId: "G-WH3JL7Y7BR"
        };
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const remotePosts = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.type === 'wavePost' && data.isPublished !== false) remotePosts.push(normalizeWavePost(data));
        });
        if (remotePosts.length) {
          wavePosts = remotePosts.concat(builtInWavePosts);
          renderWavePosts();
        }
      } catch (err) {
        console.warn('Using built-in Wave posts because Firestore posts could not load:', err);
      }
    }

    function openPost(index) {
      const post = wavePosts[index];
      const overlay = document.getElementById('wave-modal-overlay');
      const content = document.getElementById('wave-modal-content');
      if (!post || !overlay || !content) return;

      content.innerHTML = `
        <div style="background:${post.gradient};padding:36px 32px 28px;border-radius:24px 24px 0 0;color:white;position:relative;">
          <button onclick="closePost()" style="
            position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);
            border:none;color:white;width:36px;height:36px;border-radius:50%;
            font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;
            background:rgba(255,255,255,0.2);padding:0.3rem 0.75rem;border-radius:20px;display:inline-block;margin-bottom:12px;">
            ${escapeHTML(getPostCategoryLabel(post))}
          </div>
          <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 12px;line-height:1.35;">${escapeHTML(post.title)}</h2>
          <div style="font-size:0.82rem;opacity:0.85;display:flex;gap:12px;">
            <span>📅 ${escapeHTML(post.date)}</span>
            <span>⏱ ${escapeHTML(post.readTime)}</span>
          </div>
        </div>
        <div style="padding:28px 32px 32px;font-family:'Open Sans',sans-serif;color:#334155;line-height:1.75;font-size:0.97rem;">
          ${post.body}
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:12px;">Enjoyed this? Share it with your community.</p>
            <div style="display:flex;gap:10px;justify-content:center;">
              <a href="#" style="padding:8px 18px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:white;text-decoration:none;border-radius:20px;font-weight:700;font-size:0.85rem;">
                <i class="fab fa-x-twitter"></i> Share
              </a>
              <a href="#" style="padding:8px 18px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;text-decoration:none;border-radius:20px;font-weight:700;font-size:0.85rem;">
                <i class="fab fa-linkedin-in"></i> Share
              </a>
            </div>
          </div>
        </div>
      `;

      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closePost() {
      const overlay = document.getElementById('wave-modal-overlay');
      if (!overlay) return;
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    const waveModalOverlay = document.getElementById('wave-modal-overlay');
    if (waveModalOverlay) {
      waveModalOverlay.addEventListener('click', function(e) {
        if (e.target === this) closePost();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePost();
    });

    loadWavePostsFromFirestore();
