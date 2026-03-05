# Multi-Page Invoice Repeating Header Implementation

## Overview
This document describes the implementation of repeating headers on multi-page PDF invoices using Puppeteer's native `displayHeaderFooter` feature.

## Problem Statement
When invoices span multiple pages, the header (company logo + info) needs to appear on every page. Initial attempts using CSS `position: fixed` caused content overlap issues due to a known Chromium/Puppeteer quirk where fixed headers don't reserve layout space.

## Solution: Puppeteer's headerTemplate
Instead of CSS hacks, we use Puppeteer's built-in `displayHeaderFooter` and `headerTemplate` features, which properly handle multi-page layouts.

## Implementation Details

### 1. PDF Service (pdf-service/index.js)
**Changes made:**
- Added support for optional `headerTemplate` parameter in POST request
- Updated `page.pdf()` options to include `displayHeaderFooter` when header is provided
- Adjusted top margin to `2in` when header is used (vs `0.5in` without)
- Always set `footerTemplate` to empty to prevent default footer

**Code (recommended final form):**
```javascript
const pdfOptions = {
  format: "Letter",
  printBackground: true,
  margin: {
    top: headerTemplate ? "2in" : "0.5in",
    right: "0.5in",
    bottom: "0.5in",
    left: "0.5in",
  },
  
  // Make behavior deterministic
  displayHeaderFooter: !!headerTemplate,
  headerTemplate: headerTemplate || "<div></div>",
  footerTemplate: "<div></div>",
};
```

**Rule**: Top margin must be >= header visual height (including padding + border). If not, content can clip under the header.

### 2. Firebase Functions (functions/index.js)
**Changes made:**

#### Added generateHeaderTemplate() function (Lines 17-30)
Creates the HTML template for the repeating header with:
- Company name and info on the left
- Company logo on the right
- Blue border bottom matching brand colors
- Inline styles for proper rendering

#### Updated generatePDFViaCloudRun() function (Line 35)
- Added `headerTemplate` parameter
- Sends headerTemplate to Cloud Run service in request body

#### Removed CSS print styles from generatePDFHTML()
- Removed entire `@media print` block that used fixed positioning
- Kept only basic body and container styles
- This prevents CSS conflicts with Puppeteer's native header feature

**Important**: headerTemplate has strict Puppeteer rules:
- No `<html>`, `<head>`, or `<body>` tags
- CSS must be inline only
- Special classes like `.pageNumber`/`.totalPages` only work in header/footer context

#### Updated function call (Line 561)
Changed from:
```javascript
pdfBuffer = await generatePDFViaCloudRun(pdfHTML, invoiceNumber);
```

To:
```javascript
pdfBuffer = await generatePDFViaCloudRun(pdfHTML, invoiceNumber, generateHeaderTemplate(invoiceNumber));
```

### 3. Files NOT Modified
- **InvoiceSystem/js/invoice.js** - Preview invoice unchanged (only needs to look good on screen)
- **InvoiceSystem/css/invoice.css** - No CSS changes needed

## Technical Details

### Header Template Structure
Uses **table layout** instead of flexbox for more reliable rendering in Puppeteer's header/footer context:

```html
<div style="width:100%; box-sizing:border-box; padding: 16px 40px 0 40px;
            font-family: Arial, sans-serif; -webkit-print-color-adjust: exact;">
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="vertical-align:top;">
        <div style="font-size:18px; font-weight:bold; color:#667eea; margin-bottom:3px;">
          TechFlow Solutions
        </div>
        <div style="font-size:11px; color:#718096;">Website Design &amp; IT Services</div>
        <div style="font-size:11px; color:#718096;">Greater Toronto Area</div>
      </td>
      <td style="vertical-align:top; text-align:right;">
        <img src="https://techflowsolutions.ca/assets/images/TechFlow%20Solutions%20Logo-%20Cropped.png"
             style="height:50px; width:auto;" />
      </td>
    </tr>
  </table>
  <div style="border-bottom:3px solid #667eea; margin-top:10px;"></div>
</div>
```

### Key Features
- **Table layout** instead of flexbox (more reliable in Puppeteer header/footer rendering)
- Uses absolute URL for logo image (required for Cloud Run)
- **Inline styles only** (external CSS not supported in headerTemplate)
- `-webkit-print-color-adjust: exact` ensures colors print correctly
- Proper HTML entity encoding (`&amp;` for ampersand)
- No `<html>`, `<head>`, or `<body>` tags (Puppeteer restriction)

