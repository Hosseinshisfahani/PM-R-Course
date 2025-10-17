'use client';

import React, { useState, useEffect } from 'react';

export interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  show, 
  message, 
  type, 
  onClose, 
  duration = 5000 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !visible) return null;

  const getToastClass = () => {
    const baseClass = 'toast align-items-center text-white border-0';
    switch (type) {
      case 'success':
        return `${baseClass} bg-success`;
      case 'error':
        return `${baseClass} bg-danger`;
      case 'warning':
        return `${baseClass} bg-warning`;
      case 'info':
        return `${baseClass} bg-info`;
      default:
        return `${baseClass} bg-primary`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  };

  return (
    <div 
      className={`toast-container position-fixed top-0 end-0 p-3 ${visible ? 'show' : ''}`}
      style={{ zIndex: 9999 }}
    >
      <div className={getToastClass()} role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center">
            <i className={`${getIcon()} me-2`}></i>
            <span>{message}</span>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white me-2 m-auto" 
            aria-label="Close"
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
          ></button>
        </div>
      </div>
    </div>
  );
};

// Hook for easy toast usage
export const useToast = () => {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
};

export default Toast;
