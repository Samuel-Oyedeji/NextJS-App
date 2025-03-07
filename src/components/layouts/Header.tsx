'use client';

import { useTheme } from '@/lib/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Property Listings</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      >
        {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
      </button>
    </header>
  );
}