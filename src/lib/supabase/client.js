import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adrrlwaplqgxdwwydpsn.supabase.co';
const supabaseAnonKey = 'sb_publishable_95Jp2n0BcaUBajHLb2jItw_zcYWsg1p';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
