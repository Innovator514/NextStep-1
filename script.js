// Log message to confirm JavaScript file has loaded
console.log("JS loaded");

// Get references to key HTML elements
const heroTitle = document.getElementById('heroTitle');
const heroTagline = document.getElementById('heroTagline');
const heroSection = document.getElementById('hero');
const imageReveal = document.getElementById('revealSection');
const heroImage = document.getElementById('heroImage');
const firstPoint = document.querySelector('.point .point-content');
const heroMedia = document.querySelector('.hero-media'); // Get the container

// CRITICAL: Check if heroImage is an iframe (video) or img (image)
const isVideo = heroImage && heroImage.tagName === 'IFRAME';

// Flag to prevent multiple animation frames from running simultaneously
let ticking = false;

// Store the original HTML content of the title (includes the <span> tag)
const originalTitleHTML = heroTitle.innerHTML;

// Main parallax scroll animation function
function smoothParallax() {
  const scrollY = window.scrollY;

  // Safety check - only run if all required elements exist on the page
  if (!heroTitle || !heroTagline || !heroImage || !imageReveal || !heroMedia) {
    return;
  }

  // Get position information for the image reveal section
  const imageRect = imageReveal.getBoundingClientRect();
  const imageBottom = imageRect.bottom + scrollY;
 
  
  // 1. MOVE TITLE + TAGLINE TOGETHER (FAST through image)
  const maxTranslation = imageBottom - 35.5;
  const translation = Math.min(scrollY * 2.2, maxTranslation);
  heroTitle.style.transform = `translateY(${translation}px)`;
  heroTagline.style.transform = `translateY(${translation}px)`;
  
  // Get updated positions AFTER transform has been applied
  const titleRect = heroTitle.getBoundingClientRect();
  const taglineRect = heroTagline.getBoundingClientRect();
  const titleBottom = titleRect.bottom + scrollY;

  // FONT SCALE (shrinks while scrolling)
  const minScale = 0.556;
  const maxScale = 1;
  const fontScroll = Math.min(scrollY, maxTranslation);
  const scaleProgress = Math.min(fontScroll / 500, 1);
  const fontScale = maxScale - (maxScale - minScale) * scaleProgress;

  // Apply both scale and translation transforms together
  heroTitle.style.transform = `translateY(${translation}px) scale(${fontScale})`;
  heroTagline.style.transform = `translateY(${translation}px) scale(${fontScale})`;

  // 2. DISAPPEAR AT END OF IMAGE
  if (titleBottom >= imageBottom) {
    heroTagline.style.opacity = 0;
    heroTitle.textContent = "Your Next Step";
  } else {
    heroTagline.style.opacity = 1;
    heroTitle.innerHTML = originalTitleHTML;
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

  // 6. CONTAINER ZOOM + BORDER RADIUS (NEW APPROACH)
  const imageScrollMultiplier = 1.0;
  const effectiveScroll = scrollY * imageScrollMultiplier;
  
  // Width expansion: starts at 70%, expands to 100%
  const startWidth = 80;
  const endWidth = 100;
  const widthProgress = Math.min(effectiveScroll / 800, 1);
  const currentWidth = startWidth + (endWidth - startWidth) * widthProgress;
  
  // Border radius: starts at 40px, goes to 0px (square corners)
  const startRadius = 40;
  const endRadius = 0;
  const currentRadius = startRadius - (startRadius - endRadius) * widthProgress;
  
  // Apply width and border radius to CONTAINER instead of image
  heroMedia.style.width = `${currentWidth}%`;
  heroMedia.style.borderRadius = `${currentRadius}px`;
  
  // Keep video/image at fixed scale inside container
  if (isVideo) {
    // For video: keep centered and at 1.3x to hide black bars
    heroImage.style.transform = `translate(-50%, -50%) scale(1.3)`;
    heroImage.style.width = `100%`;
    heroImage.style.height = `100%`;
    heroImage.style.borderRadius = `${currentRadius}px`;
  } else {
    // For regular image: no zoom, just fill container
    heroImage.style.transform = `scale(1)`;
    heroImage.style.width = `100%`;
    heroImage.style.borderRadius = `${currentRadius}px`;
  }

  // Reset ticking flag to allow next animation frame
  ticking = false;
}

// Scroll event listener - uses passive mode for better performance
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

// Window resize event listener - recalculates on window size change
window.addEventListener("resize", () => {
  requestAnimationFrame(smoothParallax);
}, { passive: true });

// Initial call - run parallax function on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', smoothParallax);
} else {
  smoothParallax();
}

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav ul');
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    
    const navdiv = document.querySelector('.navdiv');
    
    if (navdiv && nav) {
        navdiv.insertBefore(hamburger, nav);
        
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('mobile-open');
            this.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('mobile-open') && 
                !nav.contains(e.target) && 
                !hamburger.contains(e.target)) {
                nav.classList.remove('mobile-open');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('mobile-open');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
});

// Carousel Functionality
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const dotsNav = document.querySelector(".carousel-dots");

  let slides = Array.from(track.children);
  const slideCount = slides.length;
  let index = 1; // start on first real slide
  let autoplayInterval;
  const AUTOPLAY_DELAY = 4000;

  /* ---- Clone slides ---- */
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  slides = Array.from(track.children);

  /* ---- Create dots (real slides only) ---- */
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    dotsNav.appendChild(dot);

    dot.addEventListener("click", () => {
      index = i + 1;
      scrollToIndex();
      resetAutoplay();
    });
  }

  const dots = Array.from(dotsNav.children);

  function slideWidth() {
    return slides[0].getBoundingClientRect().width;
  }

  /* ---- Scroll helper ---- */
  function scrollToIndex(jump = false) {
    if (jump) track.classList.add("jump");

    track.scrollTo({
      left: slideWidth() * index,
      behavior: jump ? "auto" : "smooth"
    });

    if (jump) {
      requestAnimationFrame(() => track.classList.remove("jump"));
    }
  }

  /* ---- Update dots ---- */
  function updateDots() {
    let realIndex = index - 1;
    if (realIndex < 0) realIndex = slideCount - 1;
    if (realIndex >= slideCount) realIndex = 0;

    dots.forEach(d => d.classList.remove("active"));
    dots[realIndex].classList.add("active");
  }

  /* ---- Autoplay ---- */
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      index++;
      scrollToIndex();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  /* ---- Buttons ---- */
  prevBtn.addEventListener("click", () => {
    index--;
    scrollToIndex();
    resetAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    index++;
    scrollToIndex();
    resetAutoplay();
  });

  /* ---- Scroll handling ---- */
  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(() => {
      const newIndex = Math.round(track.scrollLeft / slideWidth());

      if (newIndex !== index) {
        index = newIndex;
        updateDots();
      }

      /* ---- Loop jump ---- */
      if (index === 0) {
        index = slideCount;
        scrollToIndex(true);
      }

      if (index === slideCount + 1) {
        index = 1;
        scrollToIndex(true);
      }
    });
  });

  /* ---- Pause on hover ---- */
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);

  /* ---- Init ---- */
  scrollToIndex(true);
  updateDots();
  startAutoplay();
});
