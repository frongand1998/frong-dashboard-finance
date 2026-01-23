# Payslip Image Upload & OCR Integration

## Current Implementation

The payslip image upload feature is now available on the "Add Transaction" page. Users can:

- Drag and drop payslip images
- Click to browse and select images
- Preview uploaded images
- Remove uploaded images

## Future OCR Integration

To enable automatic data extraction from payslip images, you can integrate one of these OCR services:

### Option 1: Tesseract.js (Free, Client-side)

```bash
npm install tesseract.js
```

Add to `ImageUpload.tsx`:

```typescript
import { createWorker } from "tesseract.js";

const extractTextFromImage = async (imageFile: File) => {
  const worker = await createWorker("eng");
  const {
    data: { text },
  } = await worker.recognize(imageFile);
  await worker.terminate();
  return text;
};
```

### Option 2: Google Cloud Vision API (Paid, High Accuracy)

```bash
npm install @google-cloud/vision
```

Create API route `/api/ocr/extract`:

```typescript
import vision from "@google-cloud/vision";

export async function POST(request: Request) {
  const { image } = await request.json();
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.textDetection(image);
  return Response.json({ text: result.fullTextAnnotation?.text });
}
```

### Option 3: AWS Textract (Paid, Good for Documents)

```bash
npm install @aws-sdk/client-textract
```

### Option 4: Azure Computer Vision (Paid, Microsoft)

```bash
npm install @azure/cognitiveservices-computervision
```

## Data Parsing Logic

Once you have the extracted text, you'll need to parse it to extract:

```typescript
interface PayslipData {
  employeeName?: string;
  employeeId?: string;
  date?: string;
  grossPay?: number;
  netPay?: number;
  deductions?: {
    tax?: number;
    insurance?: number;
    pension?: number;
  };
  employer?: string;
}

function parsePayslipText(text: string): PayslipData {
  // Example patterns - adjust based on your payslip format
  const patterns = {
    date: /Date[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    grossPay: /Gross Pay[:\s]+[$£€]?([\d,]+\.?\d*)/i,
    netPay: /Net Pay[:\s]+[$£€]?([\d,]+\.?\d*)/i,
    tax: /Tax[:\s]+[$£€]?([\d,]+\.?\d*)/i,
  };

  return {
    date: text.match(patterns.date)?.[1],
    grossPay: parseFloat(
      text.match(patterns.grossPay)?.[1]?.replace(/,/g, "") || "0",
    ),
    netPay: parseFloat(
      text.match(patterns.netPay)?.[1]?.replace(/,/g, "") || "0",
    ),
    deductions: {
      tax: parseFloat(text.match(patterns.tax)?.[1]?.replace(/,/g, "") || "0"),
    },
  };
}
```

## Integration Steps

1. **Choose an OCR service** based on your budget and accuracy needs
2. **Install dependencies** and set up API credentials
3. **Update `ImageUpload.tsx`** to call OCR service on upload
4. **Add parsing logic** to extract relevant fields
5. **Pre-fill form** with extracted data using React Hook Form's `setValue`:

```typescript
const handleImageSelect = async (file: File, preview: string) => {
  setPayslipImage(file);
  setImagePreview(preview);
  setIsProcessing(true);

  try {
    // Extract text from image
    const text = await extractTextFromImage(file);

    // Parse payslip data
    const payslipData = parsePayslipText(text);

    // Pre-fill form fields
    if (payslipData.netPay) {
      setValue("amount", payslipData.netPay);
      setValue("type", "income");
      setValue("category", "Salary");
    }
    if (payslipData.date) {
      setValue("date", formatDateForInput(payslipData.date));
    }
  } catch (error) {
    console.error("OCR failed:", error);
    // Show user-friendly error message
  } finally {
    setIsProcessing(false);
  }
};
```

6. **Add loading state** during OCR processing
7. **Handle errors** gracefully
8. **Allow manual editing** of extracted data

## Storage Considerations

If you want to store payslip images:

1. Add `image_url` column to `transactions` table
2. Use Supabase Storage or AWS S3 for image storage
3. Upload image after transaction creation:

```typescript
// In server-actions/transactions.ts
import { supabase } from "@/lib/supabaseClient";

export async function uploadPayslipImage(
  transactionId: string,
  imageFile: File,
) {
  const fileName = `${transactionId}-${Date.now()}.${imageFile.name.split(".").pop()}`;

  const { data, error } = await supabase.storage
    .from("payslips")
    .upload(fileName, imageFile);

  if (error) throw error;

  // Update transaction with image URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("payslips").getPublicUrl(fileName);

  await supabase
    .from("transactions")
    .update({ image_url: publicUrl })
    .eq("id", transactionId);

  return publicUrl;
}
```

## Privacy & Security

- **Encrypt images** at rest and in transit
- **Set retention policies** for automatic deletion
- **Comply with GDPR/privacy laws**
- **Don't store sensitive info** like social security numbers
- **Use signed URLs** for image access
- **Implement access controls** to ensure users only see their own payslips

## Testing

Test with various payslip formats:

- Different employers
- Different countries/currencies
- Different languages
- Various image qualities
- PDF vs image formats

## Cost Estimation

**Google Cloud Vision:**

- First 1,000 requests/month: Free
- After: $1.50 per 1,000 images

**AWS Textract:**

- $1.50 per 1,000 pages

**Tesseract.js:**

- Free (runs in browser)
- Lower accuracy than paid services

## Recommended Approach

1. **Start with Tesseract.js** for proof of concept (free, no API setup)
2. **Upgrade to Google Vision** if accuracy is insufficient
3. **Allow manual review** of extracted data before saving
4. **Add confidence scores** to show extraction reliability
