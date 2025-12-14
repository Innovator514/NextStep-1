console.log("JS loaded");

// Get elements
const heroTitle = document.getElementById('heroTitle');
const heroTagline = document.getElementById('heroTagline');
const heroSection = document.getElementById('hero');
const imageReveal = document.getElementById('revealSection');
const heroImage = document.getElementById('heroImage');
const firstPoint = document.querySelector('.point .point-content');

let ticking = false;

function smoothParallax() {
  const scrollY = window.scrollY;

  // Get positions
  const imageRect = imageReveal.getBoundingClientRect();
  const imageBottom = scrollY + imageRect.bottom;
  const titleRect = heroTitle.getBoundingClientRect();
  const taglineRect = heroTagline.getBoundingClientRect();

  // 1. MOVE TITLE + TAGLINE TOGETHER
  const translation = scrollY * 1.2;
  heroTitle.style.transform = `translateY(${translation}px)`;
  heroTagline.style.transform = `translateY(${translation}px)`;

  // 2. FADE OUT AS APPROACHING IMAGE BOTTOM
  // Calculate distance from bottom of image
  const fadeZoneHeight = 700; // Start fading 400px before image bottom
  const distanceFromImageBottom = imageBottom - scrollY;
  
  if (distanceFromImageBottom < fadeZoneHeight) {
    // Calculate opacity based on distance (1 at top, 0 at bottom)
    const opacity = Math.max(0, distanceFromImageBottom / fadeZoneHeight);
    heroTitle.style.opacity = opacity;
    heroTagline.style.opacity = opacity;
  } else {
    heroTitle.style.opacity = 1;
    heroTagline.style.opacity = 1;
  }

  // 3. CHECK IF TEXT IS OVER IMAGE
  const titleOverImage = titleRect.bottom > imageRect.top && titleRect.top < imageRect.bottom;
  const taglineOverImage = taglineRect.bottom > imageRect.top && taglineRect.top < imageRect.bottom;

  // 4. TITLE COLOR CHANGE
  if (titleOverImage) {
    heroTitle.style.color = "white";
    const accent = heroTitle.querySelector(".accent");
    if (accent) accent.style.color = "white";
    heroTitle.style.textShadow = "0 4px 20px rgba(0,0,0,0.8)";
  } else {
    heroTitle.style.color = "rgb(1, 9, 67)";
    const accent = heroTitle.querySelector(".accent");
    if (accent) accent.style.color = "#1e40ff";
    heroTitle.style.textShadow = "none";
  }

  // 5. TAGLINE COLOR CHANGE
  if (taglineOverImage) {
    heroTagline.style.color = "white";
    heroTagline.style.textShadow = "0 2px 15px rgba(0,0,0,0.6)";
  } else {
    heroTagline.style.color = "rgb(1, 9, 67)";
    heroTagline.style.textShadow = "none";
  }

  // 6. IMAGE ONLY ZOOMS IN - NO VERTICAL MOVEMENT
  const scale = 1 + Math.min(scrollY / 2000, 0.2); // Only zoom in, no translateY
  heroImage.style.transform = `scale(${scale})`;

  // 7. SHOW FIRST POINT CONTENT WHEN TITLE FADES
  if (distanceFromImageBottom < fadeZoneHeight) {
    firstPoint.classList.add('visible');
  }

  ticking = false;
}

// Smooth optimized scroll listener
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(smoothParallax);
      ticking = true;
    }
  },
  { passive: true }
);

// Resize recalculates
window.addEventListener("resize", () => {
  requestAnimationFrame(smoothParallax);
});

// Initial call
smoothParallax();

function handleNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input').value;
    alert(`Thank you for subscribing with ${email}!`);
    event.target.reset();
}
