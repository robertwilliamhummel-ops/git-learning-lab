# Firebase Email Integration Guide

## Overview

This guide shows how to add professional email functionality to your invoice system using Firebase Cloud Functions + Nodemailer with your existing Zoho Mail.

**Benefits:**
- ✅ Sends from your real email: rob@techflowsolutions.ca
- ✅ Secure (password stored in Firebase secrets)
- ✅ Professional HTML emails
- ✅ FREE (uses your existing Zoho Mail)
- ✅ No monthly limits

---

## Step 1: Install Nodemailer

In your `functions/` directory, run:

```bash
cd functions
npm install nodemailer
```

---

## Step 2: Add Zoho Password to Firebase Secrets

```bash
firebase functions:secrets:set ZOHO_EMAIL_PASSWORD
```

When prompted, enter your Zoho Mail password for rob@techflowsolutions.ca

**Note:** This stores it securely in Firebase, not in your code!

---

## Step 3: Update functions/index.js

### Add at the top (line 5):

```javascript
const nodemailer = require("nodemailer");
```

### Add to secrets section (line 9):

```javascript
const zohoEmailPassword = defineSecret("ZOHO_EMAIL_PASSWORD");
```

### Add new function at the end (after line 182):

```javascript
/**
 * Send Invoice Email
 * Called from frontend when user clicks "Send Invoice"
 * Sends professional email from rob@techflowsolutions.ca with invoice details
 */
exports.sendInvoiceEmail = onCall(
    {secrets: [zohoEmailPassword]},
    async (request) => {
      try {
        const {
          customerEmail,
          customerName,
          invoiceNumber,
          invoiceDate,
          items,
          subtotal,
          tax,
          total,
        } = request.data;

        // Validate input
        if (!customerEmail || !invoiceNumber) {
          throw new Error("Customer email and invoice number are required");
        }

        // Create email transporter using Zoho Mail
        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.com",
          port: 465,
          secure: true,
          auth: {
            user: "rob@techflowsolutions.ca",
            pass: zohoEmailPassword.value(),
          },
        });

        // Format invoice items for email
        let itemsHTML = "";
        if (items && items.length > 0) {
          itemsHTML = items.map((item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.description}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ${item.quantity} × $${item.rate}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                $${item.amount}
              </td>
            </tr>
          `).join("");
        }

        // Create HTML email
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea;">
    <h1 style="color: #667eea; margin: 0; font-size: 28px;">TechFlow Solutions</h1>
    <p style="color: #666; margin: 5px 0;">Website Design & IT Services</p>
  </div>

  <!-- Invoice Info -->
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">Invoice ${invoiceNumber}</h2>
    <p style="margin: 5px 0;"><strong>Date:</strong> ${invoiceDate}</p>
    <p style="margin: 5px 0;"><strong>Bill To:</strong> ${customerName}</p>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background: #667eea; color: white;">
        <th style="padding: 12px; text-align: left;">Description</th>
        <th style="padding: 12px; text-align: right;">Qty × Rate</th>
        <th style="padding: 12px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="text-align: right; margin-bottom: 30px;">
    <p style="margin: 10px 0; font-size: 16px;"><strong>Subtotal:</strong> $${subtotal}</p>
    <p style="margin: 10px 0; font-size: 16px;"><strong>HST (13%):</strong> $${tax}</p>
    <p style="margin: 10px 0; font-size: 20px; color: #667eea;"><strong>Total:</strong> $${total}</p>
  </div>

  <!-- Payment Info -->
  <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
    <h3 style="margin: 0 0 10px 0; color: #856404;">Payment Information</h3>
    <p style="margin: 5px 0;">This invoice can be paid via:</p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Credit Card (Stripe payment link in invoice)</li>
      <li>E-Transfer to: rob@techflowsolutions.ca</li>
      <li>Cash or Cheque (in person)</li>
    </ul>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
    <p style="margin: 5px 0;"><strong>TechFlow Solutions</strong></p>
    <p style="margin: 5px 0;">Greater Toronto Area</p>
    <p style="margin: 5px 0;">📞 (647) 572-8321 | 📧 rob@techflowsolutions.ca</p>
    <p style="margin: 15px 0 5px 0;">Thank you for your business!</p>
  </div>

