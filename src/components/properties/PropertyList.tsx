'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
}

interface PropertyListProps {
  properties: Property[];
}

export default function PropertyList({ properties }: PropertyListProps) {
  if (!properties || properties.length === 0) {
    return <div className="text-center py-4 text-gray-600 dark:text-gray-400">No properties available.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {properties.map((property, index) => {
        const primaryImage = property.property_images.find(img => img.is_primary)?.image_url;
        return (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
          >
            {primaryImage && (
              <Image
                src={primaryImage}
                alt={property.title}
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{property.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 truncate">{property.description || 'No description available'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                ${property.price.toLocaleString()} {property.is_for_rent ? '/mo' : ''}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{property.location || 'Location not specified'}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}