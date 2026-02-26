-- SQL para crear las tablas de Feria Segura
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT,
  rut TEXT UNIQUE,
  telefono TEXT,
  puesto_numero TEXT,
  role TEXT DEFAULT 'feriante',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de alertas
CREATE TABLE IF NOT EXISTS alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT,
  lat FLOAT,
  lng FLOAT,
  accuracy FLOAT,
  user_id UUID REFERENCES usuarios(id),
  user_name TEXT,
  user_phone TEXT,
  puesto_numero TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- 3. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso - USUARIOS
CREATE POLICY "Usuarios ven su perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- 5. Políticas de acceso - ALERTAS
CREATE POLICY "Usuarios ven sus alertas" ON alertas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean alertas" ON alertas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin ve todas las alertas" ON alertas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin actualiza alertas" ON alertas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Trigger para crear usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, rut, telefono, puesto_numero, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'rut',
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'puesto_numero',
    'feriante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
