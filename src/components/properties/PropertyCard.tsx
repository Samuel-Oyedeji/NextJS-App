// src/components/properties/PropertyCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { Property } from '@/types';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
  currentUserId?: string | null;
}

export default function PropertyCard({ property, currentUserId }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(property.is_liked || false);
  const [likesCount, setLikesCount] = useState(property.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price || 0);

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Please log in to like properties');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: currentUserId, property_id: property.id });
          
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Add like
        await supabase
          .from('likes')
          .insert({ user_id: currentUserId, property_id: property.id });
          
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share property');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Property Image */}
      <div className="relative h-52 w-full">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        // src/components/properties/PropertyCard.tsx (continued)
        <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-bold shadow">
          {property.is_for_rent ? `${formattedPrice}/yr` : formattedPrice}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="text-white font-semibold">{property.title}</div>
          <div className="text-white text-sm">{property.location}</div>
        </div>
      </div>
      
      {/* Property Info */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex-1">
            <div className="flex space-x-4 text-sm text-gray-600">
              {property.bedrooms && (
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
              )}
              {property.bathrooms && (
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
              )}
              {property.square_feet && (
                <span>{property.square_feet} sq ft</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {property.is_for_rent ? 'For Rent' : 'For Sale'}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{property.description}</p>
        
        {/* Posted by */}
        <div className="flex items-center mb-3">
          <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 mr-2">
            {property.user?.profile_picture ? (
              <Image
                src={property.user.profile_picture}
                alt={property.user.full_name || ''}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-xs">
                {property.user?.full_name?.[0] || 'U'}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-600">
            Posted by{' '}
            <Link href={`/profile/${property.user_id}`} className="text-blue-600 hover:underline">
              {property.user?.full_name || 'Anonymous'}
            </Link>
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between border-t pt-3">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center text-sm ${isLiked ? 'text-pink-500' : 'text-gray-500'} hover:text-pink-500`}
          >
            <FiHeart className={`mr-1 ${isLiked ? 'fill-pink-500' : ''}`} />
            <span>{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-sm text-gray-500 hover:text-blue-500"
          >
            <FiMessageSquare className="mr-1" />
            <span>{property.comments_count || 0}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center text-sm text-gray-500 hover:text-green-500"
          >
            <FiShare2 className="mr-1" />
            <span>Share</span>
          </button>
        </div>
      </div>
      
      {/* Comments Section (expandable) */}
      {showComments && (
        <div className="px-4 pb-4 border-t">
          <PropertyComments propertyId={property.id} currentUserId={currentUserId} />
        </div>
      )}
    </motion.div>
  );
}

// This is a forward reference that will be implemented later
import PropertyComments from './PropertyComments';