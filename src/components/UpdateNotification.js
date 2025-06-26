import React, { useState, useEffect } from 'react';

const UpdateNotification = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Listen for service worker update messages
    const handleServiceWorkerUpdate = (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setShowUpdateNotification(true);
      }
    };

    // Add event listener for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerUpdate);

    return () => {
      // Clean up event listener
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerUpdate);
    };
  }, []);

  const handleUpdate = () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-notification-content">
        <div className="update-notification-header">
          <img src={process.env.PUBLIC_URL + '/app_logo.svg'} alt="LyticSpend Logo" className="update-notification-logo" />
          <h3>Update Available</h3>
          <button className="update-notification-close" onClick={handleDismiss}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p>A new version of LyticSpend is available. Update now for the latest features and improvements.</p>
        <div className="update-notification-actions">
          <button className="update-notification-button" onClick={handleUpdate}>
            Update Now
          </button>
          <button className="update-notification-later" onClick={handleDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
