# OCR Setup Guide

## Quick Setup

### 1. Install Dependencies

Already installed:

```bash
npm install tesseract.js
```

### 2. Create Database Table

Run the SQL migration in your **Supabase SQL Editor**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste this SQL:

```sql
-- Create OCR usage tracking table
CREATE TABLE IF NOT EXISTS ocr_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ocr_usage_user_id ON ocr_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_usage_created_at ON ocr_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ocr_usage_user_date ON ocr_usage(user_id, created_at);
```

6. Click "Run" (or press Cmd+Enter)
7. Verify "Success. No rows returned" message

### 3. Verify Table Created

In Supabase Dashboard:

1. Click "Table Editor"
2. Look for "ocr_usage" table
3. Should see columns: `id`, `user_id`, `created_at`

### 4. Test the Feature

1. Start development server (already running):

   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/add

3. Look for:
   - "Payslip Image (Optional)" section
   - "OCR Scans: 50 of 50 remaining this month" indicator

4. Upload a payment slip:
   - Drag & drop an image
   - Or click "Browse files"

5. Watch for:
   - "🔍 Extracting data from image..." (3-5 seconds)
   - Form auto-fills with extracted data
   - Check remaining scans counter decrements

### 5. Test Duplicate Detection

1. Add a transaction with the uploaded slip
2. Upload the same slip again
3. Should see: "Duplicate Payment Slip Detected" warning
4. Options: "Cancel & Remove Image" or "Proceed Anyway"

### 6. Test Limit Warning

To test the limit warning quickly:

1. Change limit temporarily in `src/server-actions/ocr-usage.ts`:

   ```typescript
   const OCR_MONTHLY_LIMIT = 2; // Temporarily set to 2
   ```

2. Upload 2 payment slips
3. Try to upload a 3rd slip
4. Should see: "Monthly OCR Limit Reached" modal
5. Reset limit back to 50 after testing

## Configuration

### Adjust Monthly Limit

Edit `src/server-actions/ocr-usage.ts`:

```typescript
const OCR_MONTHLY_LIMIT = 50; // Change this number
```

Options:

- Free tier: 50-100 scans
- Basic tier: 200-500 scans
- Premium tier: 1000+ or unlimited

### Supported Languages

Currently supports:

- Thai (tha)
- English (eng)

To add more languages, edit `src/lib/ocr/parser.ts`:

```typescript
const worker = await createWorker("tha+eng+jpn", 1); // Add +jpn for Japanese
```

Available languages: https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html

## Troubleshooting

### Issue: "Failed to extract data from image"

**Causes:**

- Image quality too low
- Text is handwritten
- Unusual font/format

**Solutions:**

- Use clearer, higher resolution images
- Ensure good lighting
- Try re-taking photo
- Fall back to manual entry

### Issue: Extracted data is incorrect

**Causes:**

- OCR misread characters
- Unusual slip format
- Mixed languages

**Solutions:**

- Users can manually edit form before submitting
- Add new patterns to `parsePaymentSlipText()` in `src/lib/ocr/parser.ts`
- Consider upgrading to Google Vision API for better accuracy

### Issue: "Monthly limit reached" appearing incorrectly

**Debug:**

1. Check current usage:

   ```sql
   SELECT user_id, COUNT(*) as scans
   FROM ocr_usage
   WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
   GROUP BY user_id;
   ```

2. Manually reset user's usage (testing only):
   ```sql
   DELETE FROM ocr_usage
   WHERE user_id = 'user_xxxxx'
   AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
   ```

### Issue: OCR is very slow

**Causes:**

- Large image files
- Client device performance
- Tesseract initialization

**Solutions:**

- Compress images before processing
- Show loading indicator (already implemented)
- Consider server-side OCR for production

### Issue: Database migration failed

**Solution:**
Run SQL manually in Supabase Dashboard:

1. Copy SQL from: `supabase/migrations/create_ocr_usage_table.sql`
2. Paste in Supabase SQL Editor
3. Run query
4. Verify table created

## Performance Optimization

### Image Preprocessing

Add to `src/lib/ocr/parser.ts`:

```typescript
async function preprocessImage(file: File): Promise<File> {
  // Convert to canvas
  const img = new Image();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Resize if too large
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;

  // Apply filters (brightness, contrast)
  // Convert to grayscale
  // Return processed file
}
```

### Caching

Tesseract worker is created fresh each time. To optimize:

```typescript
let workerCache: Worker | null = null;

export async function getWorker() {
  if (!workerCache) {
    workerCache = await createWorker("tha+eng", 1);
  }
  return workerCache;
}
```

## Monitoring

### Usage Analytics

Query Supabase to track:

```sql
-- Total scans this month
SELECT COUNT(*) as total_scans
FROM ocr_usage
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- Active users (users who did OCR this month)
SELECT COUNT(DISTINCT user_id) as active_users
FROM ocr_usage
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- Heavy users (top 10)
SELECT user_id, COUNT(*) as scans
FROM ocr_usage
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id
ORDER BY scans DESC
LIMIT 10;

-- Users hitting limit
SELECT user_id, COUNT(*) as scans
FROM ocr_usage
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id
HAVING COUNT(*) >= 50;
```

### Error Tracking

Add Sentry or logging:

```typescript
// In src/lib/ocr/parser.ts
export async function performOCR(imageFile: File): Promise<ParsedSlipData> {
  try {
    const text = await extractTextFromImage(imageFile);
    return parsePaymentSlipText(text);
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      extra: {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
      },
    });
    throw error;
  }
}
```

## Upgrade Path

### From Tesseract to Google Vision

1. Install Google Cloud Vision:

   ```bash
   npm install @google-cloud/vision
   ```

2. Create API route: `src/app/api/ocr/route.ts`

3. Replace `performOCR()` call:

   ```typescript
   // Instead of: performOCR(file)
   const formData = new FormData();
   formData.append("image", file);
   const response = await fetch("/api/ocr", {
     method: "POST",
     body: formData,
   });
   const { text } = await response.json();
   ```

4. Update costs in documentation

## Security Checklist

- [x] User authentication required (Clerk)
- [x] Per-user usage limits enforced
- [x] Server-side validation on usage recording
- [x] No image storage (privacy-friendly)
- [x] Client-side processing (Tesseract.js)
- [x] Rate limiting via monthly caps
- [x] SQL injection safe (parameterized queries)

## Support

For help:

1. Check console logs for errors
2. Verify Supabase table exists
3. Test with sample slip from `docs/OCR_DEMO.md`
4. Review extracted text in console: `console.log('Extracted text:', text)`
5. Check OCR usage in database

## Next Steps

After setup:

1. ✅ Test with real payment slips
2. ✅ Monitor usage and accuracy
3. ✅ Gather user feedback
4. ✅ Consider premium tier
5. ✅ Add more bank formats
6. ✅ Improve auto-categorization rules

## Files Reference

- `src/lib/ocr/parser.ts` - OCR logic
- `src/server-actions/ocr-usage.ts` - Usage tracking
- `src/app/(dashboard)/add/page.tsx` - UI
- `supabase/migrations/create_ocr_usage_table.sql` - Database schema
- `docs/OCR_FEATURE.md` - Feature documentation
- `docs/OCR_DEMO.md` - Demo guide
- `scripts/migrate-ocr-usage.js` - Migration helper
