'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { Popover, Transition } from '@headlessui/react';
import FilterPopup from './FilterPopup';

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

interface SearchBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function SearchBar({ onFilterChange }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
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
  });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setSearching(false);
      onFilterChange({ ...filters, location: searchTerm });
      return;
    }
    setSearching(true);
    const debounce = setTimeout(() => {
      onFilterChange({ ...filters, location: searchTerm });
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useEffect(() => {
    if (!searching) {
      onFilterChange({ ...filters, location: searchTerm });
    }
  }, [filters]);

  const handleFilterSave = (newFilters: FilterState, close: () => void) => {
    setFilters(newFilters);
    console.log('Filters saved:', { ...newFilters, location: searchTerm });
    close();
  };

  const removeFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  const removePriceRange = () => {
    setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }));
  };

  const removeSquareFeetRange = () => {
    setFilters((prev) => ({ ...prev, minSquareFeet: '', maxSquareFeet: '' }));
  };

  const currencySymbols: { [key: string]: string } = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
  };

  return (
    <div className="relative w-72 mr-32">
      <div className="flex items-center">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by location..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searching && (
            <span className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
              Searching...
            </span>
          )}
        </div>
        <button className="px-2 py-2 bg-blue-600 text-white hover:bg-blue-700">
          <FiSearch size={16} />
        </button>
        <Popover className="relative">
          {({ close }) => (
            <>
              <Popover.Button className="ml-1 px-2 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                <FiSliders size={16} />
              </Popover.Button>
              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute z-10 mt-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4">
                  <FilterPopup filters={filters} onSave={handleFilterSave} onClose={close} />
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {searchTerm && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {searchTerm}
            <FiX className="ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
          </span>
        )}
        {filters.minPrice && filters.maxPrice && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {currencySymbols[filters.currency]}{filters.minPrice}-{currencySymbols[filters.currency]}{filters.maxPrice}
            <FiX className="ml-1 cursor-pointer" onClick={removePriceRange} />
          </span>
        )}
        {filters.bedrooms && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {filters.bedrooms} Beds
            <FiX className="ml-1 cursor-pointer" onClick={() => removeFilter('bedrooms')} />
          </span>
        )}
        {filters.bathrooms && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {filters.bathrooms} Baths
            <FiX className="ml-1 cursor-pointer" onClick={() => removeFilter('bathrooms')} />
          </span>
        )}
        {filters.isForRent && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {filters.isForRent === 'true' ? 'For Rent' : 'For Sale'}
            <FiX className="ml-1 cursor-pointer" onClick={() => removeFilter('isForRent')} />
          </span>
        )}
        {filters.minSquareFeet && filters.maxSquareFeet && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {filters.minSquareFeet}-{filters.maxSquareFeet} sqft
            <FiX className="ml-1 cursor-pointer" onClick={removeSquareFeetRange} />
          </span>
        )}
        {filters.datePosted && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Last {filters.datePosted} Days
            <FiX className="ml-1 cursor-pointer" onClick={() => removeFilter('datePosted')} />
          </span>
        )}
        {filters.location && (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {filters.location}
            <FiX className="ml-1 cursor-pointer" onClick={() => removeFilter('location')} />
          </span>
        )}
      </div>
    </div>
  );
}