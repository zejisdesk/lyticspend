// LyticSpend Service Worker for background notifications

const CACHE_NAME = 'lyticspend-v1';

// Install event - cache app assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// This is a simple service worker that just forwards to the main service worker
// It's needed because Create React App expects the service worker to be at the root

// Listen for install event
self.addEventListener('install', (event) => {
  console.log('[Public Service Worker] Installing');
  self.skipWaiting(); // Activate immediately
});

// Listen for activate event
self.addEventListener('activate', (event) => {
  console.log('[Public Service Worker] Activating');
  event.waitUntil(self.clients.claim()); // Take control of clients immediately
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('[Public Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Public Service Worker] Skip waiting and activate immediately');
    self.skipWaiting();
    return;
  }
  
  if (event.data && event.data.type === 'SCHEDULE_REMINDERS') {
    const reminderTimes = event.data.reminderTimes;
    console.log('[Public Service Worker] Scheduling reminders:', reminderTimes);
    self.reminderTimes = reminderTimes;
  } else if (event.data && event.data.type === 'TEST_COMMUNICATION') {
    // Handle test communication message
    console.log('[Public Service Worker] Received test communication message');
    
    // Send response back
    if (event.ports && event.ports[0]) {
      console.log('[Public Service Worker] Sending test communication response');
      event.ports[0].postMessage({ 
        type: 'TEST_COMMUNICATION_RESPONSE',
        success: true,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('[Public Service Worker] No message port available to respond');
    }
  } else if (event.data && event.data.type === 'SEND_TEST_NOTIFICATION') {
    // Handle test notification request
    console.log('[Public Service Worker] Received test notification request');
    
    // Show a notification immediately using a Chrome-friendly approach
    try {
      console.log('[Public Service Worker] Attempting to show notification');
      
      // For Chrome, we need to be more careful with the notification options
      const notificationOptions = {
        body: `This is a test notification from the service worker at ${new Date().toLocaleTimeString()}`,
        // Use relative paths for Chrome
        icon: 'logo192.png',
        badge: 'logo192.png',
        // Generate a unique tag for each notification
        tag: 'lyticspend-test-' + Date.now(),
        // Chrome-specific options
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        // Simple action
        actions: [
          {
            action: 'open',
            title: 'Open App'
          }
        ],
        // Data for the notification click handler
        data: {
          url: self.location.origin,
          timestamp: Date.now(),
          test: true
        }
      };
      
      // Show the notification
      return self.registration.showNotification('LyticSpend Test', notificationOptions)
        .then(() => {
          console.log('[Public Service Worker] Notification shown successfully');
          
          // Chrome sometimes doesn't display notifications in development mode
          // Send a message to the client as a backup
          return self.clients.matchAll({ type: 'window' })
            .then(clients => {
              if (clients && clients.length) {
                // Send to all clients
                clients.forEach(client => {
                  client.postMessage({
                    type: 'NOTIFICATION_BACKUP',
                    message: 'A notification was sent. If you don\'t see it, check your browser settings or try minimizing the browser.'
                  });
                });
              }
            });
        })
        .catch(error => {
          console.error('[Public Service Worker] Error showing notification:', error);
          throw error; // Re-throw to trigger fallback
        });
    } catch (error) {
      console.error('[Public Service Worker] Notification error, trying fallback:', error);
      
      // Fallback: Send a message to the main thread to show an alert
      return self.clients.matchAll({ type: 'window' })
        .then(clients => {
          if (clients && clients.length) {
            // Send to all clients
            clients.forEach(client => {
              client.postMessage({
                type: 'NOTIFICATION_FALLBACK',
                message: 'Chrome blocked the notification. Try these steps:\n1. Check Chrome notification settings\n2. Minimize the browser when testing\n3. Try in incognito mode'
              });
            });
          }
        });
    }
    
    // Send response back if there's a port
    if (event.ports && event.ports[0]) {
      console.log('[Public Service Worker] Sending test notification response');
      event.ports[0].postMessage({
        type: 'TEST_NOTIFICATION_RESPONSE',
        success: true,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Store reminders globally so they persist between service worker events
let storedReminders = [];

// Function to schedule notifications
function scheduleReminders(reminderTimes) {
  console.log('Scheduling reminders in Service Worker:', reminderTimes);
  
  // Store reminders globally
  storedReminders = reminderTimes;
  
  // Clear any existing intervals
  if (self._reminderInterval) {
    clearInterval(self._reminderInterval);
  }
  
  // Set up periodic check (every minute)
  self._reminderInterval = setInterval(() => {
    checkAndSendReminders();
  }, 60000); // 60000 ms = 1 minute
  
  // Also check immediately
  checkAndSendReminders();
}

// Function to check if it's time to send a reminder
function checkAndSendReminders() {
  if (!storedReminders || !storedReminders.length) {
    console.log('[SW] No reminders to check');
    return;
  }
  
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  
  console.log(`[SW] Checking reminders at ${currentTimeString}`);
  console.log('[SW] Active reminders:', storedReminders.filter(r => r.enabled).map(r => r.time));
  
  storedReminders.forEach(reminder => {
    if (reminder.enabled && reminder.time === currentTimeString) {
      console.log(`[SW] Sending notification for reminder at ${reminder.time}`);
      self.registration.showNotification('LyticSpend Reminder', {
        body: 'It\'s time to record your expenses for today!',
        icon: '/logo192.png',
        badge: '/logo192.png',
        data: { url: self.location.origin },
        requireInteraction: true, // Keep notification visible until user interacts with it
        vibrate: [200, 100, 200] // Vibration pattern for mobile devices
      });
    }
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Public Service Worker] Notification clicked:', event.notification.tag);
  event.notification.close();
  
  // Check if we have action data
  const action = event.action;
  console.log('[Public Service Worker] Action clicked:', action);
  
  // Get the notification data
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || self.location.origin;
  
  // Open or focus the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          console.log('[Public Service Worker] Focusing existing client');
          return client.focus();
        }
      }
      // Otherwise open a new window
      console.log('[Public Service Worker] Opening new window to:', urlToOpen);
      return self.clients.openWindow(urlToOpen);
    })
  );
});
