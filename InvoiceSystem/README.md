# TechFlow Solutions - Invoice Generator

A professional cloud-powered invoice system for Website Design, Digital Growth/SEO, and Business IT Services.

---

## 🚀 Quick Start

### **First Time Setup:**
1. Open [`login.html`](login.html) in your browser
2. Login with your credentials (info@techflowsolutions.ca)
3. Start creating invoices!

### **Daily Use:**
1. Open [`index.html`](index.html) - you'll auto-redirect to login if needed
2. Create invoices for your services
3. Print or save as PDF

---

## ✨ Features

### 🔐 **Secure Authentication**
- Firebase email/password login
- Auto-redirect to login when not authenticated
- Password reset functionality
- Logout button in header

### ☁️ **Cloud Database (Firestore)**
- Customer data synced across devices
- Automatic backups
- Never lose data
- Access from any computer

### 💼 **Modern Service Types**
**Website Design & Development** - $100/hour
- Custom Website Design
- Website Development & Redesign
- E-commerce Development
- Website Maintenance
- Content Management
- And 7 more...

**Digital Growth & SEO** - $100/hour
- SEO Audit & Analysis
- Technical SEO Optimization
- Keyword Research & Strategy
- Content Optimization
- Local SEO Management
- And 7 more...

**Business IT Services** - $90-175/hour
- Remote IT Support ($90/hour)
- On-Site IT Support ($100/hour)
- Business-Critical Support ($175/hour - priority/after-hours)
- Network Setup & Configuration
- Cloud Migration & Setup
- And 7 more...

### 📄 **Invoice Features**
- Multiple hourly services per invoice
- Custom line items for projects/packages
- Optional HST (13%) calculation
- Auto-generated invoice numbers (TFS-2026-XXXX)
- Professional print layout with TechFlow logo
- Real-time calculations

---

## 📖 How to Use

### **1. Login**
- Open [`login.html`](login.html)
- Enter your email and password
- Click "Sign In"

### **2. Customer Information**
- Select existing customer from dropdown, OR
- Click "New Customer" to start fresh
- Fill in Name and Phone (required)
- Add Company, Email, Address (optional)
- Click "Save Customer" to store in cloud

### **3. Invoice Details**
- Invoice number auto-generates
- Set date (defaults to today)
- Check "Charge HST" if you're HST registered

### **4. Add Services**

#### **Hourly Services:**
- Click "Add Hourly Service"
- Select service type (Website Design, SEO, IT Support, etc.)
- Choose specific service description
- Enter hours worked (e.g., 2.5)
- Rate auto-fills based on service type
- Add multiple services if needed

#### **Custom Line Items:**
- Click "Add Line Item"
- Enter description (e.g., "Professional Website Package")
- Set quantity and price
- Use for flat-rate projects, travel fees, etc.

### **5. Generate Invoice**
- Click "Preview Invoice" to see formatted invoice
- Click "Print Invoice" to print or save as PDF
- Click "Clear Form" to start new invoice

---

## 📁 File Structure

```
InvoiceSystem/
├── index.html                    # Main invoice generator
├── login.html                    # Authentication page
├── test-firebase.html            # Firebase connection tester
│
├── css/
│   └── invoice.css               # Blue/purple gradient styling
│
├── js/
│   ├── firebase-config.js        # Firebase configuration
│   ├── firestore-manager.js      # Database operations
│   ├── customer.js               # Customer management
│   ├── calculator.js             # Invoice calculations
│   └── invoice.js                # Invoice generation
│
├── archive/                      # Old documentation
└── README.md                     # This file
```

---

## 🔧 Technical Details

### **Firebase Configuration**
- **Project**: techflow-website-2026
- **Authentication**: Email/Password
- **Database**: Cloud Firestore
- **Hosting**: Firebase Hosting ready

### **Browser Compatibility**
- Chrome, Firefox, Safari, Edge (all modern browsers)
- Requires JavaScript enabled
- Internet connection required (cloud-based)

### **Data Storage**
- Customer data: Firestore Cloud Database
- Invoice records: Firestore Cloud Database
- User authentication: Firebase Auth
- All data backed up automatically

### **Security**
- Login required to access invoice system
- Data isolated per user account
- Firestore security rules enforce access control
- API keys are safe to expose (public by design)

---

## 💰 Current Pricing (2026)

### **Hourly Rates:**
- Website Design & Development: $100/hour
- Digital Growth & SEO: $100/hour
- Remote IT Support: $90/hour
- On-Site IT Support: $100/hour
- Business-Critical Support: $175/hour
- Emergency/Rush Service: $120/hour

### **Project Packages:**
(Add as custom line items)
- Starter Website: $1,500
- Professional Website: $2,500
- Enterprise Website: $4,000+
- SEO Audit: $800-1,200
- Monthly SEO Plans: $600-2,500/month

### **HST/Tax:**
- Optional 13% HST
- Only charge if you're HST registered
- Checkbox in invoice form to enable/disable

---

## 📞 Business Information

**Company:** TechFlow Solutions  
**Services:** Website Design & IT Services  
**Phone:** (647) 572-8341  
**Email:** rob@techflowsolutions.ca  
**Website:** https://techflowsolutions.ca  
**Location:** Greater Toronto Area

---

## 🎯 Usage Tips

1. **Save Customers**: Always save customer info for faster future invoicing
2. **Multiple Services**: Add multiple hourly services to one invoice
3. **Project Pricing**: Use custom line items for flat-rate projects
4. **Travel Fees**: Add as custom line item (e.g., "$50 - Travel Fee")
5. **Print to PDF**: Use browser's "Print to PDF" to save digital copies
6. **HST Toggle**: Only check HST box if you're registered for HST

---

## 🐛 Troubleshooting

### **Can't Login:**
- Check email/password spelling
- Use "Forgot password" link to reset
- Ensure internet connection is active

### **Invoice Not Saving:**
- Check internet connection
- Ensure you're logged in
- Check Firebase Console for database status

### **Print Issues:**
- Click "Preview Invoice" first
- Try "Print to PDF" instead of physical printer
- Check browser print settings

### **Calculator Not Working:**
- Refresh the page
- Ensure all required fields are filled
- Check browser console for errors (F12)

---

## 📚 Additional Documentation

- [`FIREBASE_INTEGRATION_GUIDE.md`](FIREBASE_INTEGRATION_GUIDE.md) - Complete Firebase setup guide
- [`PORTABLE_PRINTER_GUIDE.md`](PORTABLE_PRINTER_GUIDE.md) - Mobile printer setup for on-site invoicing
- [`archive/`](archive/) - Old planning documents and summaries

---

## 🔄 Version History

**v2.0 (Current)** - February 2026
- ✅ Firebase Authentication & Firestore Database
- ✅ Updated to Website Design & IT Services
- ✅ Multiple hourly services per invoice
- ✅ Modern pricing ($90-175/hour)
- ✅ Blue/purple gradient branding
- ✅ Cloud sync across devices

**v1.0** - 2024
- PC Repair focus ($80-110/hour)
- localStorage only
- Single hourly service per invoice

---

## 🆘 Support

For technical support or questions:
- Email: rob@techflowsolutions.ca
- Check [`FIREBASE_INTEGRATION_GUIDE.md`](FIREBASE_INTEGRATION_GUIDE.md) for setup help
- Review Firebase Console for database/auth issues

---

**TechFlow Solutions Invoice Generator v2.0**  
Built with Firebase, HTML, CSS, and JavaScript for reliable cloud operation.