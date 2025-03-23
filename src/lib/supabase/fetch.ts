import { supabase } from './client';

export async function fetchSupabase<T>(
  table: string,
  query: (qb: any) => Promise<any>, // Adjusted to expect a Promise return
  options: { revalidate?: number } = {}
): Promise<T> {
  const { revalidate } = options;

  // Execute the Supabase query
  const response = await query(supabase.from(table));
  if (response.error) throw response.error;

  // If revalidate is provided, we could wrap in a fetch-like cache, but for now, return directly
  // Note: Without unstable_cache, caching relies on Next.js fetch or manual implementation
  return response.data;
}