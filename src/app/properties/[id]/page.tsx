'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaExpand, FaPhone } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { supabase } from '@/lib/supabase/client';

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
  contact_phone: string | null;
  property_images: { image_url: string; is_primary: boolean }[];
}

export default function PropertyDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise); // Unwrap the params Promise
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url, is_primary)
        `)
        .eq('id', params.id) // Now safe to use params.id
        .single();

      if (error) {
        console.error('Error fetching property:', error);
      } else {
        setProperty(data);
      }
      setLoading(false);
    }

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (!property) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Property not found</div>;
  }

  const primaryImage = property.property_images.find(img => img.is_primary)?.image_url || property.property_images[0]?.image_url;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-4"
      >
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {primaryImage && (
            <div className="md:col-span-2">
              <Image
                src={primaryImage}
                alt={property.title}
                width={800}
                height={600}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {property.property_images
              .filter(img => !img.is_primary)
              .slice(0, 4)
              .map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Image
                    src={img.image_url}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-24 md:h-32 object-cover rounded-lg shadow-sm"
                  />
                </motion.div>
              ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100"
          >
            {property.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-6"
          >
            {property.description || 'No description available.'}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                ${property.price.toLocaleString()} {property.is_for_rent ? '/mo' : ''}
              </p>
              {property.location && (
                <p className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiMapPin className="mr-2" /> {property.location}
                </p>
              )}
              {property.contact_phone && (
                <p className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                  <FaPhone className="mr-2" /> {property.contact_phone}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex space-x-6"
            >
              {property.bedrooms && (
                <p className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaBed className="mr-2" /> {property.bedrooms} Bed
                </p>
              )}
              {property.bathrooms && (
                <p className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaBath className="mr-2" /> {property.bathrooms} Bath
                </p>
              )}
              {property.square_feet && (
                <p className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaExpand className="mr-2" /> {property.square_feet} sqft
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}