-- 1. Crear tabla para las carpetas
CREATE TABLE IF NOT EXISTS public.outfit_folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad (RLS) en la nueva tabla
ALTER TABLE public.outfit_folders ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para que cada usuario vea solo sus carpetas
CREATE POLICY "Users can manage their own outfit folders" 
  ON public.outfit_folders
  FOR ALL USING (auth.uid() = user_id);

-- 4. Asegurarnos que la tabla outfits tenga la columna (si no la tenía)
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS folder text;

-- 5. RECARGAR EL CACHÉ DE LA API (Esto soluciona el error PGRST204)
NOTIFY pgrst, 'reload schema';
