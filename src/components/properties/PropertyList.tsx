// src/components/properties/PropertyList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/types';
import PropertyCard from './PropertyCard';
import { supabase } from '@/lib/supabase/client';

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        setCurrentUserId(userId);
        
        // Fetch properties with user info, images, like and comment counts
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            user:users(*),
            images:property_images(*),
            likes_count:likes(count),
            comments_count:comments(count),
            is_liked:likes!inner(user_id)
          `)
          .eq(userId ? 'likes.user_id' : 'id', userId || 'id')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Format data to match our Property type
        const formattedData = data.map((property: any) => ({
          ...property,
          likes_count: property.likes_count[0]?.count || 0,
          comments_count: property.comments_count[0]?.count || 0,
          is_liked: property.is_liked.length > 0
        }));
        
        setProperties(formattedData);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700">No properties found</h3>
        <p className="text-gray-500 mt-2">Be the first to post a property!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {properties.map(property => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          currentUserId={currentUserId} 
        />
      ))}
    </motion.div>
  );
}