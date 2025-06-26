// Version check utility to force refresh when a new version is deployed
const APP_VERSION = '1.0.1'; // Increment this whenever you make significant changes
const VERSION_KEY = 'app_version';

export const checkVersion = () => {
  const savedVersion = localStorage.getItem(VERSION_KEY);
  
  // If version is different or not set, update it and force refresh
  if (savedVersion !== APP_VERSION) {
    console.log(`App updated from ${savedVersion || 'initial'} to ${APP_VERSION}`);
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          console.log(`Clearing cache: ${cacheName}`);
          caches.delete(cacheName);
        });
        // Force reload after cache clearing
        window.location.reload(true);
      });
    } else {
      // For browsers that don't support Cache API
      window.location.reload(true);
    }
  }
};

export const registerVersionCheck = () => {
  // Check version on initial load
  checkVersion();
  
  // Also check version when the app becomes visible again (tab switch, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkVersion();
    }
  });
};
