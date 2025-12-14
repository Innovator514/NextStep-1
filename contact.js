// Contact Form Handling
const contactForm = document.getElementById('contact-form');


// Phone number formatting
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    e.target.value = value;
});

// Show success message if redirected back with ?success=true
if (window.location.search.includes("success=true")) {
    const successMessage = document.createElement("div");
    successMessage.className = "success-message show";
    successMessage.innerHTML = `
        <strong>✓ Message Sent!</strong><br>
        Thanks — we’ll get back to you soon.
    `;
    document.querySelector(".form-card").prepend(successMessage);
}

document.getElementById("contact-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    // ---- Validate EMAIL ----
    const email = document.getElementById("email").value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
        showMessage("❌ Please enter a valid email address.", "error");
        return; // Stop form submission
    }

    const formData = new FormData(this);
    formData.append("_captcha", "false");
    formData.append("_template", "table");

    // Your email endpoint
    const url = "https://formsubmit.co/nextstep.civic@gmail.com";

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            showMessage("❌ Something went wrong. Please try again later.", "error");
            return;
        }

        showMessage("✓ Message sent! We'll get back to you soon.", "success");
        this.reset();

    } catch (err) {
        showMessage("❌ Network error. Please try again.", "error");
    }
});

// ---- DISPLAY MESSAGES ----
function showMessage(text, type) {
    const box = document.createElement("div");
    box.className = `form-message ${type}`;
    box.innerHTML = text;

    document.querySelector(".form-card").prepend(box);

    setTimeout(() => box.remove(), 5000);
}
