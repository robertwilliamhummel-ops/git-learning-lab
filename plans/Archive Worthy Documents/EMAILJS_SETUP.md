# EmailJS Setup Instructions

To enable email functionality for your booking and contact forms, follow these steps:

## 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your **Service ID** (e.g., "service_abc123")

## 3. Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

### Template for Contact/Booking Forms:
```
Subject: New {{form_type}} from TechFlow Solutions Website

From: {{firstName}} {{lastName}}
Email: {{email}}
Phone: {{phone}}
Service Type: {{serviceType}}
Location: {{location}}
Urgency: {{urgency}}
Date: {{date}}
Time: {{time}}

Message:
{{message}}

---
Submitted: {{submission_date}}
Form Type: {{form_type}}
```

4. Save the template and note your **Template ID** (e.g., "template_xyz789")

## 4. Get Your Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (e.g., "user_abc123xyz")

## 5. Update Your Website
Replace these placeholders in `js/main.js`:

```javascript
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams) // Replace with your IDs
```

Example:
```javascript
emailjs.init("user_abc123xyz");
emailjs.send('service_abc123', 'template_xyz789', templateParams)
```

## 6. Test Your Forms
1. Open your website
2. Fill out the booking form or contact form
3. Submit the form
4. Check your email (rob@techflowsolutions.ca) for the message

## Free Plan Limits
- 200 emails per month
- EmailJS branding in emails
- Basic support

## Upgrade Options
- Remove branding: $15/month
- More emails: Various plans available
- Priority support

## Troubleshooting
- Check browser console for errors
- Verify all IDs are correct
- Ensure email service is properly configured
- Test with a simple form first

Your forms will now send emails directly to rob@techflowsolutions.ca!