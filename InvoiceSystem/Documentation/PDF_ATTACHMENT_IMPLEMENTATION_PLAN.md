# PDF Invoice Attachment Implementation Plan

## 🎯 Goal
Add PDF attachments to invoice emails so customers receive both:
- **HTML email** with clickable Stripe payment button
- **PDF attachment** for professional invoice record-keeping

---

## 📋 Step-by-Step Implementation

### **STEP 1: Install Puppeteer (5 minutes)**

Open terminal in the `functions/` directory and run:

```bash
cd functions
npm install puppeteer
```

**What this does:** Installs Puppeteer (headless Chrome) for generating PDFs from HTML.

---

### **STEP 2: Update Cloud Function** (30-45 minutes)

Open `functions/index.js` and modify the `sendInvoiceEmail` function.

#### **2A: Add Puppeteer Import**

At the top of `functions/index.js`, add:

```javascript
const puppeteer = require('puppeteer');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;
```

#### **2B: Create PDF Generation Function**

Add this function BEFORE the `sendInvoiceEmail` function:

```javascript
/**
 * Generate PDF from invoice HTML
 */
async function generateInvoicePDF(invoiceHTML, invoiceNumber) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfPath = path.join(os.tmpdir(), `invoice-${invoiceNumber}.pdf`);
    await page.pdf({
        path: pdfPath,
        format: 'Letter',
        printBackground: true,
        margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
        }
    });
    
    await browser.close();
    return pdfPath;
}
```

#### **2C: Modify sendInvoiceEmail Function**

Find the section where the email HTML is created (around line 246-328). After creating `emailHTML`, add:

```javascript
        // Generate complete invoice HTML for PDF (without payment buttons)
        const pdfHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea; }
    .header h1 { color: #667eea; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .invoice-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .invoice-info h2 { color: #333; margin: 0 0 15px 0; font-size: 24px; }
    .invoice-info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background: #667eea; color: white; }
    th { padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .totals { text-align: right; margin-bottom: 30px; }
    .totals p { margin: 10px 0; font-size: 16px; }
    .total-row { font-size: 20px; color: #667eea; }
    .payment-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>TechFlow Solutions</h1>
    <p>Website Design & IT Services</p>
  </div>

  <div class="invoice-info">
    <h2>Invoice ${invoiceNumber}</h2>
    <p><strong>Date:</strong> ${invoiceDate}</p>
    <p><strong>Bill To:</strong> ${customerName}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Qty × Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="totals">
    <p><strong>Subtotal:</strong> $${subtotal}</p>
    <p><strong>HST (13%):</strong> $${tax}</p>
    <p class="total-row"><strong>Total:</strong> $${total}</p>
  </div>

  <div class="payment-info">
    <h3>Payment Information</h3>
    <p><strong>Payment Options:</strong></p>
    <ul>
      <li>Credit Card via Stripe</li>
      <li>E-Transfer to: invoices@techflowsolutions.ca</li>
      <li>Cash or Cheque (in person)</li>
    </ul>
    <p><strong>Payment due within 15 days</strong></p>
  </div>

  <div class="footer">
    <p><strong>TechFlow Solutions</strong></p>
    <p>Greater Toronto Area</p>
    <p>📞 (647) 572-8321 | 📧 invoices@techflowsolutions.ca</p>
    <p>Thank you for your business!</p>
  </div>
</body>
</html>
        `;

        // Generate PDF
        const pdfPath = await generateInvoicePDF(pdfHTML, invoiceNumber);
```

#### **2D: Update Email Sending**

Find the `transporter.sendMail()` call and modify it to include the PDF attachment:

```javascript
        // Send email with PDF attachment
        const info = await transporter.sendMail({
          from: "TechFlow Solutions Invoices <invoices@techflowsolutions.ca>",
          to: customerEmail,
          subject: `Invoice ${invoiceNumber} from TechFlow Solutions`,
          html: emailHTML,
          attachments: [
            {
              filename: `Invoice-${invoiceNumber}.pdf`,
              path: pdfPath,
              contentType: 'application/pdf'
            }
          ]
        });

        // Clean up temporary PDF file
        try {
          await fs.unlink(pdfPath);
        } catch (cleanupError) {
          console.warn('Warning: Could not delete temporary PDF:', cleanupError);
        }

        console.log(`Invoice email sent with PDF attachment: ${info.messageId}`);
