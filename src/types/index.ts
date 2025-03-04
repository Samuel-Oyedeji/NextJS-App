// src/types/index.ts
export interface User {
    id: string;
    email: string;
    full_name: string | null;
    profile_picture: string | null;
    bio: string | null;
    created_at: string;
  }
  
  export interface Property {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    price: number;
    is_for_rent: boolean;
    location: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    created_at: string;
    // Joins
    user?: User;
    images?: PropertyImage[];
    likes_count?: number;
    comments_count?: number;
    is_liked?: boolean;
  }
  
  export interface PropertyImage {
    id: string;
    property_id: string;
    image_url: string;
    is_primary: boolean;
    created_at: string;
  }
  
  export interface Comment {
    id: string;
    user_id: string;
    property_id: string;
    content: string;
    created_at: string;
    // Joins
    user?: User;
  }
  
  export interface Like {
    id: string;
    user_id: string;
    property_id: string;
    created_at: string;
  }