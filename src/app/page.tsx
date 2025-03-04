// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import PropertyList from '@/components/properties/PropertyList';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 mb-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-3">Find Your Dream Property</h1>
        <p className="text-blue-100 mb-6 max-w-2xl">
          Connect with others, discover properties, and share your real estate journey on the social platform built for property enthusiasts.
        </p>
        {!isLoggedIn && (
          <div className="flex space-x-4">
            <Link 
              href="/signup" 
              className="bg-white text-blue-700 px-5 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Join Now
            </Link>
            <Link 
              href="/login" 
              className="border border-white text-white px-5 py-2 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
        {isLoggedIn && (
          <Link 
            href="/create-post" 
            className="bg-white text-blue-700 px-5 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Post a Property
          </Link>
        )}
      </div>
      
      {/* Property Feed */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Properties</h2>
        </div>
        <PropertyList />
      </div>
    </div>
  );
}