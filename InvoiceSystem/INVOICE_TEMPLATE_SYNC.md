# Invoice Template Synchronization Guide

## Overview
The TechFlow invoice system generates invoices in multiple formats (Preview, PDF, Email). To maintain consistency, invoice content is defined in **TWO separate locations** that must be kept in sync.

---

## Critical: Two HTML Generation Functions

### 1. Preview Invoice
**File:** `InvoiceSystem/js/invoice.js`
**Function:** `generateInvoiceHTML(invoiceData)`
**Lines:** ~200-310
**Used for:** Browser preview display

### 2. PDF Attachment
**File:** `functions/index.js`  
**Function:** `generatePDFHTML(items, customerName, invoiceNumber, invoiceDate, subtotal, tax, total)`  
**Lines:** ~220-340  
**Used for:** PDF generation via Cloud Run service

---

## How PDF Generation Works (Technical Note)

**Question:** How do we convert CSS to PDF?
**Answer:** We don't!

Puppeteer is a **headless Chrome browser** that renders HTML/CSS exactly like a real browser, then "prints" the rendered page to PDF. There's no CSS-to-PDF conversion happening.

### Why Two Different Approaches?

| Preview | PDF |
|---------|-----|
| Uses external CSS file (`invoice.css`) | Uses inline styles |
| Example: `<div class="payment-section">` | Example: `<div style="margin: 20px 0;">` |
| CSS classes reference stylesheet | Styles embedded in HTML |

### Why Inline Styles for PDF?

The PDF service receives only HTML (no external CSS files), so we embed styles directly in the HTML. Puppeteer's Chrome engine renders these inline styles perfectly, then captures that rendering as a PDF.

### The Process:

1. **Firebase Function** generates HTML with inline styles
2. **Cloud Run PDF Service** (Puppeteer) loads that HTML
3. **Chrome rendering engine** displays it (with all styles working)
4. **PDF capture** takes a "picture" of that rendered page
5. **Result:** Perfect PDF that looks identical to browser preview

This is why the PDF looks exactly like the preview - both use the same rendering engine (Chromium), just with different style delivery methods (external CSS vs inline styles).

---

## ⚠️ IMPORTANT: Making Changes

**ANY change to invoice content MUST be made in BOTH places:**

1. Update `InvoiceSystem/js/invoice.js` - Preview HTML
2. Update `functions/index.js` - PDF HTML

### Common Changes Requiring Sync:
- Company information (address, phone, email)
- Payment instructions
- Terms and conditions
- Footer text
- Layout/styling changes

---

## Current Invoice Structure

### Header Section
- Company name: TechFlow Solutions
- Business info: Website Design & IT Services, Greater Toronto Area
- Contact: (647) 572-8341, info@techflowsolutions.ca
- Logo: TechFlow Solutions Logo (right side)

### Body Section
- Bill To (customer details)
- Invoice Details (number, date, due date)
- Services Table (description, qty/hours, rate, amount)
- Totals (subtotal, HST 13%, total)

### Payment Section (Compact Design)
- **E-Transfer (Preferred):** invoices@techflowsolutions.ca
- **Credit Card:** See email for secure payment link
- **Cash/Cheque:** Accepted in person
- Payment due within 15 days
- Questions: (647) 572-8341

---

## Email Template (Separate)

**File:** `functions/index.js`  
**Function:** `sendInvoiceEmail()` - `emailHTML` variable  
**Lines:** ~420-520

The email has its own HTML template with:
- Stripe payment button (when available)
- E-Transfer listed first (preferred - no fees)
- Different styling optimized for email clients

**Note:** Email changes do NOT need to sync with Preview/PDF since it has different requirements (clickable buttons, email-safe HTML).

---

## Future Improvement: Shared Template

**Current Status:** Two separate HTML generation functions (manual sync required)

**Future Option:** Create a shared template system where invoice content is defined once and used by both Preview and PDF generators. This would eliminate the need for manual synchronization.

**Why Not Implemented Yet:** 
- Current system works well
- Rarely needs changes
- Simple to maintain for now
- Shared template adds complexity

**When to Consider:**
- If invoice changes become frequent
- If team grows and multiple people edit invoices
- If adding more invoice types/formats

---

## Quick Reference Checklist

When modifying invoice content:

- [ ] Update `InvoiceSystem/js/invoice.js` (Preview)
- [ ] Update `functions/index.js` (PDF generation)
- [ ] Test Preview invoice
- [ ] Send test invoice and check PDF attachment
- [ ] Verify both look identical
- [ ] Deploy Firebase function: `firebase deploy --only functions`
- [ ] Commit and push changes

---

## Related Files

- `InvoiceSystem/css/invoice.css` - Invoice styling
- `InvoiceSystem/index.html` - Invoice form UI
- `pdf-service/index.js` - Cloud Run PDF service (Puppeteer)
- `functions/index.js` - Firebase Cloud Functions (email & PDF coordination)

---

**Last Updated:** February 2026  
**Status:** Production - Working perfectly, no changes needed unless requirements change