## Deployment Steps

### 1. Deploy Cloud Run PDF Service
```powershell
cd pdf-service
.\deploy.ps1
```

### 2. Deploy Firebase Functions
```bash
firebase deploy --only functions
```

### 3. Test with Multi-Page Invoice
Create invoices to test multi-page behavior and edge cases:

**Basic Multi-Page Test:**
- 10+ line items to span multiple pages
- Verify header appears on all pages
- Confirm no content overlap
- Check logo displays correctly
- Validate border and styling

**Edge Case Testing:**
- Test with very long descriptions (text wrapping)
- Test with page break near totals section (8-12 rows)
- Test with tall table rows (multi-line descriptions)
- Run multiple times to catch intermittent logo loading issues

## Expected Behavior

### Page 1
- Full invoice with header (logo + company info)
- Content starts below header with proper spacing

### Page 2+
- Header repeats at top of each page
- Content flows normally below header
- No overlap or layout issues
- Professional appearance maintained

## Advantages Over CSS Approach

1. **No Content Overlap**: Puppeteer reserves proper space for header
2. **Reliable**: Uses native Puppeteer feature designed for this purpose
3. **Clean Code**: No complex CSS print media queries
4. **Maintainable**: Easier to understand and modify
5. **Cross-Browser**: Works consistently in Puppeteer's Chromium
6. **Table Layout**: More stable than flexbox in header/footer context

## Troubleshooting

### Header Not Appearing
- Ensure `headerTemplate` parameter is being passed
- Check Cloud Run logs for errors
- Verify `displayHeaderFooter` is set to `true`

### Content Overlap
- Verify top margin is set to `2in` when header is used
- If header height changes, adjust margin accordingly (current: ~90px header + space = 2in safe)
- Check that `displayHeaderFooter` is true

### Logo Not Displaying or Missing Intermittently
**Common Issue**: External images in headerTemplate can fail to load due to:
- Network delays or DNS hiccups
- Cloud Run egress timing
- Puppeteer rendering before image fetch completes

**Solutions** (in order of reliability):

1. **Most Reliable**: Embed logo as base64 data URL in header template
   ```javascript
   // Convert logo to base64 once, use in template
   const logoBase64 = "data:image/png;base64,iVBORw0KG...";
   ```

2. **Good Alternative**: Host logo on fast CDN with aggressive caching headers

3. **Current Setup**: Using absolute URL to techflowsolutions.ca
   - Works most of the time
   - May occasionally fail on slow networks
   - Consider adding `page.waitForFunction()` to ensure image loads before PDF generation

### Styling Issues
- Remember: only inline styles work in headerTemplate
- Use `-webkit-print-color-adjust: exact` for colors
- Prefer table layout over flexbox for header/footer
- Test with different page counts

### Footer Appearing Unexpectedly
- Ensure `footerTemplate: "<div></div>"` is always set
- Check that `preferCSSPageSize` is not enabled (can affect pagination)

## Implementation Notes

### Why Table Layout?
Puppeteer's header/footer rendering uses a slightly different layout engine than the main page. Flexbox can behave unpredictably (wrapping, misalignment, clipped height). Table layout is more stable and reliable in this context.

### Margin Sizing
**Critical Rule**: Top margin must be >= header visual height (including padding + border). If not, content can clip under the header.

Current setup: `2in` top margin is safe for ~90px header height. If you increase header padding or logo size, adjust the margin accordingly to prevent clipping.

### Git History Note
Previous attempts using CSS `position: fixed` were rolled back to commit `0a2c439` (March 1, 2026) before implementing this solution.

## Related Documentation
- [Invoice Template Sync](./INVOICE_TEMPLATE_SYNC.md)
- [Cloud Run PDF Service Implementation](./CLOUD_RUN_PDF_SERVICE_IMPLEMENTATION.md)
- [Multi-Page Invoice Implementation](./MULTI_PAGE_INVOICE_IMPLEMENTATION.md)

## Status
✅ Code changes complete
⏳ Awaiting deployment
⏳ Awaiting testing

---
**Last Updated:** March 5, 2026
**Implementation:** Puppeteer headerTemplate approach
**Status:** Ready for deployment