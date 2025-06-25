/**
 * Notification Service for LyticSpend
 * Handles sending notifications at scheduled times
 */

// Check if notifications are supported
export const checkNotificationSupport = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Check if Service Worker is supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Register the service worker
export const registerServiceWorker = async () => {
  if (!isServiceWorkerSupported()) {
    console.error('Service Worker not supported');
    return false;
  }
  
  try {
    // Use the standard service worker URL from Create React App
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    console.log('Registering service worker with URL:', swUrl);
    
    // Check if we already have an active service worker
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    if (existingRegistration) {
      console.log('Found existing service worker:', existingRegistration);
      return existingRegistration;
    }
    
    // Register the new service worker
    const registration = await navigator.serviceWorker.register(swUrl, { 
      scope: '/',
      updateViaCache: 'none' // Don't use cached version
    });
    
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker is ready');
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) {
    return 'unsupported';
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    // If permission is granted, register the service worker
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!checkNotificationSupport()) {
    console.error('Notifications not supported');
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    console.error('Notification permission not granted');
    return false;
  }
  
  try {
    // Try to use Service Worker for notification if available
    if (isServiceWorkerSupported() && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          ...options,
          icon: '/logo192.png',
          badge: '/logo192.png'
        });
      });
    } else {
      // Fall back to regular Notification API
      const notification = new Notification(title, options);
      
      // Handle notification click
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    }
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Function to update reminders in the Service Worker
export const updateServiceWorkerReminders = async () => {
  if (!isServiceWorkerSupported()) {
    console.error('Service Worker not supported');
    return false;
  }
  
  try {
    // Make sure service worker is registered and ready
    const registration = await navigator.serviceWorker.ready;
    
    // Get saved reminder times
    const savedReminderTimes = localStorage.getItem('reminderTimes');
    if (!savedReminderTimes) {
      console.error('No reminder times found in localStorage');
      return false;
    }
    
    const reminderTimes = JSON.parse(savedReminderTimes);
    console.log('Reminder times to send:', reminderTimes);
    
    // Send reminder times to all service worker clients
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_REMINDERS',
        reminderTimes: reminderTimes
      });
      
      console.log('Sent reminder times to Service Worker:', reminderTimes);
      return true;
    } else {
      console.warn('No active Service Worker found, waiting for it to activate...');
      
      // Wait for the service worker to activate if it's installing or waiting
      if (registration.installing || registration.waiting) {
        const serviceWorker = registration.installing || registration.waiting;
        
        // Return a promise that resolves when the service worker is activated
        return new Promise((resolve) => {
          serviceWorker.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              console.log('Service Worker now activated, sending reminders');
              
              // Now that it's activated, send the message
              registration.active.postMessage({
                type: 'SCHEDULE_REMINDERS',
                reminderTimes: reminderTimes
              });
              
              resolve(true);
            }
          });
        });
      } else {
        console.error('No Service Worker found (not even installing)');
        return false;
      }
    }
  } catch (error) {
    console.error('Error updating Service Worker reminders:', error);
    return false;
  }
};

