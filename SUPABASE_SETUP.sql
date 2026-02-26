-- SQL para Feria Segura (sin RUT)
-- Ejecuta en SQL Editor de Supabase

-- 1. Tabla de usuarios (sin RUT)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
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

-- 3. Tabla de noticias
CREATE TABLE IF NOT EXISTS noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT,
  autor_id UUID REFERENCES usuarios(id),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id),
  user_name TEXT,
  puesto_numero TEXT,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de encuestas
CREATE TABLE IF NOT EXISTS encuestas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pregunta TEXT NOT NULL,
  opciones TEXT NOT NULL,
  autor_id UUID REFERENCES usuarios(id),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de votos
CREATE TABLE IF NOT EXISTS votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  encuesta_id UUID REFERENCES encuestas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES usuarios(id),
  opcion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(encuesta_id, user_id)
);

-- 7. Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hora_inicio TEXT DEFAULT '06:00',
  hora_fin TEXT DEFAULT '17:00',
  dias_activos TEXT DEFAULT '[false,false,true,true,true,true,true]',
  panic_button_activo BOOLEAN DEFAULT true,
  incentivos_habilitados BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Usuarios ven su perfil" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios actualizan" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuarios ven sus alertas" ON alertas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean alertas" ON alertas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin ve todas" ON alertas FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin actualiza" ON alertas FOR UPDATE USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos ven noticias" ON noticias FOR SELECT USING (activa = true);
CREATE POLICY "Admin noticias" ON noticias FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos ven mensajes" ON mensajes FOR SELECT USING (true);
CREATE POLICY "Usuarios envian" ON mensajes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Todos ven encuestas" ON encuestas FOR SELECT USING (activa = true);
CREATE POLICY "Admin encuestas" ON encuestas FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos ven votos" ON votos FOR SELECT USING (true);
CREATE POLICY "Usuarios votan" ON votos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Todos ven config" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Admin config" ON configuracion FOR UPDATE USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- Trigger auto-crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, telefono, puesto_numero, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'telefono', NEW.raw_user_meta_data->>'puesto_numero', 'feriante');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Datos de ejemplo
INSERT INTO noticias (titulo, contenido) VALUES ('Bienvenidos a Feria Segura', '¡Aplicación oficial del Sindicato de Peñaflor!');
INSERT INTO encuestas (pregunta, opciones) VALUES ('¿Qué horario te parece mejor para la próxima asamblea?', '["Mañana (9:00 AM)", "Tarde (2:00 PM)", "Noche (6:00 PM)"]');
INSERT INTO configuracion DEFAULT VALUES;

PRINT('✅ Feria Segura configurada (sin RUT)');
