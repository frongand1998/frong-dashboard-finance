-- Create OCR limits table for per-user monthly limits
CREATE TABLE IF NOT EXISTS ocr_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  max_monthly INTEGER NOT NULL DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_ocr_limits_email ON ocr_limits(email);
