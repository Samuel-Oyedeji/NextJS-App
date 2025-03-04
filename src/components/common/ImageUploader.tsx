// src/components/common/ImageUploader.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  bucket: 'profile-pictures' | 'property-images';
  onImageUploaded: (url: string) => void;
  existingImageUrl?: string;
  maxImages?: number;
  multiple?: boolean;
}

export default function ImageUploader({
  bucket,
  onImageUploaded,
  existingImageUrl,
  maxImages = 1,
  multiple = false,
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImageUrl ? [existingImageUrl] : []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setUploading(true);
      
      const files = Array.from(event.target.files);
      const filesToUpload = files.slice(0, maxImages - images.length);
      
      // Validate file types
      const validFiles = filesToUpload.filter(file => 
        file.type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      );
      
      if (validFiles.length !== filesToUpload.length) {
        toast.error('Only JPEG, PNG and WebP images are supported');
      }
      
      if (validFiles.length === 0) return;
      
      const uploadedUrls: string[] = [];
      
      // Upload each file
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${Date.now()}-${fileName}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);
          
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
          
        uploadedUrls.push(urlData.publicUrl);
      }
      
      // Update state and notify parent
      setImages(prev => [...prev, ...uploadedUrls]);
      
      if (uploadedUrls.length > 0) {
        if (multiple) {
          uploadedUrls.forEach(url => onImageUploaded(url));
        } else {
          onImageUploaded(uploadedUrls[0]);
        }
        
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    
    // If multiple is false, we need to let the parent know that the image was removed
    if (!multiple && newImages.length === 0) {
      onImageUploaded('');
    }
  };

  const canAddMoreImages = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {images.map((imageUrl, index) => (
            <motion.div
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative rounded-md overflow-hidden h-24 w-24"
            >
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Upload Button */}
        {canAddMoreImages && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleUpload}
              multiple={multiple && maxImages > 1}
              disabled={uploading}
              className="hidden"
            />
          </motion.div>
        )}
      </div>
      
      {/* Status Message */}
      {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
      {maxImages > 1 && (
        <p className="text-xs text-gray-500">
          {images.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  );
}