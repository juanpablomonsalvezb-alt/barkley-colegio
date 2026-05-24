-- Audio Overview (podcast NotebookLM) por unidad
-- Permite asociar 1 MP3 por unidad generado vía notebooklm-py

ALTER TABLE units
  ADD COLUMN IF NOT EXISTS audio_overview_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_overview_duration_seconds INT,
  ADD COLUMN IF NOT EXISTS audio_overview_status TEXT DEFAULT 'pendiente'
    CHECK (audio_overview_status IN ('pendiente', 'generando', 'listo', 'fallido')),
  ADD COLUMN IF NOT EXISTS audio_overview_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS audio_overview_notebook_id TEXT,
  ADD COLUMN IF NOT EXISTS audio_overview_error TEXT;

CREATE INDEX IF NOT EXISTS idx_units_audio_status ON units(audio_overview_status)
  WHERE audio_overview_status IN ('pendiente', 'fallido');

COMMENT ON COLUMN units.audio_overview_url IS 'URL pública del MP3 en Supabase Storage (bucket audio-overviews)';
COMMENT ON COLUMN units.audio_overview_notebook_id IS 'ID del notebook NotebookLM source, para regenerar';
