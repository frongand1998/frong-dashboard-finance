/**
 * OCR text parser for Thai payment slips using Tesseract.js
 * Free OCR solution with usage tracking
 */
import { createWorker } from 'tesseract.js';

export interface ParsedSlipData {
  amount?: number;
  date?: string;
  merchant?: string;
  reference?: string;
  type: 'income' | 'expense';
  category?: string;
  note?: string;
}

export interface OcrUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  resetDate: string;
}

/**
 * Parse Thai payment slip text
 * Supports SCB, Kbank, Bangkok Bank, and other Thai bank formats
 */
export function parsePaymentSlipText(text: string): ParsedSlipData {
  const result: ParsedSlipData = {
    type: 'expense', // Default to expense for payments
  };

  // Extract amount (จำนวนเงิน)
  // Prioritize patterns with explicit amount keywords to avoid matching Biller IDs
  const amountPatterns = [
    /จำนวนเงิน[:\s]+([\d,]+(?:[.,]\d{2})?)/i,
    /จ[าำ]นวนเง[ิี]น[:\s]+([\d,]+(?:[.,]\d{2})?)/i, // Handle OCR errors
    /amount[:\s]+([\d,]+(?:[.,]\d{2})?)/i,
    /total[:\s]+([\d,]+(?:[.,]\d{2})?)/i,
    /ยอดเงิน[:\s]+([\d,]+(?:[.,]\d{2})?)/i,
    /เง[ิี]น[:\s]+([\d,]+(?:[.,]\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})+(?:\.\d{2})?)\s*(?:บาท|baht)/i, // 1,600.00 บาท
    /(\d+\.\d{2})\s*(?:บาท|baht)/i, // Amount followed by currency
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const rawAmount = match[1].trim();
      let normalizedAmount = rawAmount;

      if (rawAmount.includes(',') && rawAmount.includes('.')) {
        // Treat commas as thousand separators
        normalizedAmount = rawAmount.replace(/,/g, '');
      } else if (rawAmount.includes(',')) {
        // If value has commas and is long, treat as thousand separators; otherwise decimal
        const digitsOnly = rawAmount.replace(/,/g, '');
        normalizedAmount = digitsOnly.length >= 4 ? digitsOnly : rawAmount.replace(',', '.');
      }

      const parsedAmount = parseFloat(normalizedAmount);
      // Filter out unreasonable amounts (too large = likely Biller ID/phone number)
      if (parsedAmount > 0 && parsedAmount < 10000000) {
        result.amount = parsedAmount;
        console.log('Amount extracted:', result.amount, 'from:', match[0]);
        break;
      }
    }
  }

  // Fallback: look for standalone reasonable amounts if not found yet
  if (!result.amount) {
    // Look for numbers with 2 decimals that are NOT part of IDs (avoid 10+ digit numbers)
    const fallbackMatches = text.match(/(?<!\d)(\d{1,6}\.\d{2})(?!\d)/g);
    if (fallbackMatches) {
      for (const match of fallbackMatches) {
        const parsedAmount = parseFloat(match);
        if (parsedAmount > 0 && parsedAmount < 10000000) {
          result.amount = parsedAmount;
          console.log('Amount extracted (fallback):', result.amount);
          break;
        }
      }
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2})\s*[./]\s*(\d{1,2})\s*[./]\s*(\d{4})/,
    /(\d{1,2})\s+([ม|ก|มี|เม|พ|มิ|ส|ก|ต|พ|ธ])\.?[คยนยยคยวศตย]\.?\s+(\d{4})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let day = parseInt(match[1]);
      let month = match[2];
      let year = parseInt(match[3]);

      // Convert Buddhist year to Christian year
      if (year > 2500) {
        year = year - 543;
      }

      // Convert Thai month abbreviation to number
      const thaiMonths: { [key: string]: number } = {
        'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
        'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
        'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
      };

      let monthNum: number;
      if (typeof month === 'string' && isNaN(parseInt(month))) {
        monthNum = thaiMonths[month] || 1;
      } else {
        monthNum = parseInt(month);
      }

      // Format as YYYY-MM-DD
      result.date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      break;
    }
  }

  // Extract merchant/receiver (ไปยัง / To)
  const merchantPatterns = [
    /ไปยัง[:\s]+([^\n]+)/,
    /to[:\s]+([^\n]+)/i,
    /ผู้รับ[:\s]+([^\n]+)/,
    /recipient[:\s]+([^\n]+)/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.merchant = match[1].trim();
      break;
    }
  }

  // Extract reference number
  const refPatterns = [
    /รหัสอ้างอิง[:\s]+([A-Za-z0-9]+)/,
    /reference[:\s]+([A-Za-z0-9]+)/i,
    /ref[:\s]+([A-Za-z0-9]+)/i,
    /เลขที่อ้างอิง[:\s]+([A-Za-z0-9]+)/,
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.reference = match[1];
      break;
    }
  }

  // Determine category based on merchant name
  if (result.merchant) {
    const merchantLower = result.merchant.toLowerCase();
    
    if (merchantLower.includes('7-eleven') || merchantLower.includes('lotus') || 
        merchantLower.includes('big c') || merchantLower.includes('tops')) {
      result.category = 'Groceries';
    } else if (merchantLower.includes('minor') || merchantLower.includes('restaurant') ||
               merchantLower.includes('cafe') || merchantLower.includes('food')) {
      result.category = 'Food & Dining';
    } else if (merchantLower.includes('dtac') || merchantLower.includes('ais') ||
               merchantLower.includes('true')) {
      result.category = 'Utilities';
    } else if (merchantLower.includes('bts') || merchantLower.includes('grab') ||
               merchantLower.includes('bolt')) {
      result.category = 'Transportation';
    } else {
      result.category = 'Shopping';
    }
  }

  // Build note from available info
  const noteParts: string[] = [];
  if (result.merchant) {
    noteParts.push(`Payment to: ${result.merchant}`);
  }
  if (result.reference) {
    noteParts.push(`Ref: ${result.reference}`);
  }
  result.note = noteParts.join(' | ');

  return result;
}

/**
 * Extract text from payment slip image using Tesseract.js OCR
 * Supports both Thai and English text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  const worker = await createWorker('tha+eng', 1, {
    logger: (m) => console.log('[Tesseract]', m.status, m.progress),
  });

  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Main OCR function to extract and parse payment slip data
 * Tracks usage and enforces monthly limits
 */
export async function performOCR(imageFile: File): Promise<ParsedSlipData> {
  // Extract text using Tesseract OCR
  const extractedText = await extractTextFromImage(imageFile);
  console.log('=== OCR Extracted Text ===');
  console.log(extractedText);
  console.log('=== End Extracted Text ===');
  
  // Parse the extracted text
  const parsed = parsePaymentSlipText(extractedText);
  console.log('=== Parsed Data ===');
  console.log(parsed);
  console.log('=== End Parsed Data ===');
  
  return parsed;
}
