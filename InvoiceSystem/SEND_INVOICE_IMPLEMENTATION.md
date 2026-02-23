# Send Invoice Button Implementation Plan

## Overview
Add "Send Invoice" functionality that saves to Firestore and sends email via Firebase Cloud Function.

---

## What We Need to Add

### 1. HTML Changes (index.html)
Add "Send Invoice" button between Preview and Print buttons.

**Location:** Line 218-228 (form-actions section)

```html
<div class="form-actions">
    <button type="button" id="preview-invoice-btn" class="btn btn-primary">
        <i class="fas fa-eye"></i> Preview Invoice
    </button>
    <button type="button" id="send-invoice-btn" class="btn btn-success">
        <i class="fas fa-envelope"></i> Send Invoice
    </button>
    <button type="button" id="print-invoice-btn" class="btn btn-secondary">
        <i class="fas fa-print"></i> Print Invoice
    </button>
    <button type="button" id="clear-form-btn" class="btn btn-outline">
        <i class="fas fa-refresh"></i> Clear Form
    </button>
</div>
```

---

### 2. JavaScript Changes (invoice.js)

#### A. Add Event Listener (in initializeEventListeners method, around line 30)

```javascript
// Send invoice button
document.addEventListener('click', (e) => {
    if (e.target.id === 'send-invoice-btn') {
        this.sendInvoice();
    }
});
```

#### B. Add sendInvoice Method (after printInvoice method, around line 344)

```javascript
/**
 * Send invoice via email and save to Firestore
 */
async sendInvoice() {
    // Validate invoice first
    const errors = this.validateInvoice();
    if (errors.length > 0) {
        this.showValidationErrors(errors);
        return;
    }

    // Check if customer has email
    const customer = this.getCustomerData();
    if (!customer.email) {
        alert('Customer email is required to send invoice');
        return;
    }

    try {
        // Show loading state
        const btn = document.getElementById('send-invoice-btn');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Get invoice data
        const invoiceData = this.getInvoiceData();
        
        // Save to Firestore
        const savedInvoice = await window.firestoreManager.saveInvoice(invoiceData);
        
        // Send email via Firebase Function
        await this.sendInvoiceEmail(savedInvoice);
        
        // Increment counter
        this.incrementInvoiceCounter();
        
        // Show success
        this.showNotification(
            `Invoice ${savedInvoice.invoiceNumber} sent successfully!`,
            'success'
        );
        
        // Clear form for next invoice
        this.clearForm();
        
    } catch (error) {
        console.error('Error sending invoice:', error);
        this.showNotification(
            `Error sending invoice: ${error.message}`,
            'error'
        );
    } finally {
        // Restore button
        const btn = document.getElementById('send-invoice-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-envelope"></i> Send Invoice';
        }
    }
}

/**
 * Send invoice email via Firebase Function
 */
async sendInvoiceEmail(invoiceData) {
    const { getFunctions, httpsCallable } = await import(
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js'
    );
    const functions = getFunctions();
    
    // Call the email function
    const sendEmail = httpsCallable(functions, 'sendInvoiceEmail');
    
    // Format items for email
    const items = [];
    
    // Add hourly services
    if (invoiceData.services.hourly && Array.isArray(invoiceData.services.hourly)) {
        invoiceData.services.hourly.forEach(service => {
            items.push({
                description: service.description,
                quantity: service.hours,
                rate: service.rate,
                amount: service.total
            });
        });
    }
    
    // Add line items
    invoiceData.services.lineItems.forEach(item => {
        items.push({
            description: item.description,
            quantity: item.quantity,
            rate: item.price,
            amount: item.total
        });
    });
    
    const result = await sendEmail({
        customerEmail: invoiceData.customer.email,
        customerName: invoiceData.customer.name,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: this.formatDate(invoiceData.date),
        items: items,
        subtotal: invoiceData.totals.subtotal.toFixed(2),
        tax: invoiceData.totals.taxAmount.toFixed(2),
        total: invoiceData.totals.finalTotal.toFixed(2)
    });
    
    return result.data;
}
```

---

### 3. CSS Changes (invoice.css)

Add button style for the new "Send Invoice" button:

```css
.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
}

.btn-success:hover {
    background: linear-gradient(135deg, #218838 0%, #1aa179 100%);
    transform: translateY(-2px);
}
```

---

## Implementation Steps

1. ✅ **Backend Complete** - Firebase Function deployed
2. ⏳ **Frontend HTML** - Add "Send Invoice" button
3. ⏳ **Frontend JavaScript** - Add event listener and methods
4. ⏳ **Frontend CSS** - Add button styling
5. ⏳ **Test** - Send test invoice

---

## Testing Checklist

- [ ] Fill out invoice form with customer email
- [ ] Click "Preview Invoice" - should show preview
- [ ] Click "Send Invoice" - should:
  - Show loading spinner
  - Save to Firestore
  - Send email to customer
  - Show success message
  - Clear form
  - Increment invoice number
- [ ] Check customer's email inbox
- [ ] Check Firestore database for saved invoice
- [ ] Verify invoice number incremented

---

## Workflow After Implementation

```
User fills form
     ↓
Click "Preview" → Review invoice
     ↓
Click "Send Invoice" → Saves + Emails
     ↓
(Optional) Click "Print" → Print copy
```

---

## Important Notes

- **"Send Invoice" is the official action** - This saves to database and sends email
- **Preview is just for viewing** - No data saved
- **Print is optional** - For physical records
- **Invoice numbers only increment on "Send Invoice"**

---

## Ready to Implement!

All three parts ready:
1. ✅ Backend (Firebase Function) - Deployed
2. ⏳ Frontend HTML - Ready to add
3. ⏳ Frontend JavaScript - Ready to add
4. ⏳ Frontend CSS - Ready to add

**Next:** Implement frontend changes!