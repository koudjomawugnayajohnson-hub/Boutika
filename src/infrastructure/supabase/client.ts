import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fake-anon-key';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

// For testing or server-side admin tasks only (requires VITE_SUPABASE_SERVICE_ROLE_KEY)
export const getSupabaseAdmin = () => {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY');
    }
    return createClient<any>(supabaseUrl, serviceRoleKey);
};
