-- Solución al error: "value too long for type character varying(25)"
-- Este script amplía los límites de las columnas de la tabla team_members

ALTER TABLE public.team_members
  ALTER COLUMN name TYPE VARCHAR(255),
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN role TYPE VARCHAR(255),
  ALTER COLUMN area TYPE VARCHAR(255),
  ALTER COLUMN status TYPE VARCHAR(100);

ALTER TABLE public.team_domains
  ALTER COLUMN name TYPE VARCHAR(255),
  ALTER COLUMN status TYPE VARCHAR(100);
