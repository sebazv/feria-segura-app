// Configuración de Supabase - Feria Segura
// Proyecto: Spikey

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://adrrlwaplqgxdwwydpsn.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_95Jp2n0BcaUBajHLb2jItw_zcYWsg1p';

// Nota: El secret key NO debe estar en el código frontend
// Se usa solo desde el servidor/Edge Functions
