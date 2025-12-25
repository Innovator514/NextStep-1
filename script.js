// Log message to confirm JavaScript file has loaded
console.log("JS loaded");

// Get references to key HTML elements
const heroTitle = document.getElementById('heroTitle'); // Main hero title element
const heroTagline = document.getElementById('heroTagline'); // Hero tagline/subtitle element
const heroSection = document.getElementById('hero'); // Hero section container
const imageReveal = document.getElementById('revealSection'); // Image reveal section
const heroImage = document.getElementById('heroImage'); // The hero image itself
const firstPoint = document.querySelector('.point .point-content'); // First content point section

// Flag to prevent multiple animation frames from running simultaneously
let ticking = false;

// Store the original HTML content of the title (includes the <span> tag)
const originalTitleHTML = heroTitle.innerHTML;

// Main parallax scroll animation function
function smoothParallax() {
  // Get current scroll position from top of page
  const scrollY = window.scrollY;

  // Safety check - only run if all required elements exist on the page
  if (!heroTitle || !heroTagline || !heroImage || !imageReveal) {
    return; // Exit function if any element is missing
  }

  // Get position information for the image reveal section
  const imageRect = imageReveal.getBoundingClientRect(); // Get element's position relative to viewport
  const imageBottom = imageRect.bottom + scrollY; // Calculate absolute position of bottom edge
 
  
  // 1. MOVE TITLE + TAGLINE TOGETHER (FAST through image)
  const maxTranslation = imageBottom - 35.5; // Maximum distance to move (stops before image ends)
  const translation = Math.min(scrollY * 2.2, maxTranslation); // Calculate movement (2.2x scroll speed, capped)
  heroTitle.style.transform = `translateY(${translation}px)`; // Apply vertical movement to title
  heroTagline.style.transform = `translateY(${translation}px)`; // Apply same movement to tagline
  
  // Get updated positions AFTER transform has been applied
  const titleRect = heroTitle.getBoundingClientRect(); // Get title's new position
  const taglineRect = heroTagline.getBoundingClientRect(); // Get tagline's new position
  const titleBottom = titleRect.bottom + scrollY; // Calculate title's absolute bottom position


  // FONT SCALE (shrinks while scrolling)
  const minScale = 0.556;  // Smallest font size (55.6% of original)
  const maxScale = 1;    // Original font size (100%)

  // Clamp scroll value so shrinking stops at image bottom
  const fontScroll = Math.min(scrollY, maxTranslation);

  // Calculate how far through the shrinking animation we are (0 to 1)
  const scaleProgress = Math.min(fontScroll / 500, 1); // Over 500px of scroll

  // Interpolate between max and min scale based on progress
  const fontScale = maxScale - (maxScale - minScale) * scaleProgress;

  // Apply both scale and translation transforms together
  heroTitle.style.transform = `translateY(${translation}px) scale(${fontScale})`;
  heroTagline.style.transform = `translateY(${translation}px) scale(${fontScale})`;

  // 2. DISAPPEAR AT END OF IMAGE
  // Hide tagline when title reaches the bottom of the image
  if (titleBottom >= imageBottom) {
    heroTagline.style.opacity = 0; // Fade out tagline
    heroTitle.textContent = "Your Next Step"; // Change title text (removes accent span)
  } else {
    heroTagline.style.opacity = 1; // Keep tagline visible
    heroTitle.innerHTML = originalTitleHTML; // Restore original HTML with accent span
  }

  // 3. CHECK IF TEXT IS OVER IMAGE
  // Detect if title overlaps with image section
  const titleOverImage = titleRect.bottom > imageRect.top && titleRect.top < imageRect.bottom;
  // Detect if tagline overlaps with image section
  const taglineOverImage = taglineRect.bottom > imageRect.top && taglineRect.top < imageRect.bottom;

  // 4. TITLE COLOR CHANGE
  if (titleOverImage) {
    // Title is over the image - make it white for contrast
    heroTitle.style.color = "white";
    const accent = heroTitle.querySelector(".accent"); // Find accent span element
    if (accent) accent.style.color = "white"; // Make accent white too
    heroTitle.style.textShadow = "0 4px 20px rgba(0,0,0,0.8)"; // Add shadow for readability
  } else {
    // Title is not over image - use default dark blue color
    heroTitle.style.color = "rgb(1, 9, 67)";
    const accent = heroTitle.querySelector(".accent"); // Find accent span
    if (accent) accent.style.color = "#1e40ff"; // Make accent blue
    heroTitle.style.textShadow = "none"; // Remove shadow
  }


  // 5. TAGLINE COLOR CHANGE
  if (taglineOverImage) {
    // Tagline is over the image - make it white
    heroTagline.style.color = "white";
    heroTagline.style.textShadow = "0 2px 15px rgba(0,0,0,0.6)"; // Add shadow
  } else {
    // Tagline is not over image - use default color
    heroTagline.style.color = "rgb(1, 9, 67)";
    heroTagline.style.textShadow = "none"; // Remove shadow
  }



  // 6. IMAGE ZOOM + WIDTH EXPANSION + BORDER RADIUS
  const imageScrollMultiplier = 1.0; // Scroll speed multiplier for image effects
  const effectiveScroll = scrollY * imageScrollMultiplier; // Calculate effective scroll amount
  
  // Scale (zoom in) - image gets larger as you scroll
  const scale = 1 + Math.min(effectiveScroll / 2000, 0.2); // Zoom up to 20% larger over 2000px
  
  // Width expansion: starts at 80%, expands to 100%
  const startWidth = 80; // Starting width percentage
  const endWidth = 100;   // Ending width percentage (full width)
  const widthProgress = Math.min(effectiveScroll / 800, 1); // Progress over 800px of scroll
  const currentWidth = startWidth + (endWidth - startWidth) * widthProgress; // Calculate current width
  
  // Border radius: starts at 20px, goes to 0px (square corners)
  const startRadius = 20; // Starting border radius
  const endRadius = 0; // Ending border radius (square)
  const currentRadius = startRadius - (startRadius - endRadius) * widthProgress; // Calculate current radius
  
  // Apply all transformations to the image
  heroImage.style.transform = `scale(${scale})`; // Apply zoom
  heroImage.style.width = `${currentWidth}%`; // Apply width
  heroImage.style.borderRadius = `${currentRadius}px`; // Apply border radius

  // Reset ticking flag to allow next animation frame
  ticking = false;
}

