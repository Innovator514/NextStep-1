// ============================================
// DARK MODE TOGGLE - Full Accessibility Support
// ============================================

// This is an Immediately Invoked Function Expression (IIFE)
// The entire dark mode system is wrapped in this function to:
// 1. Avoid polluting the global namespace with variables
// 2. Create a private scope for our variables
// 3. Execute immediately when the script loads
(function() {
  'use strict';
  // 'use strict' enables strict mode which:
  // - Catches common coding mistakes
  // - Prevents use of undeclared variables
  // - Makes code more secure and optimized

  // IMMEDIATELY apply stored theme to prevent flash
  // This runs BEFORE anything else to eliminate white flash on page load
  (function() {
    // Another IIFE that runs immediately
    try {
      // Try block catches errors if localStorage is unavailable (privacy mode, etc.)
      
      const storedTheme = localStorage.getItem('theme');
      // Retrieve the saved theme from browser's localStorage
      // Returns 'light', 'dark', or null if never saved
      
      if (storedTheme) {
        // If a theme was previously saved
        document.documentElement.setAttribute('data-theme', storedTheme);
        // Set the data-theme attribute on <html> element immediately
        // This triggers the CSS theme before page renders
      }
    } catch (e) {
      // If localStorage access fails (Safari private mode, etc.)
      // Silently ignore - page will use default light theme
    }
  })();
  // This IIFE runs and completes before any other code

  // Get stored theme preference or default to light
  function getStoredTheme() {
    // Function to safely retrieve stored theme preference
    try {
      // Try to access localStorage
      return localStorage.getItem('theme') || 'light';
      // Returns stored theme ('light' or 'dark') 
      // If no theme stored, returns 'light' as default (|| operator)
    } catch (e) {
      // If localStorage unavailable
      console.warn('localStorage not available:', e);
      // Log warning to console for debugging
      return 'light';
      // Fall back to light mode
    }
  }

  // Save theme preference
  function setStoredTheme(theme) {
    // Function to safely save theme preference
    try {
      // Try to save to localStorage
      localStorage.setItem('theme', theme);
      // Stores 'light' or 'dark' under the key 'theme'
      // This persists across browser sessions
    } catch (e) {
      // If localStorage unavailable
      console.warn('Could not save theme preference:', e);
      // Log warning - theme will work but won't persist on refresh
    }
  }

  // Apply theme to document
  function applyTheme(theme) {
    // Main function that actually changes the theme
    
    // Apply theme BEFORE any transitions
    document.documentElement.style.transition = 'none';
    // Temporarily disable ALL CSS transitions on <html> element
    // This prevents the white flash during theme change
    
    document.documentElement.setAttribute('data-theme', theme);
    // Set data-theme attribute to 'light' or 'dark'
    // This triggers all the [data-theme="dark"] CSS rules
    
    // Force reflow to apply theme immediately
    void document.documentElement.offsetHeight;
    // This line forces the browser to recalculate layout immediately
    // void operator ensures the return value is discarded
    // offsetHeight access triggers a reflow (layout recalculation)
    // This ensures theme is applied before we re-enable transitions
    
    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      // requestAnimationFrame waits for next animation frame
      // This happens after the browser has painted the new theme
      
      document.documentElement.style.transition = '';
      // Re-enable CSS transitions by removing the inline style
      // Now transitions will work normally for future changes
    });
    
    // Update button aria-label
    const toggleBtn = document.querySelector('.theme-toggle');
    // Find the theme toggle button in the DOM
    
    if (toggleBtn) {
      // If button exists (it might not on first load)
      const newLabel = theme === 'dark' 
        ? 'Switch to light mode (currently dark mode)' 
        : 'Switch to dark mode (currently light mode)';
      // Create descriptive label based on current theme
      // Screen readers will announce this label
      
      toggleBtn.setAttribute('aria-label', newLabel);
      // Update the aria-label attribute for accessibility
      // Screen reader users hear this label when focused on button
    }

    // Announce theme change to screen readers
    announceThemeChange(theme);
    // Call function to create audible announcement for screen readers
  }

  // Announce theme change to screen readers
  function announceThemeChange(theme) {
    // Function that makes theme changes audible for screen reader users
    
    const announcement = document.getElementById('theme-announcement');
    // Find the screen reader announcement element
    // This is an invisible element with role="status" and aria-live="polite"
    
    if (announcement) {
      // If the announcement element exists
      announcement.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} mode activated`;
      // Set text content to "Dark mode activated" or "Light mode activated"
      // Screen readers automatically announce changes to aria-live regions
      
      // Clear after 1 second
      setTimeout(() => {
        // setTimeout schedules a function to run after 1000ms (1 second)
        announcement.textContent = '';
        // Clear the announcement text
        // This prepares it for the next announcement
      }, 1000);
      // After 1 second, the announcement is cleared
    }
  }

  // Toggle between light and dark mode
  function toggleTheme() {
    // Function that switches between themes
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    // Get current theme from <html> data-theme attribute
    // If attribute doesn't exist, default to 'light' (|| operator)
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    // Determine new theme:
    // If current is 'light', new is 'dark'
    // If current is 'dark', new is 'light'
    // This is a ternary operator: condition ? ifTrue : ifFalse
    
    applyTheme(newTheme);
    // Apply the new theme (updates CSS and UI)
    
    setStoredTheme(newTheme);
    // Save new theme to localStorage for next visit
  }

  // Check system preference
  function getSystemTheme() {
    // Function that detects the user's operating system theme preference
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // window.matchMedia checks if browser supports media queries
      // '(prefers-color-scheme: dark)' is a CSS media query
      // It checks if user's OS is set to dark mode
      // .matches is true if the query matches
      
      return 'dark';
      // User prefers dark mode
    }
    return 'light';
    // User prefers light mode or preference not set
  }

  // Initialize theme
  function initializeTheme() {
    // Function that runs on page load to set initial theme
    
    // Get stored theme, or fall back to system preference
    let theme = getStoredTheme();
    // First, try to get user's saved preference from previous visit
    
    // If no stored preference, use system preference
    if (!localStorage.getItem('theme')) {
      // Check if user has NEVER saved a preference
      // getStoredTheme() returns 'light' if no preference, but we need to know
      // if they explicitly chose 'light' or never chose anything
      
      theme = getSystemTheme();
      // Use OS preference if user hasn't made a choice
      // This respects user's system-wide preference
    }
    
    applyTheme(theme);
    // Apply the determined theme
  }

  // Create toggle button
  function createToggleButton() {
    // Function that creates and inserts the theme toggle button into the page
    
    // Check if button already exists
    if (document.querySelector('.theme-toggle-container')) {
      // Look for existing toggle button
      return;
      // If found, exit function - don't create duplicate
    }

    const container = document.createElement('div');
    // Create a new <div> element
    
    container.className = 'theme-toggle-container';
    // Set CSS class for styling
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    // Get current theme to set initial button state
    
    container.innerHTML = `
      <button 
        class="theme-toggle" 
        aria-label="${currentTheme === 'dark' ? 'Switch to light mode (currently dark mode)' : 'Switch to dark mode (currently light mode)'}"
        type="button"
        role="switch"
        aria-checked="${currentTheme === 'dark'}"
      >
        <span class="theme-icon" aria-hidden="true">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </span>
        <span class="theme-toggle-text">${currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
      <div id="theme-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    `;
    // Template literal (backticks) creates multi-line HTML string
    // ${} inserts JavaScript expressions into the string
    // Creates button with:
    // - aria-label: Describes button for screen readers
    // - type="button": Prevents form submission if inside a form
    // - role="switch": Tells screen readers it's a toggle switch
    // - aria-checked: Indicates current state (on/off)
    // - Sun and moon SVG icons for visual indication
    // - Screen reader announcement element (invisible but audible)
    
    document.body.appendChild(container);
    // Add the button container to the end of <body>
    // Now button is visible on the page
    
    // Add click handler
    const button = container.querySelector('.theme-toggle');
    // Find the button element we just created
    
    button.addEventListener('click', () => {
      // Add event listener for click events
      // Arrow function executes when button is clicked
      
      toggleTheme();
      // Switch themes
      
      // Update button text
      const currentTheme = document.documentElement.getAttribute('data-theme');
      // Get new current theme (just changed)
      
      const textSpan = button.querySelector('.theme-toggle-text');
      // Find the text span inside button
      
      if (textSpan) {
        // If text span exists
        textSpan.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        // Update text to show opposite mode name
        // If dark, show "Light Mode" (what clicking will switch to)
      }
      
      // Update aria-checked
      button.setAttribute('aria-checked', currentTheme === 'dark');
      // Update accessibility attribute
      // 'true' if dark mode, 'false' if light mode
      // Screen readers announce this change
    });

    // Add keyboard support (Enter and Space)
    button.addEventListener('keydown', (e) => {
      // Listen for keyboard events
      // e is the event object containing information about the key pressed
      
      if (e.key === 'Enter' || e.key === ' ') {
        // If Enter key or Space key was pressed
        // These are standard activation keys for buttons
        
        e.preventDefault();
        // Prevent default behavior (like scrolling for Space)
        
        button.click();
        // Trigger button click
        // This reuses the click handler logic
      }
    });
  }

  // Listen for system theme changes
  function watchSystemTheme() {
    // Function that monitors OS theme changes while app is running
    
    if (window.matchMedia) {
      // Check if browser supports matchMedia API
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Create media query object that matches dark mode preference
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        // Check if modern addEventListener is supported
        
        mediaQuery.addEventListener('change', (e) => {
          // Listen for changes to the media query
          // e.matches will be true if dark mode is now preferred
          
          // Only apply system theme if user hasn't set a preference
          if (!localStorage.getItem('theme')) {
            // Check if user has explicitly chosen a theme
            // If they have, respect their choice over system changes
            
            const newTheme = e.matches ? 'dark' : 'light';
            // Determine new theme based on system preference
            
            applyTheme(newTheme);
            // Apply the new theme
            // User's explicit choices are preserved
          }
        });
      } 
      // Older browsers
      else if (mediaQuery.addListener) {
        // Fallback for older browsers (deprecated API)
        
        mediaQuery.addListener((e) => {
          // Same logic as above, different API
          if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
          }
        });
      }
    }
  }

  // Add screen reader only class for announcements
  function addSROnlyStyles() {
    // Function that adds CSS for screen-reader-only content
    // This content is invisible but audible
    
    const style = document.createElement('style');
    // Create a <style> element
    
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    // CSS that makes element invisible but still accessible to screen readers
    // position: absolute - removes from normal flow
    // width/height: 1px - nearly invisible (0px can be ignored by screen readers)
    // margin: -1px - moves off screen
    // overflow: hidden - hides overflow
    // clip: rect(0,0,0,0) - clips element to nothing
    // white-space: nowrap - prevents text wrapping
    // border-width: 0 - no border
    
    document.head.appendChild(style);
    // Add style element to <head>
    // Now .sr-only class is available throughout the site
  }

  // Initialize when DOM is ready
  function init() {
    // Main initialization function that sets everything up
    
    addSROnlyStyles();
    // Add screen reader styles first
    
    initializeTheme();
    // Apply initial theme based on saved preference or system
    
    createToggleButton();
    // Create and add toggle button to page
    
    watchSystemTheme();
    // Start monitoring for system theme changes
  }

  // Run initialization
  if (document.readyState === 'loading') {
    // Check if DOM is still loading
    // readyState can be: 'loading', 'interactive', or 'complete'
    
    document.addEventListener('DOMContentLoaded', init);
    // If still loading, wait for DOM to be ready
    // DOMContentLoaded fires when HTML is parsed (before images/stylesheets)
  } else {
    // DOM is already ready (script loaded late or async)
    init();
    // Run initialization immediately
  }

  // Make toggle function globally available
  window.toggleDarkMode = toggleTheme;
  // Expose toggleTheme function as a global variable
  // Other scripts can call window.toggleDarkMode() to switch themes
  // window is the global object in browsers

  // Expose theme utilities globally for other scripts
  window.themeUtils = {
    // Create an object with utility functions
    // Other scripts can access these via window.themeUtils
    
    getCurrentTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
    // Function that returns current theme
    // Arrow function syntax: () => returnValue
    
    setTheme: applyTheme,
    // Reference to applyTheme function
    // Other scripts can call window.themeUtils.setTheme('dark')
    
    toggleTheme: toggleTheme
    // Reference to toggleTheme function
    // Other scripts can call window.themeUtils.toggleTheme()
  };

  // Custom event for theme changes (for map tiles, etc.)
  document.addEventListener('themeChanged', function(e) {
    // Listen for custom theme change events
    // e.detail will contain theme information
    
    // This event can be listened to by other scripts
    console.log('Theme changed to:', e.detail.theme);
    // Log theme change to console for debugging
  });

  // Dispatch theme change event
  function dispatchThemeChange(theme) {
    // Function that broadcasts theme changes to other scripts
    
    const event = new CustomEvent('themeChanged', {
      // Create a custom event named 'themeChanged'
      // CustomEvent allows passing data to listeners
      
      detail: { theme: theme }
      // Attach theme data to event
      // Other scripts can access this via e.detail.theme
    });
    
    document.dispatchEvent(event);
    // Fire the event on document
    // All listeners for 'themeChanged' will be triggered
  }

  // Update applyTheme to dispatch event
  const originalApplyTheme = applyTheme;
  // Save reference to original applyTheme function
  
  applyTheme = function(theme) {
    // Redefine applyTheme to add event dispatching
    
    originalApplyTheme(theme);
    // Call original function to apply theme
    
    dispatchThemeChange(theme);
    // Also dispatch event to notify other scripts
    // This is function decoration/wrapping pattern
  };

})();
// End of IIFE - function executes immediately
// All variables and functions inside are private (not global)
// Only window.toggleDarkMode and window.themeUtils are exposed globally
