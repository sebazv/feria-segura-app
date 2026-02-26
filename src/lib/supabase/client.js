import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './keys';

// Cliente público (para el frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
