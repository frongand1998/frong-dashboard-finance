# OCR Payment Slip Feature

## Overview

The payment slip OCR (Optical Character Recognition) feature allows users to automatically extract transaction data from Thai bank payment slips by simply uploading an image.

## Features

✅ **Free OCR** - Uses Tesseract.js for free client-side OCR  
✅ **Thai Language Support** - Recognizes both Thai and English text  
✅ **Auto-fill Form** - Extracts and pre-fills amount, date, merchant, category  
✅ **Duplicate Detection** - Warns users when uploading the same slip twice  
✅ **Usage Limits** - 50 free OCR scans per month  
✅ **Usage Tracking** - Shows remaining scans  
✅ **Buddhist Year Conversion** - Automatically converts Thai Buddhist years to Christian years

## Usage Limits

- **Free Tier**: 50 OCR scans per month
- Resets on the 1st day of each month
- Users see remaining scans on the Add Transaction page
- Clear warning when limit is reached
- Can still add transactions manually after limit

## How It Works

1. **Upload Image**: User drags/drops or selects a payment slip image
2. **Check Limit**: System verifies user hasn't exceeded monthly OCR limit
3. **Record Usage**: Increments OCR scan count for the user
4. **Extract Text**: Tesseract.js reads Thai/English text from the image
5. **Parse Data**: Extracts transaction details using regex patterns:
   - Amount (จำนวนเงิน)
   - Date (with Buddhist year conversion)
   - Merchant (ไปยัง)
   - Reference number (รหัสอ้างอิง)
6. **Check Duplicates**: Searches existing transactions for matching reference
7. **Auto-categorize**: Maps merchant name to category
8. **Pre-fill Form**: Populates form fields with extracted data

## Supported Fields

### Amount

- Patterns: `จำนวนเงิน`, `amount`, `total`, `ยอดเงิน`
- Example: `จำนวนเงิน 50.00` → 50.00

### Date

- Formats: `DD/MM/YYYY`, `DD ม.ค. YYYY`
- Buddhist year conversion: 2569 → 2026
- Example: `23 ม.ค. 2569` → `2026-01-23`

### Merchant

- Patterns: `ไปยัง`, `to`, `ผู้รับ`, `recipient`
- Example: `ไปยัง แมคโดนัลด์` → "แมคโดนัลด์"

### Reference

- Patterns: `รหัสอ้างอิง`, `reference`, `ref`
- Example: `รหัสอ้างอิง: 202601232fnIcroQ3YZ3wufHK`

### Auto-categorization

- McDonald's, MINOR, restaurants → Food & Dining
- 7-Eleven, Lotus, Big C → Groceries
- DTAC, AIS, True → Utilities
- BTS, Grab, Bolt → Transportation
- Default → Shopping

## Database Schema

```sql
CREATE TABLE ocr_usage (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## Implementation Files

### Core OCR Logic

- `src/lib/ocr/parser.ts` - OCR extraction and text parsing
  - `extractTextFromImage()` - Tesseract.js wrapper
  - `performOCR()` - Main OCR function
  - `parsePaymentSlipText()` - Regex parsing logic

### Server Actions

- `src/server-actions/ocr-usage.ts` - Usage tracking
  - `getOcrUsage()` - Get current month usage
  - `recordOcrUsage()` - Increment usage counter

### UI Components

- `src/app/(dashboard)/add/page.tsx` - Add Transaction page with OCR
- `src/components/transaction/ImageUpload.tsx` - Image upload component

### Database

- `supabase/migrations/create_ocr_usage_table.sql` - Migration script

## User Experience

### First Upload

1. User sees "OCR Scans: 50 of 50 remaining this month"
2. Uploads payment slip image
3. Sees "🔍 Extracting data from image..." (animated)
4. Form auto-fills after 3-5 seconds
5. User reviews and submits

### Duplicate Detection

If same reference number exists:

- Shows warning modal with reference and previous date
- Options: "Cancel & Remove Image" or "Proceed Anyway"
- If proceed: adds "(Duplicate)" label to note

### Limit Reached

When 50 scans used:

- Upload blocked before processing
- Shows limit warning modal
- Displays: used count, limit, reset date
- User can still add transactions manually

## Cost

**100% Free** - No API costs

- Tesseract.js runs in the browser
- No external API calls
- Only database storage for tracking usage

## Accuracy

Tesseract.js accuracy depends on:

- ✅ **Good**: Clear, high-resolution images
- ✅ **Good**: Standard bank slip formats
- ⚠️ **Medium**: Low-light or blurry images
- ⚠️ **Medium**: Handwritten notes
- ❌ **Poor**: Heavily distorted images

Users can always manually edit extracted data before submitting.

## Future Enhancements

### Possible Upgrades

1. **Google Vision API** - Higher accuracy ($1.50 per 1,000 images)
2. **Custom training** - Train Tesseract for specific bank formats
3. **Image preprocessing** - Enhance image quality before OCR
4. **Batch upload** - Process multiple slips at once
5. **Confidence scores** - Show extraction reliability
6. **Premium tier** - Unlimited scans for paid users

### Premium Tier Options

- 50 free scans/month (current)
- 500 scans/month - $4.99
- Unlimited scans - $9.99

## Testing

Test with various slip types:

- SCB (Siam Commercial Bank)
- Kbank (Kasikorn Bank)
- Bangkok Bank
- KrungThai Bank
- Different merchants
- Various amounts and dates

## Security

- ✅ Images processed client-side (Tesseract.js)
- ✅ Images not stored (privacy-friendly)
- ✅ User isolation (per-user tracking)
- ✅ Rate limiting (monthly caps)
- ✅ Server-side auth checks (Clerk)

## Monitoring

Track these metrics:

- OCR usage per user per month
- Average scans per user
- Users hitting limits
- Success/failure rates
- Popular merchants/categories

## Support

For issues:

1. Check image quality (clear, well-lit)
2. Try manual entry if OCR fails
3. Ensure slip text is legible
4. Contact support if persistent issues

## Admin Tools

To adjust limits:

```typescript
// In src/server-actions/ocr-usage.ts
const OCR_MONTHLY_LIMIT = 50; // Change this value
```

To view usage analytics:

```sql
-- Monthly usage by user
SELECT user_id, COUNT(*) as scans
FROM ocr_usage
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id
ORDER BY scans DESC;

-- Average scans per user
SELECT AVG(scan_count) FROM (
  SELECT user_id, COUNT(*) as scan_count
  FROM ocr_usage
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY user_id
) subquery;
```
