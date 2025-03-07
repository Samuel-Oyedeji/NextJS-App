'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please log in to view profiles');
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profile) return <div className="text-center py-10">Profile not found.</div>;

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>Name:</strong> {profile.full_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>ID:</strong> {profile.id}</p>
      </div>
    </div>
  );
}