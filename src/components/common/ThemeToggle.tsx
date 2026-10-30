import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showText = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const tooltipText = isDark ? 'Light Mode' : 'Dark Mode';

  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tooltipText}
        title={tooltipText}
        className={`relative p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center ${
          isDark
            ? 'bg-[#101010] border-[#303030] text-[#A1A1AA] hover:text-[#F5F5F5] hover:border-[#404040] hover:bg-[#151515]'
            : 'bg-white border-[#D8E9FA] text-[#64748B] hover:text-[#1685F8] hover:border-[#BFE9FF] hover:bg-[#F1F9FF]'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:rotate-45 text-[#2589FF]" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:-rotate-12 text-[#1685F8]" />
        )}
        {showText && (
          <span className="ml-2 text-xs font-semibold">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </button>

      {/* Subtle floating tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 px-2 py-1 text-[10px] font-medium tracking-wide whitespace-nowrap rounded-md shadow-md bg-[#101010] text-[#F5F5F5] border border-[#303030] dark:bg-[#181818] dark:text-[#F5F5F5] dark:border-[#404040]"
      >
        {tooltipText}
      </div>
    </div>
  );
};
