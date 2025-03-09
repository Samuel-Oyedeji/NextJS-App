'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

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
          <Link href={`/properties/${property.id}`} key={property.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }} // Enhanced hover
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden cursor-pointer"
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
                {property.contact_phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contact: {property.contact_phone}</p>
                )}
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}