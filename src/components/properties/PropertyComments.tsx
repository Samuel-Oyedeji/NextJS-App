// src/components/properties/PropertyComments.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from '@/types';
import { supabase } from '@/lib/supabase/client';
import CommentForm from './CommentForm';

interface PropertyCommentsProps {
  propertyId: string;
  currentUserId: string | null | undefined;
}

export default function PropertyComments({ propertyId, currentUserId }: PropertyCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:users(*)
          `)
          .eq('property_id', propertyId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
    
    // Real-time subscription for new comments
    const subscription = supabase
      .channel(`comments:property_id=eq.${propertyId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `property_id=eq.${propertyId}` 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new comment with user data
            fetchNewComment(payload.new.id);
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [propertyId]);

  const fetchNewComment = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', commentId)
        .single();
        
      if (error) throw error;
      
      setComments(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error fetching new comment:', error);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Comments</h3>
      
      {/* Comment Form */}
      {currentUserId ? (
        <CommentForm 
          propertyId={propertyId} 
          userId={currentUserId} 
          onCommentAdded={handleCommentAdded} 
        />
      ) : (
        <p className="text-sm text-gray-500 mb-4">Please log in to leave a comment</p>
      )}
      
      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3 mt-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet</p>
            ) : (
              comments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-2"
                >
                  {/* User Avatar */}
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    {comment.user?.profile_picture ? (
                      <Image
                        src={comment.user.profile_picture}
                        alt={comment.user.full_name || ''}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-xs">
                        {comment.user?.full_name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <div className="font-medium text-xs">{comment.user?.full_name}</div>
                      <div className="text-sm">{comment.content}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}