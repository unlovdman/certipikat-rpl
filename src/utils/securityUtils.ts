// Function to clear and redirect
const clearAndReload = () => {
  document.documentElement.innerHTML = '';
  window.location.href = '/';
};

// Prevent right-click context menu
const disableContextMenu = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.location.reload();
    return false;
  }, { capture: true });
};

// Prevent keyboard shortcuts for inspect element and dev tools
const disableDevTools = () => {
  let intervalId: any;
  let isDevToolsOpen = false;

  // Aggressive detection and prevention
  const aggressive = () => {
    // Check if dev tools is open
    const checkDevTools = () => {
      const any = window.any || {};
      const isFF = /Firefox/i.test(navigator.userAgent);
      const isOpera = /Opera/i.test(navigator.userAgent);
      const widthThreshold = window.outerWidth - window.innerWidth > 100;
      const heightThreshold = window.outerHeight - window.innerHeight > 100;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';

      if (
        window.Firebug?.chrome?.isInitialized ||
        widthThreshold ||
        heightThreshold ||
        (isFF && any.bar) ||
        isOpera
      ) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          clearAndReload();
        }
      }
    };

    // Run checks frequently
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(checkDevTools, 100);

    // Prevent common dev tools shortcuts
    document.addEventListener('keydown', (e) => {
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
        clearAndReload();
        return false;
      }
    }, { capture: true });

    // Override properties that dev tools may use
    const overrideProp = (obj: any, prop: string, value: any) => {
      try {
        Object.defineProperty(obj, prop, {
          get: () => value,
          set: () => {},
          configurable: false
        });
      } catch (e) {}
    };

    // Disable console completely
    overrideProp(window, 'console', {
      log: () => clearAndReload(),
      info: () => clearAndReload(),
      warn: () => clearAndReload(),
      error: () => clearAndReload(),
      debug: () => clearAndReload(),
      clear: () => clearAndReload(),
    });

    // Disable debugging functions
    overrideProp(window, 'debug', () => clearAndReload());
    overrideProp(window, 'debugger', () => clearAndReload());

    // Additional protection
    (() => {
      function detectDevTools() {
        const d = new Date();
        debugger;
        const dur = new Date().getTime() - d.getTime();
        if (dur > 100) {
          clearAndReload();
        }
      }

      setInterval(detectDevTools, 100);

      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          clearAndReload();
        }
      });
      console.log(element);
    })();

    // Prevent source view
    document.addEventListener('keypress', (e) => {
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        clearAndReload();
      }
    }, { capture: true });
  };

  // Start aggressive protection
  aggressive();

  // Additional layer of protection using debugger
  setInterval(() => {
    Function("debugger")();
  }, 50);
};

// Clear console and prevent console access
const disableConsole = () => {
  const clearConsole = () => {
    try {
      window.console.clear();
      Object.defineProperty(window, 'console', {
        get: function() {
          clearAndReload();
          return {};
        },
        set: function() {},
        configurable: false
      });
    } catch (e) {}
  };

  clearConsole();
  setInterval(clearConsole, 100);
};

// Initialize all security measures
export const initSecurity = () => {
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

  // Disable source view
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      clearAndReload();
      return false;
    }
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
      clearAndReload();
      return false;
    }, { capture: true });

    // Disable save page
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        clearAndReload();
        return false;
      }
    }, { capture: true });
  });
}; 