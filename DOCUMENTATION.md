# Frong Finance Documentation

Welcome to Frong Finance - your smart personal finance companion!

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Payment Slip OCR](#payment-slip-ocr)
- [Managing Transactions](#managing-transactions)
- [Financial Goals](#financial-goals)
- [Export & Search](#export--search)
- [FAQ](#faq)

## Getting Started

### Creating Your Account

1. Visit [Frong Finance](https://frong-finance.vercel.app)
2. Click "Get Started Free" or "Sign Up"
3. Register using email or social login via Clerk
4. Verify your email (if required)
5. Start tracking your finances!

### Dashboard Overview

After logging in, you'll see:

- **Dashboard**: Overview of income, expenses, and goals
- **Transactions**: Detailed list of all your financial activity
- **Goals**: Track your savings targets
- **Add Transaction**: Manually add or scan payment slips

## Features

### 📸 Payment Slip OCR

Automatically extract transaction data from Thai payment slips:

**Supported Banks:**

- SCB (Siam Commercial Bank)
- Krungthai Bank
- Bangkok Bank
- Kasikornbank
- And more...

**How to Use:**

1. Go to "Add Transaction"
2. Click "Upload Payment Slip"
3. Select up to 10 images at once
4. Review extracted data
5. Confirm and create transactions

**Limitations:**

- 50 free scans per month
- Resets on the 1st of each month
- Images processed locally (not stored on servers)

### 💰 Transaction Management

**Add Manually:**

- Date, amount, category, type (income/expense)
- Optional notes
- Multi-currency support

**Edit Transactions:**

- Click "Edit" on any transaction
- Modify any field
- Delete individual transactions

**Categories:**

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Salary
- Business
- And more...

### 🎯 Financial Goals

Set and track savings goals:

1. Click "Goals" in navigation
2. Add new goal with:
   - Goal name
   - Target amount
   - Target date
3. Track progress with visual indicators
4. Edit or delete goals anytime

### 🔍 Search & Filter

Find transactions quickly:

**Search:**

- By category name
- By note content
- By amount
- By transaction type

**Date Filters:**

- Start date
- End date
- Custom ranges

**Export:**

- Download filtered results as CSV
- Import into Excel or Google Sheets
- Analyze your spending patterns

## Payment Slip OCR

### How It Works

Frong Finance uses **Tesseract.js** for client-side OCR:

1. **Upload** - You select payment slip images
2. **Process** - OCR runs in your browser (Thai + English)
3. **Extract** - Data parsed from recognized text:
   - Amount
   - Date (Buddhist → Christian calendar conversion)
   - Merchant name
   - Reference number
4. **Auto-categorize** - Smart category assignment
5. **Review** - You verify and edit if needed

### Batch Processing

Upload up to 10 slips simultaneously:

- Progress indicator shows current/total
- Duplicate detection (same reference number)
- Summary view before creating transactions

### Troubleshooting

**OCR not accurate?**

- Ensure good image quality
- Avoid blurry or dark images
- Crop to slip area only

**Hitting usage limit?**

- 50 scans per month on free tier
- Resets automatically each month
- Check remaining scans in profile

## Managing Transactions

### Viewing Transactions

The Transactions page shows:

- Date, category, type badges
- Amount (color-coded: green = income, red = expense)
- Notes
- Edit button

**Summary Cards:**

- Total Income
- Total Expenses
- Net Balance

### Filtering

Combine multiple filters:

- Search term + date range
- Shows "X of Y transactions"
- Clear all filters button

### Exporting

1. Apply desired filters (optional)
2. Click "Export CSV"
3. File downloads: `transactions_2026-01-26.csv`
4. Contains: Date, Type, Category, Amount, Note

### Deleting

**Single Transaction:**

- Click "Edit" → Delete button

**All Transactions:**

- Click "Delete All" in header
- Confirmation modal prevents accidents
- Permanent action - cannot be undone!

## Financial Goals

### Creating Goals

Required fields:

- **Goal Name** (e.g., "Emergency Fund")
- **Target Amount** (e.g., 100,000 THB)
- **Target Date** (optional deadline)

### Tracking Progress

Visual progress bars show:

- Current saved amount / Target
- Percentage complete
- Days remaining (if date set)

### Editing Goals

- Update target amount
- Change deadline
- Rename goal
- Mark as complete

## Export & Search

### CSV Export

**Format:**

```csv
Date,Type,Category,Amount,Note
2026-01-26,expense,Food & Dining,50,McDonald's
```

**Uses:**

- Import to Excel/Google Sheets
- Create custom charts
- Tax preparation
- Budget analysis
- Accounting software integration

### Search Features

**Instant filtering:**

- Type to search across all fields
- Case-insensitive
- Partial matches supported

**Search Fields:**

- Category
- Note
- Amount (exact or partial)
- Type (income/expense)

## FAQ

### Is Frong Finance free?

Yes! 100% free with 50 OCR scans per month.

### Is my financial data secure?

Yes. Data stored in Supabase with row-level security. OCR processing happens locally in your browser.

### Can I use it on mobile?

Absolutely! Fully responsive design works on all devices.

### Which currencies are supported?

THB (Thai Baht), USD (US Dollar), EUR (Euro), and more via Settings.

### Can I export my data?

Yes! Use the "Export CSV" button on the Transactions page.

### What if OCR makes a mistake?

You can review and edit all extracted data before creating transactions.

### How do I delete my account?

Contact support at hello@frongfinance.com with your request.

### Can I suggest features?

Yes! Submit feedback via our [feedback form](https://forms.gle/your-feedback-form).

## Support

Need help? Reach out:

- **Email**: hello@frongfinance.com
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/frong-finance/issues)
- **Discord**: [Join our community](https://discord.gg/frongfinance)

---

Built with ❤️ using Next.js, Supabase, and Tesseract.js
