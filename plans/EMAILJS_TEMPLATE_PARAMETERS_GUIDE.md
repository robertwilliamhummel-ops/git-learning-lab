# EmailJS Template Parameters Guide

Complete reference for all EmailJS implementations across TechFlow Solutions website.

## EmailJS Configuration

**Account:** rob@techflowsolutions.ca  
**Public Key:** `QPLcDCj74Fq0lTwK-`  
**Service ID:** `service_fpx3i2b`  
**Template ID:** `template_dwmz48t` (used by all 4 forms)

---

## 1. Booking System (booking.html)

**Form ID:** Multi-step booking wizard  
**Location:** [`booking.html:1204`](booking.html:1204)  
**Form Type:** "Booking Request"

### Template Parameters Sent:
```javascript
{
    to_email: 'rob@techflowsolutions.ca',           // Recipient
    from_name: [Customer Full Name],                 // From booking form
    from_email: [Customer Email],                    // From booking form
    phone: [Customer Phone],                         // From booking form
    postal_code: [Customer Postal Code],             // From booking form
    service: [Selected Service Name],                // e.g., "Virus Removal"
    urgency: [Urgency Level],                        // "Standard" or "Urgent"
    preferred_date: [Customer's Preferred Date],     // From booking form
    preferred_time: [Customer's Preferred Time],     // From booking form
    issue_description: [Description or 'Not provided'], // From booking form
    estimated_total: [Price with $ symbol],          // e.g., "$89"
    confirmation_number: [Generated Number],         // e.g., "TF-2026-ABC123"
    submission_date: [Current Date/Time]             // Auto-generated
}
```

### EmailJS Template Variables Needed:
- `{{to_email}}`
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{postal_code}}`
- `{{service}}`
- `{{urgency}}`
- `{{preferred_date}}`
- `{{preferred_time}}`
- `{{issue_description}}`
- `{{estimated_total}}`
- `{{confirmation_number}}`
- `{{submission_date}}`

---

## 2. SEO Services Form (seo-services.html)

**Form ID:** `seoAuditForm`  
**Location:** [`seo-services.html:1410`](seo-services.html:1410)  
**Form Type:** "SEO Audit Request"

### Template Parameters Sent:
```javascript
{
    to_email: 'rob@techflowsolutions.ca',           // Recipient
    from_name: [Customer Name],                      // From form field: name
    from_email: [Customer Email],                    // From form field: email
    phone: [Phone or 'Not provided'],                // From form field: phone
    company: [Company or 'Not provided'],            // From form field: company
    website: [Website URL],                          // From form field: website
    business_type: [Type or 'Not specified'],        // From form field: business_type
    current_marketing: [Marketing or 'Not provided'], // From form field: current_marketing
    goals: [SEO Goals],                              // From form field: goals
    form_type: 'SEO Audit Request',                  // Fixed value
    submission_date: [Current Date/Time]             // Auto-generated
}
```

### EmailJS Template Variables Needed:
- `{{to_email}}`
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{company}}`
- `{{website}}`
- `{{business_type}}`
- `{{current_marketing}}`
- `{{goals}}`
- `{{form_type}}`
- `{{submission_date}}`

---

## 3. Website Design Form (website-design.html)

**Form ID:** `websiteQuoteForm`  
**Location:** [`website-design.html:1309`](website-design.html:1309)  
**Form Type:** "Website Quote Request"

### Template Parameters Sent:
```javascript
{
    to_email: 'rob@techflowsolutions.ca',           // Recipient
    from_name: [Customer Name],                      // From form field: name
    from_email: [Customer Email],                    // From form field: email
    phone: [Phone or 'Not provided'],                // From form field: phone
    company: [Company or 'Not provided'],            // From form field: company
    website_type: [Type of Website],                 // From form field: website_type
    budget: [Budget Range],                          // From form field: budget
    message: [Project Details],                      // From form field: message
    form_type: 'Website Quote Request',              // Fixed value
    submission_date: [Current Date/Time]             // Auto-generated
}
```

