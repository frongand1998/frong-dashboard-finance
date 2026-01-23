-- Create OCR usage tracking table
CREATE TABLE IF NOT EXISTS ocr_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_ocr_usage_user_id ON ocr_usage(user_id);
CREATE INDEX idx_ocr_usage_created_at ON ocr_usage(created_at);

-- Add composite index for user + date queries
CREATE INDEX idx_ocr_usage_user_date ON ocr_usage(user_id, created_at);
