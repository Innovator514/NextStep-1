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