```

---

### **STEP 3: Update firebase.json** (2 minutes)

The Cloud Function needs more memory to run Puppeteer. Update `firebase.json`:

```json
{
  "_comment": "NOTE: Website hosting is done via GitHub Pages, not Firebase Hosting. Firebase is only used for Functions (email backend), Firestore (database), and Authentication.",
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "disallowLegacyRuntimeConfig": true,
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "runtime": "nodejs18",
      "memory": "1GB",
      "timeoutSeconds": 60
    }
  ]
}
```

---

### **STEP 4: Deploy** (5-10 minutes)

```bash
# Make sure you're in the project root directory
firebase deploy --only functions:sendInvoiceEmail
```

Wait for deployment to complete (may take 2-3 minutes).

---

### **STEP 5: Test** (10 minutes)

1. Open your invoice system
2. Fill out an invoice
3. Click "Send Invoice"
4. Check your email
5. Verify you received:
   - ✅ HTML email with payment button
   - ✅ PDF attachment named "Invoice-TFS-2026-XXXX.pdf"
6. Open PDF and verify formatting looks good

---

## 🎨 Optional Enhancements

### Add Company Logo to PDF

In the PDF HTML, replace the text header with:

```html
<div class="header">
  <img src="https://techflowsolutions.ca/assets/images/TechFlow%20Solutions%20Logo-%20Cropped.png" 
       alt="TechFlow Solutions" 
       style="max-width: 200px; margin-bottom: 10px;">
  <p>Website Design & IT Services</p>
</div>
```

### Improve PDF Styling

Add more CSS to the `<style>` section in pdfHTML for better formatting:
- Custom fonts
- Better colors
- Professional layout
- Page breaks for long invoices

---

## 🐛 Troubleshooting

### Problem: "Puppeteer failed to launch"

**Solution:** Add these args to the puppeteer.launch() call:
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]
```

### Problem: "Out of memory"

**Solution:** Increase memory in firebase.json to "2GB"

### Problem: "PDF looks different than preview"

**Solution:** 
- Use inline CSS (no external stylesheets)
- Set `printBackground: true` in PDF options
- Test with different paper sizes (Letter, A4)

### Problem: "Emails going to spam"

**Solution:**
- Make sure SPF record is set: `v=spf1 include:zohocloud.ca ~all`
- Keep PDF size under 1MB
- Test with different email providers

---

## 📊 What Customers Will Receive

**Email Subject:** Invoice TFS-2026-0001 from TechFlow Solutions

**Email Body:**
- Professional HTML invoice
- Clickable Stripe payment button
- E-Transfer instructions
- Company contact info

**Attachment:** Invoice-TFS-2026-0001.pdf
- Professional PDF format
- Printable
- Saveable for records
- No interactive elements (static document)

---

## ✅ Verification Checklist

Before considering this complete:

- [ ] Puppeteer installed in functions/
- [ ] Cloud Function modified with PDF generation
- [ ] firebase.json updated with memory/timeout
- [ ] Function deployed successfully
- [ ] Test email sent
- [ ] PDF attachment received
- [ ] PDF opens correctly
- [ ] PDF formatting looks professional
- [ ] HTML email still works with payment button
- [ ] No spam filter issues

---

## 📝 Git Commit Message

After successful implementation:

```bash
git add functions/index.js functions/package.json functions/package-lock.json firebase.json
git commit -m "Add PDF invoice attachments to emails"
git push
```

---

## ⏱️ Estimated Time

- **Step 1:** 5 minutes
- **Step 2:** 30-45 minutes
- **Step 3:** 2 minutes
- **Step 4:** 5-10 minutes
- **Step 5:** 10 minutes
- **Total:** 52-72 minutes (about 1 hour)

---

## 🎉 Success Criteria

You'll know it's working when:
1. Email arrives with PDF attached
2. PDF opens and displays invoice correctly
3. HTML email still has working Stripe payment button
4. No error messages in Firebase console
5. Customer can save/print PDF easily

Good luck with tomorrow's implementation! 🚀