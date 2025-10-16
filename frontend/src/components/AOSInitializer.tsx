'use client';

import { useEffect } from 'react';

export default function AOSInitializer() {
  useEffect(() => {
    // Only initialize AOS on client side
    if (typeof window === 'undefined') return;

    // Check if AOS is already initialized
    if (window.AOS) {
      window.AOS.refresh();
      return;
    }

    // Dynamically import AOS with error handling
    import('aos')
      .then((AOS) => {
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100,
          disable: false,
        });
      })
      .catch((error) => {
        console.warn('AOS library failed to load:', error);
        // Create a mock AOS object to prevent errors
        window.AOS = {
          init: () => {},
          refresh: () => {},
          refreshHard: () => {},
          destroy: () => {},
        };
      });

    // Cleanup function
    return () => {
      if (window.AOS && window.AOS.destroy) {
        window.AOS.destroy();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    AOS?: {
      init: (options?: any) => void;
      refresh: () => void;
      refreshHard: () => void;
      destroy: () => void;
    };
  }
}
