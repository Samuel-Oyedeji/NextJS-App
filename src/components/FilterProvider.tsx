'use client';

import React, { createContext, useContext, useState } from 'react';

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
  currency: string; // New field
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const FilterContext = createContext<FilterContextType>({
  filters: {
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    isForRent: '',
    minSquareFeet: '',
    maxSquareFeet: '',
    datePosted: '',
    currency: 'NGN', // Default to Naira
  },
  setFilters: () => {},
});

export const useFilter = () => useContext(FilterContext);

export default function FilterProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}