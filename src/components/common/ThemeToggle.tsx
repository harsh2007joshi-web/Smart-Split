import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showText = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const tooltipText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <div className="relative group inline-flex items-center">
      <motion.button
        type="button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleTheme(e)}
        aria-label={tooltipText}
        title={tooltipText}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`relative p-2.5 rounded-xl border transition-colors duration-300 flex items-center justify-center overflow-hidden shadow-sm ${
          isDark
            ? 'bg-[#101010] border-[#303030] text-[#2589FF] hover:border-[#404040] hover:bg-[#151515]'
            : 'bg-white border-[#D8E9FA] text-[#1685F8] hover:border-[#BFE9FF] hover:bg-[#F1F9FF]'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#2589FF]" />
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#1685F8]" />
            </motion.div>
          )}
        </AnimatePresence>

        {showText && (
          <span className="ml-2 text-xs font-semibold">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </motion.button>

      <div
        role="tooltip"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 px-2 py-1 text-[10px] font-medium tracking-wide whitespace-nowrap rounded-md shadow-md bg-[#101010] text-[#F5F5F5] border border-[#303030] dark:bg-[#181818] dark:text-[#F5F5F5] dark:border-[#404040]"
      >
        {tooltipText}
      </div>
    </div>
  );
};
