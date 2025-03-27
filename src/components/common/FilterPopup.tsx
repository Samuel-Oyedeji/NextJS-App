import React from 'react';
import Button from '@/components/ui/Button';
import { nigerianStates } from '@/data/nigerianStates';

interface FilterState {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  isForRent: string;
  minSquareFeet: string;
  maxSquareFeet: string;
  datePosted: string;
  currency: string;
}

interface FilterPopupProps {
  filters: FilterState;
  onSave: (filters: FilterState, close: () => void) => void;
  onClose: () => void;
}

export default function FilterPopup({ filters, onSave, onClose }: FilterPopupProps) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      isForRent: '',
      minSquareFeet: '',
      maxSquareFeet: '',
      datePosted: '',
      currency: 'NGN',
    };
    setLocalFilters(resetFilters);
    onSave(resetFilters, onClose);
  };

  const handleSave = () => {
    onSave(localFilters, onClose);
  };

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Location</label>
        <select
          name="location"
          value={localFilters.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any</option>
          {nigerianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Currency</label>
        <select
          name="currency"
          value={localFilters.currency}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {currencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Min Price</label>
          <input
            type="number"
            name="minPrice"
            value={localFilters.minPrice}
            onChange={handleChange}
            placeholder="1000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Max Price</label>
          <input
            type="number"
            name="maxPrice"
            value={localFilters.maxPrice}
            onChange={handleChange}
            placeholder="5000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Bedrooms</label>
        <select
          name="bedrooms"
          value={localFilters.bedrooms}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Bathrooms</label>
        <select
          name="bathrooms"
          value={localFilters.bathrooms}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Property Type</label>
        <select
          name="isForRent"
          value={localFilters.isForRent}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any</option>
          <option value="true">For Rent</option>
          <option value="false">For Sale</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Min Square Feet</label>
          <input
            type="number"
            name="minSquareFeet"
            value={localFilters.minSquareFeet}
            onChange={handleChange}
            placeholder="500"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Max Square Feet</label>
          <input
            type="number"
            name="maxSquareFeet"
            value={localFilters.maxSquareFeet}
            onChange={handleChange}
            placeholder="2000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">Date Posted</label>
        <select
          name="datePosted"
          value={localFilters.datePosted}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}