import React from 'react';
import { motion } from 'framer-motion'; // Specific import
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
  contact_phone: string | null;
  user_id: string;
}

interface RecentPostsSectionProps {
  posts: Property[];
}

const RecentPost = React.memo(
  ({ post }: { post: Property }) => {
    const primaryImage = post.property_images.find(img => img.is_primary)?.image_url || post.property_images[0]?.image_url;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md hover-scale"
      >
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={post.title}
            width={100}
            height={75}
            sizes="25vw"
            className="object-cover rounded-md"
          />
        )}
        <div className="flex-1">
          <p className="text-gray-800 dark:text-gray-100 font-medium">{post.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ${post.price.toLocaleString()} {post.is_for_rent ? '/mo' : ''} •{' '}
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }
);

export default function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map(post => <RecentPost key={post.id} post={post} />)
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No recent posts yet.</p>
      )}
    </div>
  );
}