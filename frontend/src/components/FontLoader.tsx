'use client';

import { useEffect } from 'react';

export default function FontLoader() {
  useEffect(() => {
    // Ensure font is loaded and applied
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.style.fontFamily = "'Vazirmatn', 'Tahoma', 'Arial', sans-serif";
      });
    }
  }, []);

  return null;
}
