'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyList from '@/components/properties/PropertyList';
import { supabase } from '@/lib/supabase/client';
import { useFilter } from '@/components/FilterProvider';

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  is_for_rent: boolean;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  created_at: string;
  property_images: { image_url: string; is_primary: boolean }[];
  contact_phone: string | null;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [initialLikes, setInitialLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { filters } = useFilter();

  useEffect(() => {
    async function fetchInitialData() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUserId(session?.user.id || null);

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, property_images(image_url, is_primary)')
        .order('created_at', { ascending: false });
      if (propertiesError) console.error('Error fetching properties:', propertiesError);
      else setProperties(propertiesData || []);

      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('property_id, user_id');
      if (likesError) console.error('Error fetching likes:', likesError);
      else {
        const likesCount = (likesData || []).reduce((acc, like) => {
          acc[like.property_id] = (acc[like.property_id] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        setInitialLikes(likesCount);

        if (session?.user.id) {
          const userLikes = (likesData || []).reduce((acc, like) => {
            if (like.user_id === session.user.id) acc[like.property_id] = true;
            return acc;
          }, {} as { [key: string]: boolean });
          setUserLiked(userLikes);
        }
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchFilteredProperties() {
      let query = supabase
        .from('properties')
        .select('*, property_images(image_url, is_primary)')
        .order('created_at', { ascending: false });

      if (filters.location) query = query.eq('location', filters.location); // Exact match for state
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
      if (filters.bedrooms) query = query.eq('bedrooms', parseInt(filters.bedrooms));
      if (filters.bathrooms) query = query.eq('bathrooms', parseInt(filters.bathrooms));
      if (filters.isForRent) query = query.eq('is_for_rent', filters.isForRent === 'true');
      if (filters.minSquareFeet) query = query.gte('square_feet', parseFloat(filters.minSquareFeet));
      if (filters.maxSquareFeet) query = query.lte('square_feet', parseFloat(filters.maxSquareFeet));
      if (filters.datePosted) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.datePosted));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) console.error('Error fetching filtered properties:', error);
      else setProperties(data || []);
    }
    fetchFilteredProperties();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Properties</h2>
          <span className="text-gray-600 dark:text-gray-400">Showing {properties.length} properties</span>
        </div>
        <PropertyList
          properties={properties}
          initialLikes={initialLikes}
          userLiked={userLiked}
        />
      </section>
    </div>
  );
}