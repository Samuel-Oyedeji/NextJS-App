// src/components/properties/CommentForm.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { supabase } from '@/lib/supabase/client';
import { Comment } from '@/types';
import toast from 'react-hot-toast';

interface CommentFormProps {
  propertyId: string;
  userId: string;
  onCommentAdded?: (comment: Comment) => void;
}

export default function CommentForm({ propertyId, userId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          property_id: propertyId,
          user_id: userId,
          content: comment.trim()
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();
        
      if (error) throw error;
      
      // Clear the form
      setComment('');
      
      // Notify parent component
      if (onCommentAdded && data) {
        onCommentAdded(data);
      }
      
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="bg-blue-600 text-white px-3 py-2 rounded-r-md focus:outline-none hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <FiSend />
          )}
        </motion.button>
      </div>
    </form>
  );
}