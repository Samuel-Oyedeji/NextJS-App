import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaComment, FaTrash } from 'react-icons/fa';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface Comment {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  created_at: string;
  users: { username: string };
}

interface CommentsSectionProps {
  propertyId: string;
  initialComments: Comment[];
  userId: string | null;
}

const CommentItem = React.memo(
  ({ comment, userId, onDelete }: { comment: Comment; userId: string | null; onDelete: (id: string) => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-start"
    >
      <div>
        <p className="text-gray-800 dark:text-gray-100">{comment.content}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By @{comment.users.username} on {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
      {userId === comment.user_id && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(comment.id)}
          className="flex items-center space-x-1"
        >
          <FaTrash />
          <span>Delete</span>
        </Button>
      )}
    </motion.div>
  )
);

export default function CommentsSection({ propertyId, initialComments, userId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) {
      toast.error(userId ? 'Comment cannot be empty' : 'Please log in to comment');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({ user_id: userId, property_id: propertyId, content: newComment })
        .select('*, users (username)')
        .single();
      if (error) throw error;
      setComments(prev => [...prev, data]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId) {
      toast.error('Please log in to delete your comment');
      return;
    }
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId);
      if (error) throw error;
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <FaComment className="mr-2" /> Comments
      </h2>
      <form onSubmit={handleComment} className="mb-6">
        <Input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          fullWidth
          className="mb-2"
        />
        <Button type="submit" variant="primary" disabled={!newComment.trim() || loading}>
          Post Comment
        </Button>
      </form>
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userId={userId}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No comments yet.</p>
        )}
      </div>
    </div>
  );
}