import React from 'react';
import Link from 'next/link';
import PropertyList from '@/components/properties/PropertyList';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Define Property interface for TypeScript
interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  is_for_rent: boolean;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  created_at: string;
  property_images: { image_url: string; is_primary: boolean }[];
  contact_phone: string | null;
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;
  const userId = session?.user.id;

  // Fetch properties server-side
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (image_url, is_primary)
    `)
    .order('created_at', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError);
  }

  // Fetch initial likes data
  const { data: likesData, error: likesError } = await supabase
    .from('likes')
    .select('property_id, user_id');

  if (likesError) {
    console.error('Error fetching likes:', likesError);
  }

  // Calculate initial like counts per property
  const initialLikes = (likesData || []).reduce((acc, like) => {
    acc[like.property_id] = (acc[like.property_id] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Determine which properties the current user has liked
  const userLiked = userId
    ? (likesData || []).reduce((acc, like) => {
        if (like.user_id === userId) {
          acc[like.property_id] = true;
        }
        return acc;
      }, {} as { [key: string]: boolean })
    : {};

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 mb-8 mx-4 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-3 text-center">Find Your Dream Property</h1>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-center">
          Connect with others, discover properties, and share your real estate journey on the social platform built for property enthusiasts.
        </p>
        <div className="flex justify-center space-x-4">
          {isLoggedIn ? (
            <Link
              href="/create-post"
              className="bg-white text-blue-700 px-5 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Post a Property
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* Property Feed */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Properties</h2>
        </div>
        <PropertyList
          properties={properties || []}
          initialLikes={initialLikes}
          userLiked={userLiked}
        />
      </section>
    </div>
  );
}