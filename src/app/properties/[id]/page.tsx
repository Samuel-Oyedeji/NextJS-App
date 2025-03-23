'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaExpand, FaPhone, FaHeart, FaShare } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { fetchSupabase } from '@/lib/supabase/fetch';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const CommentsSection = dynamic(() => import('@/components/CommentsSection'), {
  ssr: false,
  loading: () => <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>,
});

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

interface Comment {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  created_at: string;
  users: { username: string };
}

export default function PropertyDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const [property, setProperty] = useState<Property | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserId(session?.user.id || null);

        const [
          propertyData,
          commentsData,
          { count: likeCount },
        ] = await Promise.all([
          fetchSupabase<Property>(
            'properties',
            qb => qb.select('*, property_images (image_url, is_primary)').eq('id', params.id).single(),
            { revalidate: 3600 }
          ),
          fetchSupabase<Comment[]>(
            'comments',
            qb => qb.select('*, users (username)').eq('property_id', params.id).order('created_at', { ascending: true }),
            { revalidate: 300 }
          ),
          supabase.from('likes').select('*', { count: 'exact', head: true }).eq('property_id', params.id),
        ]);

        setProperty(propertyData);
        setComments(commentsData || []);
        setLikes(likeCount || 0);

        if (session?.user.id) {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('property_id', params.id)
            .eq('user_id', session.user.id)
            .single();
          setIsLiked(!!userLike);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load property data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleLike = async () => {
    if (!userId) {
      toast.error('Please log in to like this post');
      return;
    }
    try {
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().match({ user_id: userId, property_id: params.id });
        if (error) throw error;
        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: userId, property_id: params.id });
        if (error) throw error;
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/properties/${params.id}`;
    if (navigator.share) {
      navigator.share({ title: property?.title || 'Property', url }).catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (!property) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Property not found</div>;
  }

  const primaryImage = property.property_images.find(img => img.is_primary)?.image_url || property.property_images[0]?.image_url;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {primaryImage && (
              <div className="md:col-span-2">
                <Image
                  src={primaryImage}
                  alt={property.title}
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPJ7lNiQAAAABJRU5ErkJggg==" // Low-quality placeholder
                  priority // Load primary image eagerly
                />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {property.property_images.filter(img => !img.is_primary).slice(0, 4).map((img, index) => (
                <div key={index} className="card">
                  <Image
                    src={img.image_url}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={200}
                    height={150}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full h-24 md:h-32 object-cover rounded-lg shadow-sm"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPJ7lNiQAAAABJRU5ErkJggg=="
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{property.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{property.description || 'No description available.'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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
              </div>
              <div className="flex space-x-6">
                {property.bedrooms && <p className="flex items-center text-gray-500 dark:text-gray-400"><FaBed className="mr-2" /> {property.bedrooms} Bed</p>}
                {property.bathrooms && <p className="flex items-center text-gray-500 dark:text-gray-400"><FaBath className="mr-2" /> {property.bathrooms} Bath</p>}
                {property.square_feet && <p className="flex items-center text-gray-500 dark:text-gray-400"><FaExpand className="mr-2" /> {property.square_feet} sqft</p>}
              </div>
            </div>
            <div className="flex items-center space-x-6 mt-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FaHeart className={isLiked ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span>{likes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FaShare />
                <span>Share</span>
              </button>
            </div>
          </div>

          <CommentsSection propertyId={params.id} initialComments={comments} userId={userId} />
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}