// Function to check if a reminder should be sent now
export const checkAndSendReminders = () => {
  // Get current settings from localStorage
  const notificationsEnabled = localStorage.getItem('notifications') === 'true';
  if (!notificationsEnabled) {
    console.log('Notifications are disabled, skipping reminder check');
    return;
  }
  
  // Check if notification permission is granted
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted, skipping reminder check');
    return;
  }
  
  // Get saved reminder times
  const savedReminderTimes = localStorage.getItem('reminderTimes');
  if (!savedReminderTimes) {
    console.log('No reminder times found in localStorage');
    return;
  }
  
  try {
    const reminderTimes = JSON.parse(savedReminderTimes);
    
    // Get current time
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHours}:${currentMinutes}`;
    
    console.log(`Checking reminders at ${currentTimeString}`);
    console.log('Active reminders:', reminderTimes.filter(r => r.enabled).map(r => r.time));
    
    // Debug: Force a notification for testing
    const debugMode = localStorage.getItem('debugNotifications') === 'true';
    if (debugMode) {
      console.log('DEBUG MODE: Forcing a notification for testing');
      sendTestNotification();
      localStorage.setItem('debugNotifications', 'false');
      return;
    }
    
    // Check each reminder
    reminderTimes.forEach(reminder => {
      if (reminder.enabled && reminder.time === currentTimeString) {
        console.log(`Sending notification for reminder at ${reminder.time}`);
        
        // Use direct Notification API for reliability
        try {
          const notification = new Notification('LyticSpend Reminder', {
            body: 'It\'s time to record your expenses for today!',
            icon: '/logo192.png',
            badge: '/logo192.png',
            requireInteraction: true, // Keep notification visible until user interacts with it
            vibrate: [200, 100, 200] // Vibration pattern for mobile devices
          });
          
          // Handle notification click
          notification.onclick = function() {
            window.focus();
            notification.close();
          };
          
          console.log('Notification sent successfully');
        } catch (notifError) {
          console.error('Error sending notification directly:', notifError);
          
          // Fallback to sendNotification function
          sendNotification('LyticSpend Reminder', {
            body: 'It\'s time to record your expenses for today!'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Function to send a test notification
export const sendTestNotification = async () => {
  if (!checkNotificationSupport()) {
    console.error('Notifications not supported');
    return { success: false, error: 'Notifications not supported' };
  }
  
  if (Notification.permission !== 'granted') {
    console.error('Notification permission not granted');
    return { success: false, error: 'Notification permission not granted' };
  }
  
  try {
    // Try to use the service worker first (preferred method)
    if (isServiceWorkerSupported() && navigator.serviceWorker.controller) {
      console.log('Sending test notification via Service Worker');
      
      // Create a message channel for two-way communication
      const messageChannel = new MessageChannel();
      
      // Set up a promise to wait for the response
      const responsePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Service worker notification request timed out'));
        }, 3000);
        
        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeoutId);
          if (event.data && event.data.type === 'TEST_NOTIFICATION_RESPONSE') {
            console.log('Service worker confirmed notification sent');
            resolve({ success: true, fromServiceWorker: true });
          } else {
            reject(new Error('Invalid response from service worker'));
          }
        };
      });
      
      // Send the message to the service worker
      navigator.serviceWorker.controller.postMessage({
        type: 'SEND_TEST_NOTIFICATION'
      }, [messageChannel.port2]);
      
      try {
        const result = await responsePromise;
        return result;
      } catch (swError) {
        console.warn('Service worker notification failed, falling back to direct notification:', swError);
        // Fall through to direct notification as fallback
      }
    }
    
    // Fallback to direct notification if service worker is not available or failed
    console.log('Sending test notification directly (fallback)');
    const now = new Date();
    
    try {
      // Check if this is Chrome
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      
      if (isChrome) {
        console.log('Chrome detected, using Chrome-specific notification approach');
        
        // For Chrome, we'll show an alert first to inform the user
        alert('Chrome notification test: After clicking OK, please minimize the browser window to see the notification.');
        
        // Then create the notification with Chrome-friendly options
        const notification = new Notification('LyticSpend Test', {
          body: `This is a test notification sent at ${now.toLocaleTimeString()}`,
          icon: 'logo192.png', // Simple path for Chrome
          tag: 'direct-notification-' + Date.now(), // Unique tag
          requireInteraction: true
        });
        
        // Handle notification click
        notification.onclick = function() {
          console.log('Chrome notification clicked');
          window.focus();
          notification.close();
        };
        
        console.log('Test notification sent successfully via Chrome-specific approach');
        return { success: true, fromServiceWorker: false, browser: 'chrome' };
      } else {
        // For other browsers, use the standard approach
        const notification = new Notification('LyticSpend Test', {
          body: `This is a test notification sent at ${now.toLocaleTimeString()}`,
          icon: './logo192.png',
          badge: './logo192.png',
          tag: 'direct-notification-' + Date.now(),
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });
        
        // Handle notification click
        notification.onclick = function() {
          console.log('Direct notification clicked');
          window.focus();
          notification.close();
        };
        
        console.log('Test notification sent successfully via direct API');
        return { success: true, fromServiceWorker: false };
      }
    } catch (directError) {
      console.error('Error sending direct notification:', directError);
      
      // Last resort - try to show an alert
      alert('Notification Test: This would normally be a system notification');
      return { success: true, fromServiceWorker: false, wasAlert: true };
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return { success: false, error: error.toString() };
  }
};

// Test communication with Service Worker
export const testServiceWorkerCommunication = async () => {
  if (!isServiceWorkerSupported()) {
    return { success: false, error: 'Service Worker not supported' };
  }
  
  try {
    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.active) {
      console.error('Service Worker not ready or active');
      return { success: false, error: 'Service Worker not active' };
    }
    
    console.log('Testing communication with Service Worker...', registration);
    
    return new Promise((resolve, reject) => {
      // Set a timeout to ensure we don't wait forever
      const timeoutId = setTimeout(() => {
        reject({ success: false, error: 'Service Worker communication timed out' });
      }, 5000);
      
      const messageChannel = new MessageChannel();
      
      // Set up response handler
      messageChannel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        console.log('Received response from Service Worker:', event.data);
        if (event.data && event.data.type === 'TEST_COMMUNICATION_RESPONSE') {
          resolve({ success: true, timestamp: event.data.timestamp });
        } else {
          resolve({ 
            success: false, 
            error: 'Invalid response from Service Worker' 
          });
        }
      };
      
      // Send test message
      console.log('Sending test message to Service Worker');
      registration.active.postMessage({
        type: 'TEST_COMMUNICATION'
      }, [messageChannel.port2]);
      
      // Set timeout in case we don't get a response
      setTimeout(() => {
        console.error('Service Worker did not respond in time');
        resolve({ 
          success: false, 
          error: 'Service Worker did not respond in time' 
        });
      }, 3000);
    });
  } catch (error) {
    console.error('Error testing Service Worker communication:', error);
    return { success: false, error: error.message };
  }
};

// Function to run a comprehensive notification system test
export const runNotificationSystemTest = async () => {
  console.log('🔍 Starting notification system test...');
  const results = {
    browserSupport: false,
    permission: 'unknown',
    serviceWorkerSupport: false,
    serviceWorkerRegistered: false,
    serviceWorkerActive: false,
    directNotification: false,
    serviceWorkerCommunication: false,
    reminderSettings: null,
    errors: []
  };
  
  // Step 1: Check browser support
  try {
    results.browserSupport = checkNotificationSupport();
    console.log(`✓ Browser notification support: ${results.browserSupport}`);
    
    if (!results.browserSupport) {
      results.errors.push('Browser does not support notifications');
      return results;
    }
  } catch (error) {
    results.errors.push(`Error checking browser support: ${error.toString()}`);
    return results;
  }
  
  // Step 2: Check permission
  try {
    results.permission = Notification.permission;
    console.log(`✓ Notification permission status: ${results.permission}`);
    
    if (results.permission !== 'granted') {
      results.errors.push('Notification permission not granted');
    }
  } catch (error) {
    results.errors.push(`Error checking permission: ${error.toString()}`);
  }
  
  // Step 3: Check Service Worker support
  try {
    results.serviceWorkerSupport = isServiceWorkerSupported();
    console.log(`✓ Service Worker support: ${results.serviceWorkerSupport}`);
    
    if (!results.serviceWorkerSupport) {
      results.errors.push('Service Worker not supported');
    }
  } catch (error) {
    results.errors.push(`Error checking Service Worker support: ${error.toString()}`);
  }
  
  // Step 4: Check if Service Worker is registered
  if (results.serviceWorkerSupport) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      results.serviceWorkerRegistered = !!registration;
      console.log(`✓ Service Worker registered: ${results.serviceWorkerRegistered}`);
      
      if (results.serviceWorkerRegistered) {
        results.serviceWorkerActive = !!registration.active;
        console.log(`✓ Service Worker active: ${results.serviceWorkerActive}`);
      } else {
        results.errors.push('Service Worker not registered');
      }
    } catch (error) {
      results.errors.push(`Error checking Service Worker registration: ${error.toString()}`);
    }
  }
  
  // Step 5: Check reminder settings
  try {
    const savedReminderTimes = localStorage.getItem('reminderTimes');
    if (savedReminderTimes) {
      const reminderTimes = JSON.parse(savedReminderTimes);
      results.reminderSettings = {
        count: reminderTimes.length,
        enabled: reminderTimes.filter(r => r.enabled).length,
        times: reminderTimes.filter(r => r.enabled).map(r => r.time)
      };
      console.log(`✓ Reminder settings: ${JSON.stringify(results.reminderSettings)}`);
      
      if (results.reminderSettings.enabled === 0) {
        results.errors.push('No reminders are enabled');
      }
    } else {
      results.errors.push('No reminder times found in localStorage');
    }
  } catch (error) {
    results.errors.push(`Error checking reminder settings: ${error.toString()}`);
  }
  
  // Step 6: Test direct notification
  if (results.browserSupport && results.permission === 'granted') {
    try {
      const testResult = sendTestNotification();
      results.directNotification = testResult.success;
      console.log(`✓ Direct notification test: ${results.directNotification}`);
      
      if (!results.directNotification) {
        results.errors.push(`Failed to send direct notification: ${testResult.error}`);
      }
    } catch (error) {
      results.errors.push(`Error testing direct notification: ${error.toString()}`);
    }
  }
  
  // Step 7: Test Service Worker communication
  if (results.serviceWorkerRegistered && results.serviceWorkerActive) {
    try {
      const testResult = await testServiceWorkerCommunication();
      results.serviceWorkerCommunication = testResult.success;
      console.log(`✓ Service Worker communication test: ${results.serviceWorkerCommunication}`);
      
      if (!results.serviceWorkerCommunication) {
        results.errors.push(`Failed to test Service Worker communication: ${testResult.error}`);
      }
    } catch (error) {
      results.errors.push(`Error testing Service Worker communication: ${error.toString()}`);
    }
  }
  
  console.log('🏁 Notification system test completed');
  console.log('Results:', results);
  
  return results;
};

// Variable to store the interval ID
let reminderIntervalId = null;

// Initialize notification service
export const initNotificationService = () => {
  // Check if notifications are enabled in localStorage
  const notificationsEnabled = localStorage.getItem('notifications') === 'true';
  
  if (notificationsEnabled) {
    startReminderScheduler();
    updateServiceWorkerReminders();
  }
  
  // Add listener for messages from service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Received message from service worker:', event.data);
      
      if (event.data && event.data.type === 'NOTIFICATION_FALLBACK') {
        // Show an alert as a fallback for notifications
        alert(event.data.message || 'Notification test: This would normally be a system notification');
      } else if (event.data && event.data.type === 'NOTIFICATION_BACKUP') {
        // Show a more subtle message in the console
        console.log('Notification backup message:', event.data.message);
      }
    });
  }
};

// Start the reminder scheduler
export const startReminderScheduler = async () => {
  // First check if notifications are enabled
  const notificationsEnabled = localStorage.getItem('notifications') === 'true';
  if (!notificationsEnabled) {
    console.log('Notifications are disabled, not starting scheduler');
    return;
  }
  
  // Check if notification permission is granted
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    console.log('Notification permission not granted, not starting scheduler');
    return;
  }
  
  console.log('Starting reminder scheduler');
  
  // Always set up the interval-based scheduler as a reliable fallback
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
  }
  
  // Check for reminders every minute
  reminderIntervalId = setInterval(() => {
    checkAndSendReminders();
  }, 60000); // 60000 ms = 1 minute
  
  // Also check immediately
  checkAndSendReminders();
  
  // Try to use Service Worker for notifications if supported (in addition to interval)
  if (isServiceWorkerSupported()) {
    try {
      // Register Service Worker and update reminders
      await registerServiceWorker();
      await updateServiceWorkerReminders();
      console.log('Using Service Worker for notifications (as additional backup)');
    } catch (error) {
      console.error('Error setting up Service Worker, but interval is still active:', error);
    }
  }
};

export const stopReminderScheduler = () => {
  console.log('Stopping reminder scheduler');
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
  
  // If using Service Worker, we don't need to do anything
  // The Service Worker will continue running in the background
};
