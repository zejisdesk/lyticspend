import React, { useState } from 'react';

const TestModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    console.log('Opening test modal');
    setIsOpen(true);
  };

  const closeModal = () => {
    console.log('Closing test modal');
    setIsOpen(false);
  };

  return (
    <div>
      <button 
        onClick={openModal}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0D6EFD',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '20px'
        }}
      >
        Open Test Modal
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              width: '80%',
              maxWidth: '500px'
            }}
          >
            <h2>Test Modal</h2>
            <p>This is a test modal to verify that modal functionality works.</p>
            <button 
              onClick={closeModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#DC3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestModal;
