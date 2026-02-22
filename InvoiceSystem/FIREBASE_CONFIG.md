# TechFlow Solutions - Firebase Configuration

**Project Created**: February 22, 2026  
**Firebase Project**: techflow-website-2026

---

## 🔑 Your Firebase Configuration

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAXjjNSClbsrtmMAbB_KuOEX8EnOn5N_0k",
  authDomain: "techflow-website-2026.firebaseapp.com",
  projectId: "techflow-website-2026",
  storageBucket: "techflow-website-2026.firebasestorage.app",
  messagingSenderId: "904705508663",
  appId: "1:904705508663:web:f1847a3d6d86abaa5e46b2"
};
```

---

## 📋 Project Details

- **Project Name**: techflow-website-2026
- **Project ID**: techflow-website-2026
- **App Name**: TechFlow Invoice Generator (Web)
- **Region**: us-east1 (closest to Toronto)

---

## ✅ Setup Progress

### Part 1: Firebase Project Setup
- [x] **Step 1.1**: Create Firebase Project ✅
- [x] **Step 1.2**: Register Web App ✅
- [ ] **Step 1.3**: Enable Authentication (Next step!)
- [ ] **Step 1.4**: Enable Firestore Database

### Part 2: Authentication Setup
- [ ] Create login.html page
- [ ] Create first user account
- [ ] Add auth check to index.html

### Part 3: Firestore Database
- [ ] Create firebase-config.js
- [ ] Create firestore-manager.js
- [ ] Update customer.js to use Firestore
- [ ] Update invoice.js to use Firestore

### Part 4: Stripe Integration
- [ ] Create Stripe account
- [ ] Get payment links
- [ ] Add to invoices

### Part 5: Automated Emails
- [ ] Set up Cloud Functions
- [ ] Create email templates
- [ ] Test email sending

### Part 6: GitHub Pages Deployment
- [ ] Deploy to GitHub Pages
- [ ] Test live site

---

## 🚀 Next Steps

### **Right Now: Enable Authentication**

1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"** button
3. Click **"Email/Password"** sign-in method
4. **Toggle ON** the switch
5. Click **"Save"**

### **Then: Enable Firestore Database**

1. In sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose location: **"us-east1"**
5. Click **"Enable"**

---

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com/project/techflow-website-2026
- **Authentication**: https://console.firebase.google.com/project/techflow-website-2026/authentication
- **Firestore**: https://console.firebase.google.com/project/techflow-website-2026/firestore
- **Hosting**: https://console.firebase.google.com/project/techflow-website-2026/hosting

---

## 📝 Notes

- **Security**: These API keys are safe to expose in client-side code (they're meant to be public)
- **Firebase Hosting**: Already set up when you registered the web app
- **Test Mode**: Database starts in test mode (open access) - we'll secure it later
- **Free Tier**: Firebase Spark plan is completely free for small projects

---

## 🔒 Important Security Notes

1. **API Keys**: Safe to commit to GitHub (they identify your project, not authenticate it)
2. **Authentication**: Required before accessing Firestore data
3. **Firestore Rules**: Will be configured to restrict access to authenticated users only
4. **Email/Password**: Only you can create accounts (no public registration)

---

**Last Updated**: February 22, 2026  
**Status**: Configuration saved, ready for Step 1.3 (Enable Authentication)