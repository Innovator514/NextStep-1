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
    const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';  // Red border for empty required field
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value.trim())) {
            input.style.borderColor = '#ef4444';  // Red border for invalid email
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
            showStep(1);           // Go back to first step
            
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

// Initialize form to first step
showStep(1);
    /* ================================================
       TEAM DATA — edit this array to update the team
       ================================================ */
    const teamMembers = [
      {
        name: "Alex Rivera",
        role: "Co-Founder & CEO",
        bio: "Passionate about local democracy and tech. Former city council aide turned civic-tech builder.",
        emoji: "AR",
        gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
        linkedin: "#",
        twitter: "#",
        email: "alex@nextstep-civic.org"
      },
      {
        name: "Jordan Kim",
        role: "Co-Founder & CTO",
        bio: "Full-stack engineer who believes good software can bring people to the table — literally.",
        emoji: "JK",
        gradient: "linear-gradient(135deg, #10b981, #065f46)",
        linkedin: "#",
        github: "#",
        email: "jordan@nextstep-civic.org"
      },
      {
        name: "Maya Chen",
        role: "Head of Community",
        bio: "Veteran organizer with 8 years building grassroots movements across South Florida.",
        emoji: "MC",
        gradient: "linear-gradient(135deg, #8b5cf6, #4c1d95)",
        linkedin: "#",
        twitter: "#",
        email: "maya@nextstep-civic.org"
      },
      {
        name: "Dev Patel",
        role: "Lead Designer",
        bio: "Designs experiences that make civic life feel approachable, warm, and worth showing up for.",
        emoji: "DP",
        gradient: "linear-gradient(135deg, #ec4899, #831843)",
        linkedin: "#",
        twitter: "#",
        email: "dev@nextstep-civic.org"
      },
      {
        name: "Sofia Morales",
        role: "Events Coordinator",
        bio: "Coordinates 30+ community events per year. Runs on coffee and community spirit.",
        emoji: "SM",
        gradient: "linear-gradient(135deg, #f59e0b, #92400e)",
        linkedin: "#",
        email: "sofia@nextstep-civic.org"
      },
      {
        name: "Marcus Webb",
        role: "Outreach & Partnerships",
        bio: "Connects NextStep with local orgs, schools, and businesses who care about Boca Raton's future.",
        emoji: "MW",
        gradient: "linear-gradient(135deg, #0ea5e9, #0c4a6e)",
        linkedin: "#",
        email: "marcus@nextstep-civic.org"
      }
    ];

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
    const wavePosts = [
      {
        title: "Why Local Elections Matter More Than You Think",
        category: "Civic Engagement", date: "May 10, 2025", readTime: "5 min",
        emoji: "🗳️",
        gradient: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
        body: `<p>Your city council, school board, and county commissioners shape daily life far more directly than national politics — yet turnout in local elections regularly falls below 20%.</p>
        <p>In Boca Raton, a single city commission vote can determine whether a park gets built in your neighborhood, what speed limits look like on your street, or how much your property taxes increase next year. These decisions happen whether or not you're in the room.</p>
        <p>The good news? Local elections are winnable. A well-organized campaign can tip the result with a few hundred votes. That means your one registration drive, your one door-knock, your one post on a neighborhood forum genuinely changes the outcome.</p>
        <p>NextStep exists to close the information gap. We connect you with candidate forums, voting dates, and ways to get involved — so showing up for local races feels as normal as voting for president.</p>`
      },
      {
        title: "Boca's Green Future: 5 Local Initiatives to Watch",
        category: "Environment", date: "Apr 22, 2025", readTime: "4 min",
        emoji: "🌿",
        gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)",
        body: `<p>Earth Day is a good reminder that environmental progress often starts at the city level, not in Washington. Here are five Boca Raton projects worth following this year.</p>
        <p><strong>1. Mangrove Restoration at Spanish River Park</strong> — A multi-year effort to restore 14 acres of coastal wetlands that buffer the city from storm surge.</p>
        <p><strong>2. Municipal Solar Transition</strong> — The city has committed to powering 40% of municipal buildings with solar by 2027.</p>
        <p><strong>3. Single-Use Plastic Reduction Ordinance</strong> — Still in committee, this proposal would ban styrofoam containers at city-permitted events.</p>
        <p><strong>4. Electric Bus Pilot</strong> — Palm Tran is piloting two electric buses on routes that pass through Boca; resident feedback will influence expansion.</p>
        <p><strong>5. Community Garden Network</strong> — Ten new community garden plots are planned for 2025. Applications open in June.</p>`
      },
      {
        title: "How Gen Z Is Reshaping Civic Participation",
        category: "Youth", date: "Apr 5, 2025", readTime: "4 min",
        emoji: "🧑‍🎓",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #92400e 100%)",
        body: `<p>Forget the apathy narrative. Young people in Boca Raton are organizing, petitioning, and showing up — they're just doing it differently than previous generations.</p>
        <p>At Florida Atlantic University, student groups have hosted three town hall-style forums this semester, drawing city commissioners to campus for direct Q&A. Meanwhile, a group of Boca High seniors ran a successful petition for expanded after-school programming that received 1,200 signatures in four days.</p>
        <p>What's different? Gen Z civic action tends to be issue-specific and fast. They're less interested in joining standing committees and more interested in solving a concrete problem, making it visible, and moving on to the next one. Organizations like NextStep are designed for exactly this style of engagement.</p>`
      },
      {
        title: "Tech Tools Every Civic Advocate Should Know",
        category: "Innovation", date: "Mar 28, 2025", readTime: "3 min",
        emoji: "💡",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)",
        body: `<p>You don't need a law degree or a lobbyist to make your voice heard. Here are five digital tools that put real power in your hands.</p>
        <p><strong>Florida Open Data Portal</strong> — Search city and county spending, permits, and meeting minutes. Great for research before a public comment.</p>
        <p><strong>GovTrack / Muni.vote</strong> — Track local legislation and set alerts when bills you care about move forward.</p>
        <p><strong>Change.org + MoveOn</strong> — Classic petition platforms, still effective for building visible support quickly.</p>
        <p><strong>Nextdoor</strong> — Often underutilized for civic purposes. Neighborhood-level organizing and meeting announcements reach people who don't follow city social media.</p>
        <p><strong>NextStep</strong> — Our own platform connects you to upcoming events, badges for participation, and an AI guide (Compass) to answer your local government questions.</p>`
      },
      {
        title: "Neighbors Who Changed Their Block",
        category: "Community", date: "Mar 14, 2025", readTime: "6 min",
        emoji: "🏘️",
        gradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)",
        body: `<p>Three Boca Raton residents share their stories of organizing, petitioning, and turning everyday frustration into real, lasting change.</p>
        <p><strong>Luisa, 42, Camino Real neighborhood</strong>: "Our street had no sidewalk and two kids had near-misses with cars. I went to one city commission meeting, made a three-minute public comment, and was told to fill out a form. Nothing happened. I came back every month for four months with five neighbors. Now we have a sidewalk."</p>
        <p><strong>Terrence, 29, Downtown Boca</strong>: "I noticed our local park equipment was rusting and the basketball courts had no lights. I started a petition, got 400 signatures in a week, and tagged the city's social media account. The parks department reached out within 48 hours."</p>
        <p><strong>Helena, 67, Boca del Mar</strong>: "I organized a neighborhood watch that turned into a neighborhood newsletter that turned into a neighborhood garden. When people know each other, things get done."</p>`
      },
      {
        title: "A Beginner's Guide to the City Budget Process",
        category: "Education", date: "Feb 28, 2025", readTime: "5 min",
        emoji: "📚",
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%)",
        body: `<p>Every year, Boca Raton's city government decides how to spend roughly $300 million in public funds. Here's when — and how — you can influence those decisions.</p>
        <p><strong>January–March: Department Requests</strong> — Each department submits its funding wish list to the city manager. This is the least visible phase but shapes what options commissioners see later.</p>
        <p><strong>April–June: City Manager's Proposed Budget</strong> — The city manager releases a draft budget. This is the best time to contact your commissioner and flag priorities.</p>
        <p><strong>July–August: Budget Workshops</strong> — Public workshops where commissioners debate line items. You can attend in person or watch the livestream and submit written comment.</p>
        <p><strong>September: Public Hearings</strong> — Two required public hearings before the final vote. Three minutes at the microphone is yours by right. Use it.</p>
        <p>NextStep will publish alerts at each stage this year so you never miss a window to weigh in.</p>`
      }
    ];

    function openPost(index) {
      const post = wavePosts[index];
      const overlay = document.getElementById('wave-modal-overlay');
      const content = document.getElementById('wave-modal-content');

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
            ${post.category}
          </div>
          <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 12px;line-height:1.35;">${post.title}</h2>
          <div style="font-size:0.82rem;opacity:0.85;display:flex;gap:12px;">
            <span>📅 ${post.date}</span>
            <span>⏱ ${post.readTime} read</span>
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
      document.getElementById('wave-modal-overlay').style.display = 'none';
      document.body.style.overflow = '';
    }

    document.getElementById('wave-modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) closePost();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePost();
    });
