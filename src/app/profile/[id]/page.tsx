// src/app/profile/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSupabase } from '@/lib/supabase/fetch';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FaUser, FaCamera, FaHome } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { debounce } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';

const RecentPostsSection = dynamic(() => import('@/components/RecentPostsSection'), {
  ssr: false,
  loading: () => <p className="text-gray-600 dark:text-gray-400">Loading recent posts...</p>,
});

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  profile_picture: string | null;
}

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

export default function ProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentPosts, setRecentPosts] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', profilePictureFile: null as File | null });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRecentPosts, setShowRecentPosts] = useState(false);

  useEffect(() => {
    async function fetchProfileAndPosts() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please log in to view profiles');
          router.push('/login');
          return;
        }
        setCurrentUserId(session.user.id);

        const [
          profileData,
          postsData,
        ] = await Promise.all([
          fetchSupabase<UserProfile>(
            'users',
            qb => qb.select('id, email, full_name, username, profile_picture').eq('id', params.id).single(),
            { revalidate: 3600 }
          ),
          fetchSupabase<Property[]>(
            'properties',
            qb => qb.select('*, property_images (image_url, is_primary)').eq('user_id', params.id).order('created_at', { ascending: false }).limit(3),
            { revalidate: 600 }
          ),
        ]);

        setProfile(profileData);
        setFormData({ username: profileData.username || '', profilePictureFile: null });
        setRecentPosts(postsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load profile or posts');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndPosts();

    const debouncedUpdateProfile = debounce((newProfile: UserProfile) => {
      setProfile(newProfile);
      setFormData({ username: newProfile.username || '', profilePictureFile: null });
      toast.success('Profile updated in real-time!');
    }, 300);

    const profileSubscription = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${params.id}` },
        payload => debouncedUpdateProfile(payload.new as UserProfile)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUserId || profile.id !== currentUserId) return;

    const confirmSave = window.confirm('Are you sure you want to save these changes?');
    if (!confirmSave) return;

    setSaving(true);
    try {
      let profilePictureUrl = profile.profile_picture;

      if (formData.profilePictureFile) {
        const file = formData.profilePictureFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);
        profilePictureUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ username: formData.username, profile_picture: profilePictureUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, username: formData.username, profile_picture: profilePictureUrl });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (!profile) {
    return <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">Profile not found</div>;
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-4"
        >
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 hover-scale">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 mb-4">
                {profile.profile_picture ? (
                  <Image
                    src={profile.profile_picture}
                    alt={profile.username || profile.full_name || 'Profile'}
                    fill
                    sizes="128px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPJ7lNiQAAAABJRU5ErkJggg=="
                    priority // Eager load profile picture
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-500 dark:bg-blue-600 text-white text-3xl">
                    {profile.username?.[0]?.toUpperCase() || profile.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {profile.username || profile.full_name || 'Unnamed User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{profile.email}</p>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>

            <AnimatePresence>
              {isEditing && isOwnProfile && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <Input
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    fullWidth
                    icon={<FaUser className="text-gray-400" />}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                    <input
                      type="file"
                      name="profilePictureFile"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={saving}
                    className="flex items-center justify-center"
                  >
                    {saving ? <span className="animate-spin mr-2">⏳</span> : null}
                    Save Changes
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {isOwnProfile && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <FaHome className="mr-2" /> Recent Posts
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecentPosts(!showRecentPosts)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showRecentPosts ? 'Hide' : 'Show'}
                </Button>
              </div>
              <AnimatePresence>
                {showRecentPosts && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RecentPostsSection posts={recentPosts} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}