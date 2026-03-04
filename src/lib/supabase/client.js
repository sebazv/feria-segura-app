import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://adrrlwaplqgxdwwydpsn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnJsd2FwbHFneGR3d3lkcHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjQ4MDAsImV4cCI6MjA1MTI0MDgwMH0.NdHHtCIhmhOJNO8fQlGgDm5QG3mJWp6uLLCpBTxDm9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
