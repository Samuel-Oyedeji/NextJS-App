// src/app/create-post/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDollarSign, FiMap, FiMaximize2, FiPhone } from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import { supabase } from '@/lib/supabase/client';
import { nigerianStates } from '@/data/nigerianStates';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUploader from '@/components/common/ImageUploader';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function CreatePostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'NGN',
    isForRent: false,
    location: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    contactPhone: '',
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking auth:', error);
        toast.error('Failed to verify authentication');
        router.push('/login');
        return;
      }

      if (!session) {
        toast.error('You must be logged in to create a post');
        router.push('/login');
        return;
      }

      setUserId(session.user.id);
    }

    checkAuth();
  }, [router]);

  const handleImageUploaded = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Check if the target is an HTMLInputElement and handle checkbox separately
    if ('type' in e.target && e.target.type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('You must be logged in to create a post');
      return;
    }

    if (!formData.title || !formData.price || !formData.location || images.length === 0) {
      toast.error('Please fill in all required fields (Title, Price, Location) and upload at least one image');
      return;
    }

    setIsLoading(true);

    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          is_for_rent: formData.isForRent,
          location: formData.location,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
          contact_phone: formData.contactPhone || null,
        })
        .select()
        .single();

      if (propertyError) {
        console.error('Properties insert failed:', propertyError);
        throw propertyError;
      }

      const imageInserts = images.map((url, index) => ({
        property_id: property.id,
        image_url: url,
        is_primary: index === 0,
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Property_images insert failed:', imagesError);
        throw imagesError;
      }

      toast.success('Property posted successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create property post');
    } finally {
      setIsLoading(false);
    }
  };

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
  ];

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">List Your Property</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Property Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                name="title"
                label="Property Title"
                placeholder="Cozy Apartment in Downtown"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />

              <div className="flex items-center space-x-3 mt-6">
                <input
                  type="checkbox"
                  id="isForRent"
                  name="isForRent"
                  checked={formData.isForRent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isForRent" className="text-sm text-gray-700 dark:text-gray-300">
                  For Rent (Uncheck for Sale)
                </label>
              </div>
            </div>

            <textarea
              name="description"
              placeholder="Describe your property..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-4 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                name="price"
                label="Price"
                type="number"
                placeholder="250000"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                icon={<FiDollarSign className="text-gray-400" />}
              />
              <span className="absolute right-3 top-11 text-sm text-gray-500 dark:text-gray-400">
                {formData.isForRent ? 'per month' : 'total'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a state</option>
              {nigerianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              name="bedrooms"
              label="Bedrooms"
              type="number"
              placeholder="2"
              value={formData.bedrooms}
              onChange={handleChange}
              fullWidth
              icon={<FaBed className="text-gray-400" />}
            />

            <Input
              name="bathrooms"
              label="Bathrooms"
              type="number"
              placeholder="1"
              value={formData.bathrooms}
              onChange={handleChange}
              fullWidth
              icon={<FaBath className="text-gray-400" />}
            />

            <Input
              name="squareFeet"
              label="Square Feet"
              type="number"
              placeholder="1200"
              value={formData.squareFeet}
              onChange={handleChange}
              fullWidth
              icon={<FiMaximize2 className="text-gray-400" />}
            />
          </div>

          <div>
            <Input
              name="contactPhone"
              label="Contact Phone Number"
              type="tel"
              placeholder="+1 (123) 456-7890"
              value={formData.contactPhone}
              onChange={handleChange}
              fullWidth
              icon={<FiPhone className="text-gray-400" />}
              pattern="^\+?[1-9]\d{1,14}$"
              title="Enter a valid phone number (e.g., +11234567890)"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Optional. Provide a phone number for interested buyers/renters to contact you.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Property Images</h2>
            <ImageUploader
              bucket="property-images"
              onImageUploaded={handleImageUploaded}
              maxImages={5}
              multiple
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || images.length === 0}
          >
            Post Property
          </Button>
        </form>
      </motion.div>
    </ErrorBoundary>
  );
}