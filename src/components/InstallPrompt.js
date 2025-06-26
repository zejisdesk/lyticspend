import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the user has already permanently dismissed or installed the app
    const hasPromptBeenShown = localStorage.getItem('installPromptShown');
    
    if (hasPromptBeenShown === 'true') {
      // Don't show the prompt again if permanently dismissed
      return;
    }
    
    // Check if the user selected "Remind me later"
    const dismissedAt = localStorage.getItem('installPromptDismissedAt');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const currentTime = Date.now();
      const hoursSinceDismissed = (currentTime - dismissedTime) / (1000 * 60 * 60);
      
      // If it's been less than 24 hours since the user dismissed the prompt, don't show it
      if (hoursSinceDismissed < 24) {
        return;
      }
      // Otherwise, clear the dismissal timestamp and show the prompt again
      localStorage.removeItem('installPromptDismissedAt');
    }

    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    // Check if it's a mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    // Function to handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      // Show our custom install prompt
      setInstallable(true);
      setShowPrompt(true);
    };

    // Listen for the beforeinstallprompt event (won't fire on iOS)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show the prompt after a delay, but only on mobile devices
    const timer = setTimeout(() => {
      // Only show on mobile devices and if it hasn't been permanently dismissed
      if (isMobileDevice) {
        // For iOS or when the beforeinstallprompt event hasn't fired yet
        if (!installable || isIOSDevice) {
          setShowPrompt(true);
        }
      }
    }, 5000); // 5 second delay to give users time to interact with the app first

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installable]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the browser install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Clear the saved prompt
      setDeferredPrompt(null);
      
      // Mark as shown regardless of outcome
      localStorage.setItem('installPromptShown', 'true');
      setShowPrompt(false);
    } else {
      // For iOS or when the beforeinstallprompt event isn't available
      setShowPrompt(false);
      localStorage.setItem('installPromptShown', 'true');
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptShown', 'true');
  };
  
  // Function to handle "Remind me later" option
  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set installPromptShown to true, so it can show again later
    // Instead, set a timestamp for when it was dismissed
    localStorage.setItem('installPromptDismissedAt', Date.now());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-header">
          <img 
            src={`${process.env.PUBLIC_URL}/logo192.png`} 
            alt="LyticSpend Logo" 
            className="install-prompt-logo" 
          />
          <h3>Add to Home Screen</h3>
          <button className="install-prompt-close" onClick={handleClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {isIOS ? (
          <>
            <p className="install-prompt-description">
              Install LyticSpend on your iPhone for the best experience:
            </p>
            <ol className="ios-instructions">
              <li>
                <i className="fas fa-share-square ios-instruction-icon"></i>
                Tap the <strong>Share</strong> icon in Safari
              </li>
              <li>
                <i className="fas fa-plus-square ios-instruction-icon"></i>
                Select <strong>Add to Home Screen</strong>
              </li>
              <li>
                <i className="fas fa-check-circle ios-instruction-icon"></i>
                Tap <strong>Add</strong> in the top right
              </li>
            </ol>
            <div className="install-prompt-actions">
              <button className="install-prompt-got-it" onClick={handleClose}>
                Got it
              </button>
              <button className="install-prompt-later" onClick={handleRemindLater}>
                Remind me later
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="install-prompt-description">
              Install LyticSpend on your device to:
            </p>
            <ul className="install-benefits">
              <li><i className="fas fa-check"></i> Track expenses offline</li>
              <li><i className="fas fa-check"></i> Access quickly from home screen</li>
              <li><i className="fas fa-check"></i> Get a full-screen experience</li>
            </ul>
            <div className="install-prompt-actions">
              <button className="install-prompt-button" onClick={handleInstallClick}>
                <i className="fas fa-download"></i> Install App
              </button>
              <button className="install-prompt-later" onClick={handleRemindLater}>
                Remind me later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