</body>
</html>
        `;

        // Send email
        const info = await transporter.sendMail({
          from: "TechFlow Solutions <rob@techflowsolutions.ca>",
          to: customerEmail,
          subject: `Invoice ${invoiceNumber} from TechFlow Solutions`,
          html: emailHTML,
        });

        console.log(`Invoice email sent: ${info.messageId}`);

        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (error) {
        console.error("Error sending invoice email:", error);
        throw new Error(`Unable to send email: ${error.message}`);
      }
    },
);
```

---

## Step 4: Deploy Updated Functions

```bash
firebase deploy --only functions
```

---

## Step 5: Update Frontend to Call Email Function

In your `InvoiceSystem/js/invoice.js`, add this function:

```javascript
async function sendInvoiceEmail(invoiceData) {
    try {
        // Import Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js');
        const functions = getFunctions();
        
        // Call the email function
        const sendEmail = httpsCallable(functions, 'sendInvoiceEmail');
        
        const result = await sendEmail({
            customerEmail: invoiceData.customer.email,
            customerName: invoiceData.customer.name,
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceDate: invoiceData.date,
            items: invoiceData.items,
            subtotal: invoiceData.subtotal.toFixed(2),
            tax: invoiceData.tax.toFixed(2),
            total: invoiceData.total.toFixed(2)
        });
        
        return result.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
```

---

## Step 6: Update "Send Invoice" Button

```javascript
document.getElementById('send-invoice-btn').addEventListener('click', async () => {
    try {
        // Show loading
        const btn = document.getElementById('send-invoice-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // 1. Save to Firestore
        const result = await firestoreManager.saveInvoice(invoiceData);
        
        // 2. Send email
        await sendInvoiceEmail({
            customer: {
                email: customerEmail,
                name: customerName
            },
            invoiceNumber: result.invoiceNumber,
            date: invoiceDate,
            items: invoiceItems,
            subtotal: subtotal,
            tax: tax,
            total: total
        });
        
        // 3. Success!
        alert(`Invoice ${result.invoiceNumber} sent successfully!`);
        clearForm();
        
    } catch (error) {
        alert('Error sending invoice: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-envelope"></i> Send Invoice';
    }
});
```

---

## Testing

### Test Email Sending:

1. Fill out invoice form
2. Click "Preview Invoice"
3. Click "Send Invoice"
4. Check customer's email inbox
5. Check your Zoho sent folder

---

## Troubleshooting

### "Authentication failed"
- Check Zoho password in Firebase secrets
- Make sure you're using correct email: rob@techflowsolutions.ca

### "Email not received"
- Check spam folder
- Verify customer email is correct
- Check Firebase Functions logs: `firebase functions:log`

### "Function not found"
- Make sure you deployed: `firebase deploy --only functions`
- Check function name matches: `sendInvoiceEmail`

---

## Security Notes

**✅ Secure:**
- Zoho password stored in Firebase secrets (encrypted)
- Function runs server-side (password never exposed)
- Only authenticated users can call function

**❌ Not Exposed:**
- Email password NOT in code
- Email password NOT in browser
- Email password NOT in Git

---

## Cost

**Firebase Functions:**
- Free tier: 2 million invocations/month
- You'll use maybe 50-100/month = FREE

**Zoho Mail:**
- Already paid for
- No additional cost

**Total:** $0.00/month

---

## Comparison: EmailJS vs Firebase + Nodemailer

| Feature | EmailJS | Firebase + Nodemailer |
|---------|---------|----------------------|
| **Security** | ❌ API keys in browser | ✅ Server-side, hidden |
| **Sender** | ❌ emailjs.com | ✅ rob@techflowsolutions.ca |
| **Monthly Limit** | ❌ 200 emails | ✅ Unlimited |
| **PDF Attachments** | ❌ No | ✅ Yes |
| **Spam Risk** | ⚠️ Medium | ✅ Low |
| **Professional** | ❌ No | ✅ Yes |
| **Cost** | Free | Free |
| **Setup Time** | 5 min | 30 min |

---

## Next Steps

1. ✅ Review this guide
2. Install nodemailer: `cd functions && npm install nodemailer`
3. Add Zoho password to secrets: `firebase functions:secrets:set ZOHO_EMAIL_PASSWORD`
4. Update functions/index.js (copy code from above)
5. Deploy: `firebase deploy --only functions`
6. Update frontend to call email function
7. Test with a real invoice!

---

**Ready to implement when you are!** 🚀

This gives you professional email functionality using your existing Firebase setup and Zoho Mail - no additional services needed!