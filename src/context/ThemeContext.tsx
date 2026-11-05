import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent<any> | MouseEvent) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('splitsmart-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('splitsmart-theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = (event?: React.MouseEvent<any> | MouseEvent) => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      let x = window.innerWidth / 2;
      let y = 0;

      if (event && 'clientX' in event && typeof event.clientX === 'number' && event.clientX > 0) {
        x = event.clientX;
        y = event.clientY;
      } else {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && typeof activeEl.getBoundingClientRect === 'function') {
          const rect = activeEl.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      try {
        const transition = (document as any).startViewTransition(() => {
          setThemeState(nextTheme);
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 500,
              easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }).catch(() => {
          setThemeState(nextTheme);
        });
      } catch {
        setThemeState(nextTheme);
      }
    } else {
      const root = document.documentElement;
      root.classList.add('theme-transitioning');
      setThemeState(nextTheme);
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 450);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
