-- Add tag array columns to clothing_items
ALTER TABLE clothing_items
ADD COLUMN IF NOT EXISTS telas text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colores text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_vestido text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_pantalon text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_zapatos text[] DEFAULT '{}';
