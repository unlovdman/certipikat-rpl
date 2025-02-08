// Function to clear and redirect
const clearAndReload = () => {
  // Only clear and reload in production
  if (process.env.NODE_ENV === 'production') {
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
  });
};

// Prevent keyboard shortcuts for inspect element and dev tools
const disableDevTools = () => {
  let isDevToolsOpen = false;
  let warningCount = 0;
  const MAX_WARNINGS = 3;

  // Check for dev tools
  const checkDevTools = () => {
    if (process.env.NODE_ENV !== 'production') return;

    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

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
  setInterval(checkDevTools, 2000);

  // Prevent common dev tools shortcuts
  document.addEventListener('keydown', (e) => {
    if (process.env.NODE_ENV !== 'production') return;

    const ctrlKey = e.ctrlKey || e.metaKey;
    const shiftKey = e.shiftKey;
    const key = e.key.toLowerCase();

    if (
      (key === 'f12' || e.keyCode === 123) ||
      (ctrlKey && shiftKey && key === 'i') ||
      (ctrlKey && key === 'u')
    ) {
      e.preventDefault();
      warningCount++;
      if (warningCount >= MAX_WARNINGS) {
        clearAndReload();
      }
      return false;
    }
  });
};

// Initialize all security measures
export const initSecurity = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  // Basic protections
  disableContextMenu();
  disableDevTools();

  // Disable text selection in production
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  });
}; 