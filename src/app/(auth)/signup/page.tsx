// src/app/(auth)/signup/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    
    checkSession();
  }, [router]);
  
  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <SignupForm />
    </div>
  );
}