### EmailJS Template Variables Needed:
- `{{to_email}}`
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{company}}`
- `{{website_type}}`
- `{{budget}}`
- `{{message}}`
- `{{form_type}}`
- `{{submission_date}}`

---

## 4. Contact Form (contact.html)

**Form ID:** `contact-form`  
**Location:** [`contact.html:1234`](contact.html:1234)  
**Form Type:** "Contact Form"

### Template Parameters Sent:
```javascript
{
    to_email: 'rob@techflowsolutions.ca',           // Recipient
    from_name: [Customer Name],                      // From form field: name
    from_email: [Customer Email],                    // From form field: email
    phone: [Phone or 'Not provided'],                // From form field: phone
    service_type: [Type or 'Not specified'],         // From form field: serviceType
    message: [Customer Message],                     // From form field: message
    form_type: 'Contact Form',                       // Fixed value
    submission_date: [Current Date/Time]             // Auto-generated
}
```

### EmailJS Template Variables Needed:
- `{{to_email}}`
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{service_type}}`
- `{{message}}`
- `{{form_type}}`
- `{{submission_date}}`

---

## Complete EmailJS Template Variable List

To ensure all 4 forms work correctly, your EmailJS template (`template_dwmz48t`) should include these variables:

### Common Variables (All Forms):
- `{{to_email}}` - Recipient email (always rob@techflowsolutions.ca)
- `{{from_name}}` - Customer name
- `{{from_email}}` - Customer email
- `{{phone}}` - Customer phone
- `{{form_type}}` - Which form was submitted
- `{{submission_date}}` - When submitted

### Booking-Specific:
- `{{postal_code}}`
- `{{service}}`
- `{{urgency}}`
- `{{preferred_date}}`
- `{{preferred_time}}`
- `{{issue_description}}`
- `{{estimated_total}}`
- `{{confirmation_number}}`

### SEO Form-Specific:
- `{{company}}`
- `{{website}}`
- `{{business_type}}`
- `{{current_marketing}}`
- `{{goals}}`

### Website Design Form-Specific:
- `{{company}}`
- `{{website_type}}`
- `{{budget}}`
- `{{message}}`

### Contact Form-Specific:
- `{{service_type}}`
- `{{message}}`

---

## How to Set Up EmailJS Template

### Step 1: Login to EmailJS
1. Go to https://www.emailjs.com/
2. Login with rob@techflowsolutions.ca account

### Step 2: Edit Template
1. Navigate to Email Templates
2. Find template `template_dwmz48t`
3. Click Edit

### Step 3: Template Structure

**Recommended Email Template:**

```
Subject: {{form_type}} - {{from_name}}

From: {{from_name}} ({{from_email}})
Phone: {{phone}}
Form Type: {{form_type}}
Submitted: {{submission_date}}

---

BOOKING DETAILS (if applicable):
Service: {{service}}
Urgency: {{urgency}}
Preferred Date: {{preferred_date}}
Preferred Time: {{preferred_time}}
Postal Code: {{postal_code}}
Estimated Total: {{estimated_total}}
Confirmation #: {{confirmation_number}}
Issue Description: {{issue_description}}

---

SEO AUDIT REQUEST (if applicable):
Company: {{company}}
Website: {{website}}
Business Type: {{business_type}}
Current Marketing: {{current_marketing}}
Goals: {{goals}}

---

WEBSITE QUOTE REQUEST (if applicable):
Company: {{company}}
Website Type: {{website_type}}
Budget: {{budget}}
Project Details: {{message}}

---

CONTACT INQUIRY (if applicable):
Service Type: {{service_type}}
Message: {{message}}

---

Reply to: {{from_email}}
```

### Step 4: Save Template
Click "Save" to update the template

---

## Testing Checklist

After setting up the EmailJS template, test each form:

- [ ] **Booking System** - Submit a test booking, verify all booking fields appear in email
- [ ] **SEO Services Form** - Submit test audit request, verify SEO fields appear
- [ ] **Website Design Form** - Submit test quote, verify website fields appear
- [ ] **Contact Form** - Submit test inquiry, verify contact fields appear

---

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify EmailJS service is active
3. Check EmailJS dashboard for delivery logs
4. Confirm `to_email` is set to rob@techflowsolutions.ca

### Missing Fields in Email
1. Check template includes all variables listed above
2. Verify variable names match exactly (case-sensitive)
3. Use `{{variable || 'Not provided'}}` for optional fields

### Form Submission Fails
1. Check browser console for errors
2. Verify EmailJS public key is correct
3. Confirm service ID and template ID match
4. Check network tab for API responses

---

## Notes

- All 4 forms use the **SAME template** (`template_dwmz48t`)
- Template must handle all possible variables from all forms
- Optional variables should have fallback text
- `form_type` parameter helps identify which form was submitted
- All emails go to rob@techflowsolutions.ca
- No automated customer confirmation emails (manual follow-up only)

---

**Last Updated:** 2026-02-15  
**Maintained By:** TechFlow Solutions