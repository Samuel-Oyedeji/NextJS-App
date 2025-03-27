// src/components/layouts/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiPlus, FiBell, FiMessageSquare, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { FaHome } from 'react-icons/fa';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/lib/ThemeContext';
import { User } from '@/types';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/common/SearchBar';
import { useFilter } from '@/components/FilterProvider';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { setFilters } = useFilter();

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (error) throw error;
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) getUser();
      else if (event === 'SIGNED_OUT') setUser(null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFilterChange = (filters: any) => {
    setFilters(filters);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
                RealSocial
              </span>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <SearchBar onFilterChange={handleFilterChange} />
          </div>
          <nav className="hidden md:flex items-center space-x-4"> {/* Removed ml-4 */}
            <Link href="/" className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <FiHome className="mr-1" />
              <span>Home</span>
            </Link>
            {user && (
              <Link href="/create-post" className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiPlus className="mr-1" />
                <span>Post Property</span>
              </Link>
            )}
            <button
              onClick={() => {
                console.log('Theme toggle button clicked');
                toggleTheme();
              }}
              className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="mr-1" /> : <FiSun className="mr-1" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </nav>
          <div className="flex items-center space-x-2">
            {!loading && !user ? (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                    {user?.profile_picture ? (
                      <Image
                        src={user.profile_picture}
                        alt={user.full_name || 'User'}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500 dark:bg-blue-600 text-white">
                        {user?.full_name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10"
                    >
                      <Link
                        href={`/profile/${user?.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <FiUser className="mr-2" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <Link
                        href={`/profile/${user?.id}/my-posts`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <FaHome className="mr-2" />
                          <span>My Posts</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2" />
                          <span>Log Out</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}