// Scroll event listener - uses passive mode for better performance
window.addEventListener(
  "scroll",
  () => {
    // Only schedule animation if one isn't already scheduled
    if (!ticking) {
      requestAnimationFrame(smoothParallax); // Schedule animation for next frame
      ticking = true; // Set flag to prevent multiple schedules
    }
  },
  { passive: true } // CRITICAL: Passive listener doesn't block scroll performance
);

// Window resize event listener - recalculates on window size change
window.addEventListener("resize", () => {
  requestAnimationFrame(smoothParallax); // Recalculate positions on resize
}, { passive: true }); // Passive for better performance

// Initial call - run parallax function on page load
if (document.readyState === 'loading') {
  // If DOM is still loading, wait for it
  document.addEventListener('DOMContentLoaded', smoothParallax);
} else {
  // DOM is ready, run immediately
  smoothParallax();
}


// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get navigation menu element
    const nav = document.querySelector('nav ul');
    
    // Create hamburger button element
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle'; // Add CSS class
    hamburger.innerHTML = '<span></span><span></span><span></span>'; // Three lines for hamburger icon
    hamburger.setAttribute('aria-label', 'Toggle menu'); // Accessibility label
    
    // Get navigation container
    const navdiv = document.querySelector('.navdiv');
    
    // Only proceed if both elements exist
    if (navdiv && nav) {
        // Insert hamburger button before the navigation menu
        navdiv.insertBefore(hamburger, nav);
        
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from bubbling to document
            nav.classList.toggle('mobile-open'); // Toggle menu visibility
            this.classList.toggle('active'); // Toggle hamburger animation
            document.body.classList.toggle('menu-open'); // Toggle body class (prevents scroll)
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            // Check if menu is open and click is outside menu/hamburger
            if (nav.classList.contains('mobile-open') && 
                !nav.contains(e.target) && 
                !hamburger.contains(e.target)) {
                nav.classList.remove('mobile-open'); // Close menu
                hamburger.classList.remove('active'); // Reset hamburger
                document.body.classList.remove('menu-open'); // Re-enable scroll
            }
        });
        
        // Close menu when clicking a nav link
        const navLinks = nav.querySelectorAll('a'); // Get all navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('mobile-open'); // Close menu
                hamburger.classList.remove('active'); // Reset hamburger
                document.body.classList.remove('menu-open'); // Re-enable scroll
            });
        });
    }
});