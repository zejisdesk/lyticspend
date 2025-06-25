import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if the user has already dismissed or installed the app
    const hasPromptBeenShown = localStorage.getItem('installPromptShown');
    
    if (hasPromptBeenShown === 'true') {
      // Don't show the prompt again if already shown
      return;
    }

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

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Always show the prompt after a short delay in development/testing
    // In production, this would only show on mobile devices
    const timer = setTimeout(() => {
      // For testing purposes, always show the prompt if it hasn't been shown before
      // In production, you might want to check isMobileDevice() as well
      if (!installable && !hasPromptBeenShown) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installable]);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

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

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-header">
          <img src={process.env.PUBLIC_URL + '/app_logo.svg'} alt="LyticSpend Logo" className="install-prompt-logo" />
          <h3>Add LyticSpend to Home Screen</h3>
          <button className="install-prompt-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p>Track your expenses offline and access LyticSpend quickly from your home screen.</p>
        <div className="install-prompt-actions">
          <button className="install-prompt-button" onClick={handleInstallClick}>
            Add to Home Screen
          </button>
          <button className="install-prompt-later" onClick={handleClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
