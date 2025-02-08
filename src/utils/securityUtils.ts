// Function to clear and redirect
const clearAndReload = () => {
  // Only clear and reload in production
  if (process.env.NODE_ENV === 'production') {
    document.documentElement.innerHTML = '';
    window.location.href = '/';
  }
};

// Prevent right-click context menu
const disableContextMenu = () => {
  document.addEventListener('contextmenu', (e) => {
    if (process.env.NODE_ENV === 'production') {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
};

// Prevent keyboard shortcuts for inspect element and dev tools
const disableDevTools = () => {
  let intervalId: any;
  let isDevToolsOpen = false;
  let warningCount = 0;
  const MAX_WARNINGS = 3;

  // Aggressive detection and prevention
  const aggressive = () => {
    // Check if dev tools is open
    const checkDevTools = () => {
      if (process.env.NODE_ENV !== 'production') return;

      const widthThreshold = window.outerWidth - window.innerWidth > 100;
      const heightThreshold = window.outerHeight - window.innerHeight > 100;

      if (widthThreshold || heightThreshold) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          warningCount++;
          if (warningCount >= MAX_WARNINGS) {
            clearAndReload();
          }
        }
      } else {
        isDevToolsOpen = false;
      }
    };

    // Run checks less frequently
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(checkDevTools, 1000);

    // Prevent common dev tools shortcuts
    document.addEventListener('keydown', (e) => {
      if (process.env.NODE_ENV !== 'production') return;

      const ctrlKey = e.ctrlKey || e.metaKey;
      const shiftKey = e.shiftKey;
      const altKey = e.altKey;
      const key = e.key.toLowerCase();

      if (
        key === 'f12' ||
        e.keyCode === 123 ||
        (ctrlKey && shiftKey && (
          key === 'i' ||
          key === 'j' ||
          key === 'c' ||
          key === 'k' ||
          key === 'e'
        )) ||
        (ctrlKey && key === 'u') ||
        (altKey && ctrlKey && shiftKey)
      ) {
        e.preventDefault();
        e.stopPropagation();
        warningCount++;
        if (warningCount >= MAX_WARNINGS) {
          clearAndReload();
        }
        return false;
      }
    }, { capture: true });

    // Override properties that dev tools may use
    if (process.env.NODE_ENV === 'production') {
      const overrideProp = (obj: any, prop: string, value: any) => {
        try {
          Object.defineProperty(obj, prop, {
            get: () => value,
            set: () => {},
            configurable: false
          });
        } catch (e) {}
      };

      // Disable console completely in production
      overrideProp(window, 'console', {
        log: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        clear: () => {},
      });
    }
  };

  // Start aggressive protection
  aggressive();
};

// Clear console and prevent console access
const disableConsole = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const clearConsole = () => {
    try {
      window.console.clear();
      Object.defineProperty(window, 'console', {
        get: function() {
          return {
            log: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {},
          };
        },
        set: function() {},
        configurable: false
      });
    } catch (e) {}
  };

  clearConsole();
};

// Initialize all security measures
export const initSecurity = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // Disable right click
  disableContextMenu();

  // Disable selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // Disable copy
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // Disable cut
  document.addEventListener('cut', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // Disable paste
  document.addEventListener('paste', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // Initialize core protections
  disableDevTools();
  disableConsole();

  // Additional protection
  document.addEventListener('DOMContentLoaded', () => {
    // Disable text selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      *::selection {
        background: transparent !important;
      }
      
      *::-moz-selection {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });

    // Disable save page
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    }, { capture: true });
  });
}; 