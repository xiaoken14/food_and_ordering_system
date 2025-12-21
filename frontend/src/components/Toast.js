import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showParty, setShowParty] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      if (message.includes('🎉')) {
        setShowParty(true);
      }
    }, duration - 500);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose, message]);

  const handleClose = () => {
    setIsExiting(true);
    if (message.includes('🎉')) {
      setShowParty(true);
    }
    setTimeout(onClose, 500);
  };

  return (
    <>
      <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
        <div className="toast-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ'}
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={handleClose}>×</button>
      </div>
      {showParty && (
        <div className="party-pop">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti" style={{
              '--angle': `${Math.random() * 360}deg`,
              '--distance': `${100 + Math.random() * 100}px`,
              '--delay': `${Math.random() * 0.2}s`,
              '--color': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
            }}></div>
          ))}
        </div>
      )}
    </>
  );
};

export default Toast;
