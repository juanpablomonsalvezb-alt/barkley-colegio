-- Extiende grade_level para incluir 1° a 4° básico
-- (originalmente solo 5° básico en adelante)

ALTER TYPE grade_level ADD VALUE IF NOT EXISTS '1_basico' BEFORE '5_basico';
ALTER TYPE grade_level ADD VALUE IF NOT EXISTS '2_basico' BEFORE '5_basico';
ALTER TYPE grade_level ADD VALUE IF NOT EXISTS '3_basico' BEFORE '5_basico';
ALTER TYPE grade_level ADD VALUE IF NOT EXISTS '4_basico' BEFORE '5_basico';
