'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { createAdminTheme } from '@/theme/adminTheme';

interface AdminThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

// Create RTL cache
const cache = createCache({
  key: 'css',
  prepend: true,
});

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('admin-theme-mode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('admin-theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createAdminTheme(mode);

  const value = {
    mode,
    toggleMode,
  };

  return (
    <AdminThemeContext.Provider value={value}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </AdminThemeContext.Provider>
  );
};

export default AdminThemeProvider;
