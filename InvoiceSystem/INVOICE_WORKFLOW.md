# TechFlow Solutions - Invoice Workflow Guide

## Quick Reference: How Invoices Work

### **The Complete Flow**

```
1. Fill Out Invoice Form
   ├─ Customer info (select existing or add new)
   ├─ Service details (hourly + line items)
   └─ Review totals (auto-calculated)
   
2. Preview Invoice
   ├─ Click "Preview Invoice" button
   ├─ Review formatted invoice
   └─ **NOT SAVED YET** ⚠️
   
3. Send Invoice (Critical Step!)
   ├─ Click "Send Invoice" button
   ├─ Saves to Firestore database ✅
   ├─ Gets permanent invoice number (TFS-2026-0001) ✅
   ├─ Sends email to customer ✅
   └─ Increments number for next invoice ✅
   
4. Print (Optional)
   ├─ Click "Print" button if needed
   └─ For your records or customer copy
```

---

## **Critical Understanding**

### **When Does Invoice Get Saved?**

❌ **NOT on Preview** - Just shows you what it looks like  
✅ **ONLY when you click "Send Invoice"** - This commits it to database

### **Invoice Numbering**

- **First invoice**: TFS-2026-0001
- **Second invoice**: TFS-2026-0002
- **Third invoice**: TFS-2026-0003
- Numbers increment automatically when you click "Send Invoice"

---

## **Button Functions**

### **Preview Invoice**
- **Purpose**: Check invoice before sending
- **Action**: Shows formatted preview
- **Database**: Does NOT save anything
- **Use When**: You want to review before committing

### **Send Invoice** ⭐ MAIN BUTTON
- **Purpose**: Make invoice official
- **Action**: 
  1. Saves to Firestore database
  2. Assigns permanent invoice number
  3. Sends email to customer
  4. Clears form for next invoice
- **Database**: YES - This is the official commit
- **Use When**: Invoice is correct and ready to send

### **Print**
- **Purpose**: Get physical copy
- **Action**: Opens browser print dialog
- **Database**: Does NOT save anything
- **Use When**: 
  - You need paper copy for files
  - Customer is in-person and needs printout
  - Accountant needs physical records

---

## **Common Scenarios**

### **Scenario 1: Standard Remote Job**
```
1. Select customer from dropdown
2. Select "Remote Support - $90/hour"
3. Enter hours worked (e.g., 2.5 hours)
4. Add description (e.g., "Virus removal")
5. Click "Preview Invoice"
6. Review looks good
7. Click "Send Invoice" → Saved as TFS-2026-0001
8. Customer receives email
9. Print if you want paper copy
```

### **Scenario 2: On-site with Parts**
```
1. Fill customer info
2. Select "On-site Standard - $125/hour"
3. Enter hours (e.g., 3 hours)
4. Add line item: "RAM Upgrade - 32GB" - $150
5. Add line item: "SSD 1TB" - $100
6. Click "Preview Invoice"
7. Total shows: $525 + tax
8. Click "Send Invoice" → Saved as TFS-2026-0002
9. Customer receives email
10. Print for customer if they're there
```

### **Scenario 3: Made a Mistake**
```
1. Fill out invoice
2. Click "Preview Invoice"
3. Notice mistake (wrong hours)
4. DON'T click "Send Invoice" yet
5. Click "Back to Edit" or just edit form
6. Fix the mistake
7. Click "Preview Invoice" again
8. Now it's correct
9. Click "Send Invoice" → Saved correctly
```

---

## **What Happens When You Click "Send Invoice"**

### **Behind the Scenes:**

1. **Get Last Invoice Number**
   - Checks Firestore for last invoice
   - Example: Last was TFS-2026-0042

2. **Increment Number**
   - Adds 1 to last number
   - New invoice: TFS-2026-0043

3. **Save to Database**
   - Stores complete invoice data
   - Includes customer, services, totals
   - Timestamp: When invoice was sent

4. **Send Email**
   - Uses EmailJS
   - Sends to customer's email
   - Includes invoice PDF or details

5. **Clear Form**
   - Resets all fields
   - Ready for next invoice
   - Next will be TFS-2026-0044

---

## **Important Notes**

### **Preview vs Send**
- **Preview**: Temporary view, NOT saved
- **Send**: Permanent record, saved to database

### **Invoice Numbers**
- Only increment when you click "Send Invoice"
- Cannot be changed once sent
- Sequential: 0001, 0002, 0003...

### **Printing**
- Optional step
- Can print anytime (before or after sending)
- Can also print from Invoice History later

### **Email**
- Only sent when you click "Send Invoice"
- Customer receives invoice details
- You get confirmation

---

## **Quick Checklist**

Before clicking "Send Invoice", verify:

- [ ] Customer information is correct
- [ ] Service type and hours are accurate
- [ ] All line items are listed
- [ ] Total amount looks right
- [ ] Customer email is correct (for email delivery)
- [ ] Preview looks professional

Once verified:

- [x] Click "Send Invoice"
- [x] Wait for confirmation
- [x] Print if needed for records

---

## **Troubleshooting**

### **"Invoice number stuck at TFS-2026-0001"**
**Problem**: Clicking Preview but not Send  
**Solution**: Must click "Send Invoice" to increment

### **"Customer didn't receive email"**
**Problem**: Wrong email address or email service issue  
**Solution**: Check customer email, resend from Invoice History

### **"Need to edit after sending"**
**Problem**: Invoice already in database  
**Solution**: Cannot edit sent invoices (by design for accounting)  
**Workaround**: Create new invoice with correct info, void old one

### **"Want to save without sending email"**
**Problem**: Need to save but not email yet  
**Solution**: (Future feature) Add "Save Draft" button

---

## **Button Layout (Current)**

### **While Editing:**
```
[Preview Invoice]  [Print Invoice]  [Clear Form]
```

### **Recommended Layout:**
```
[Preview Invoice]  [Clear Form]
```

### **After Preview:**
```
[← Back to Edit]  [Send Invoice]  [Print]
```

---

## **Key Takeaway**

**🎯 "Send Invoice" is the ONLY button that saves to database and makes the invoice official.**

Everything else (Preview, Print) is just for viewing and record-keeping.

---

**Last Updated**: February 22, 2026  
**Version**: 2.0 (Firebase + Stripe integrated)