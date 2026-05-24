import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('crm_theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('crm_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('crm_theme', 'light');
    }
  }, [dark]);

  const toggleTheme = () => setDark((p) => !p);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};