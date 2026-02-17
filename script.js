// Log message to confirm JavaScript file has loaded
console.log("JS loaded");

// Get references to key HTML elements
const heroTitle = document.getElementById('heroTitle');
const heroTagline = document.getElementById('heroTagline');
const heroSection = document.getElementById('hero');
const imageReveal = document.getElementById('revealSection');
const heroImage = document.getElementById('heroImage');
const firstPoint = document.querySelector('.point .point-content');
const heroMedia = document.querySelector('.hero-media');

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

  // 6. CONTAINER ZOOM + BORDER RADIUS
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

// Mobile menu is handled by mobile-nav.js (shared across all pages)

// Carousel Functionality
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const dotsNav = document.querySelector(".carousel-dots");

  let slides = Array.from(track.children);
  const slideCount = slides.length;
  let index = 1;
  let autoplayInterval;
  const AUTOPLAY_DELAY = 4000;

  /* Clone slides */
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  slides = Array.from(track.children);

  /* Create dots */
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

  function updateDots() {
    let realIndex = index - 1;
    if (realIndex < 0) realIndex = slideCount - 1;
    if (realIndex >= slideCount) realIndex = 0;

    dots.forEach(d => d.classList.remove("active"));
    dots[realIndex].classList.add("active");
  }

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

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(() => {
      const newIndex = Math.round(track.scrollLeft / slideWidth());

      if (newIndex !== index) {
        index = newIndex;
        updateDots();
      }

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

  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);

  scrollToIndex(true);
  updateDots();
  startAutoplay();
});

// ============================================
// CONTINUOUS INFINITE TYPEWRITER ANIMATION
// ============================================

// Category text mapping with colors
const categoryText = {
  political: { text: "Political", color: "#2563eb" },
  environmental: { text: "Environmental", color: "#10b981" },
  innovative: { text: "Innovative", color: "#ec4899" },
  youth: { text: "Youth", color: "#f59e0b" },
  educational: { text: "Educational", color: "#8b5cf6" }
};

let isAnimating = false;
let animationStopped = false;
let animationLoopId = 0; // unique id to cancel stale loops

// Typewriter function
function typeWriter(element, text, loopId, speed = 50) {
  return new Promise((resolve) => {
    let i = 0;
    function type() {
      if (animationStopped || animationLoopId !== loopId) { resolve(); return; }
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        element.classList.add('done');
        resolve();
      }
    }
    type();
  });
}

// Backspace function
function backspaceWriter(element, loopId, speed = 30) {
  return new Promise((resolve) => {
    function backspace() {
      if (animationStopped || animationLoopId !== loopId) { resolve(); return; }
      if (element.textContent.length > 0) {
        element.textContent = element.textContent.slice(0, -1);
        setTimeout(backspace, speed);
      } else {
        element.classList.remove('done');
        resolve();
      }
    }
    backspace();
  });
}

// Main infinite animation loop
async function infiniteTypewriterLoop(loopId) {
  if (animationStopped || animationLoopId !== loopId) return;

  const engageItems = document.querySelectorAll('.engage-item');

  engageItems.forEach((item, index) => {
    if (index !== 0) {
      item.style.display = 'none';
    } else {
      item.style.fontSize = '65px';
      item.style.textAlign = 'center';
      item.style.fontWeight = '700';
    }
  });

  const singleItem = engageItems[0];
  if (!singleItem) return;
  const typewriterSpan = singleItem.querySelector('.typewriter-text');
  if (!typewriterSpan) return;

  const allCategories = Object.entries(categoryText);
  let currentIndex = 0;

  while (!animationStopped && animationLoopId === loopId) {
    const [, categoryData] = allCategories[currentIndex];
    typewriterSpan.style.color = categoryData.color;
    singleItem.classList.add('typing');

    // Show typing indicator dots while about to type
    typewriterSpan.setAttribute('data-typing', 'true');
    await new Promise(r => setTimeout(r, 300));
    typewriterSpan.removeAttribute('data-typing');

    await typeWriter(typewriterSpan, categoryData.text, loopId, 55);
    await new Promise(r => setTimeout(r, 1100));
    if (animationStopped || animationLoopId !== loopId) break;
    await backspaceWriter(typewriterSpan, loopId, 32);
    await new Promise(r => setTimeout(r, 220));
    if (animationStopped || animationLoopId !== loopId) break;
    currentIndex = (currentIndex + 1) % allCategories.length;
  }
}

// Slide in animations for paragraph
function animateParagraph() {
  const paragraphSide = document.querySelector('.paragraph-side');
  const engageSide = document.querySelector('.engage-side');
  const engageLabel = document.querySelector('.engage-label');
  
  // Center the engage side vertically with paragraph
  engageSide.style.display = 'flex';
  engageSide.style.flexDirection = 'column';
  engageSide.style.justifyContent = 'center';
  engageSide.style.alignItems = 'center';
  
  // Slide in engage side from left
  setTimeout(() => {
    engageSide.classList.add('slide-in');
  }, 200);
  
  // Show "Engage in:" label
  engageLabel.classList.add('show');
  
  // Slide in paragraph from right
  setTimeout(() => {
    paragraphSide.classList.add('slide-in');
  }, 800);
}

// Reset animation — increments loopId so any running loop sees it's stale
function resetAnimation() {
  animationStopped = true;
  animationLoopId++;          // invalidate any running loop instantly

  const paragraphSide = document.querySelector('.paragraph-side');
  const engageSide = document.querySelector('.engage-side');
  const engageLabel = document.querySelector('.engage-label');
  const engageItems = document.querySelectorAll('.engage-item');

  if (paragraphSide) paragraphSide.classList.remove('slide-in');
  if (engageSide)    engageSide.classList.remove('slide-in');
  if (engageLabel)   engageLabel.classList.remove('show');

  engageItems.forEach(item => {
    item.classList.remove('typing');
    const span = item.querySelector('.typewriter-text');
    if (span) { span.textContent = ''; span.classList.remove('done'); }
  });
}

// Start animation — grabs a fresh loopId so only this run is canonical
function startAnimation() {
  animationStopped = false;
  animationLoopId++;
  const myLoopId = animationLoopId;
  animateParagraph();
  setTimeout(() => {
    if (animationLoopId === myLoopId) infiniteTypewriterLoop(myLoopId);
  }, 1000);
}

// Intersection Observer — debounced so rapid scroll doesn't double-fire
function setupTypewriterObserver() {
  const firstPointSection = document.querySelector('.first-point');
  if (!firstPointSection) return;

  let debounceTimer = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (entry.isIntersecting && animationStopped) {
          startAnimation();
        } else if (!entry.isIntersecting && !animationStopped) {
          resetAnimation();
        }
      }, 80); // 80ms debounce prevents flicker on fast scroll
    });
  }, { threshold: 0.25 });

  observer.observe(firstPointSection);
}

document.addEventListener('DOMContentLoaded', setupTypewriterObserver);