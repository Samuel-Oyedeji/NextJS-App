'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; // Specific imports
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FaTrash, FaHome, FaSort, FaFilter } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { debounce } from '@/lib/utils';

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

const PostCard = React.memo(
  ({ post, onDelete, isDeleting }: { post: Property; onDelete: (id: string) => void; isDeleting: boolean }) => {
    const primaryImage = post.property_images.find(img => img.is_primary)?.image_url || post.property_images[0]?.image_url;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md hover-scale"
      >
        <div className="flex items-start space-x-4">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={post.title}
              width={120}
              height={90}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover rounded-md"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{post.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{post.description || 'No description'}</p>
            <p className="text-md font-bold text-blue-600 dark:text-blue-400 mt-1">
              ${post.price.toLocaleString()} {post.is_for_rent ? '/mo' : ''}
            </p>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              {post.bedrooms && <span>{post.bedrooms} Bed</span>}
              {post.bathrooms && <span>{post.bathrooms} Bath</span>}
              {post.square_feet && <span>{post.square_feet} sqft</span>}
            </div>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(post.id)}
          className="mt-4 w-full flex items-center justify-center space-x-1"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <FaTrash />
              <span>Delete</span>
            </>
          )}
        </Button>
      </motion.div>
    );
  }
);

export default function MyPostsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const [posts, setPosts] = useState<Property[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'price_asc' | 'price_desc'>('created_at_desc');
  const [filterRent, setFilterRent] = useState<boolean | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please log in to view your posts');
          router.push('/login');
          return;
        }
        setCurrentUserId(session.user.id);

        if (session.user.id !== params.id) {
          toast.error('You can only view your own posts');
          router.push(`/profile/${session.user.id}/my-posts`);
          return;
        }

        const { data: postsData, error } = await supabase
          .from('properties')
          .select('*, property_images (image_url, is_primary)')
          .eq('user_id', params.id);

        if (error) throw error;
        setPosts(postsData || []);
        setFilteredPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const debouncedUpdatePosts = debounce((newPosts: Property[]) => {
      setPosts(newPosts);
      applyFiltersAndSort(newPosts);
    }, 300);

    const subscription = supabase
      .channel('properties_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties', filter: `user_id=eq.${params.id}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            debouncedUpdatePosts([...posts, payload.new as Property]);
          } else if (payload.eventType === 'DELETE') {
            debouncedUpdatePosts(posts.filter(post => post.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [params.id, router]);

  const applyFiltersAndSort = (postsToFilter: Property[]) => {
    let result = [...postsToFilter];
    if (filterRent !== null) result = result.filter(post => post.is_for_rent === filterRent);
    result.sort((a, b) => {
      if (sortBy === 'created_at_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'created_at_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
    setFilteredPosts(result);
  };

  useEffect(() => {
    applyFiltersAndSort(posts);
  }, [sortBy, filterRent, posts]);

  const handleDeletePost = async (postId: string) => {
    if (!currentUserId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    setDeletingId(postId);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUserId);
      if (error) throw error;
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-4"
      >
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <FaHome className="mr-2" /> My Posts
            </h1>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <FaSort className="text-gray-500 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-40 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-500 dark:text-gray-400" />
                <div className="flex space-x-2">
                  <Button onClick={() => setFilterRent(null)} variant={filterRent === null ? 'primary' : 'outline'} size="sm">All</Button>
                  <Button onClick={() => setFilterRent(true)} variant={filterRent === true ? 'primary' : 'outline'} size="sm">Rent</Button>
                  <Button onClick={() => setFilterRent(false)} variant={filterRent === false ? 'primary' : 'outline'} size="sm">Sale</Button>
                </div>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    isDeleting={deletingId === post.id}
                  />
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-gray-600 dark:text-gray-300 text-center"
              >
                No posts match your filters.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}