# 🚀 Stripe Integration - Updated Deployment Steps

**Using Modern Firebase Secrets (2026 Compatible)**

---

## ✅ What's Been Completed:

1. ✅ Firebase Functions initialized
2. ✅ Stripe SDK installed
3. ✅ Cloud Function code updated to use **modern secrets approach**

---

## 📋 Deployment Steps

Run these commands in your PowerShell terminal (where `firebase` command works):

### **Step 1: Deploy Functions (First Time)**

```bash
cd C:\Users\Reggie\Documents\git-learning-lab

firebase deploy --only functions
```

**What happens:**
- Firebase will ask you to set secret values
- It will prompt for `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- You'll enter them interactively

When prompted:
- **KEY:** Enter 
- **SECRET:** Enter `placeholder` (we'll update this after getting the real one)

---

### **Step 2: Copy Webhook URL**

After deployment, you'll see:
```
✔  functions[stripeWebhook(us-central1)]: Successful create operation.
Function URL: https://us-central1-techflow-website-2026.cloudfunctions.net/stripeWebhook
```

**Copy this webhook URL!**

---

### **Step 3: Configure Stripe Webhook**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** Paste your webhook URL:
   ```
   https://us-central1-techflow-website-2026.cloudfunctions.net/stripeWebhook
   ```
4. **Events to send:** Select:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Click **"Add endpoint"**
6. **Copy the "Signing secret"** (starts with `whsec_`)

---

### **Step 4: Update Webhook Secret**

Back in PowerShell:

```bash
# Set the real webhook secret
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# When prompted, paste your whsec_... secret

# Redeploy to use the new secret
firebase deploy --only functions
```

---

### **Step 5: Verify Deployment**

Check Firebase Console:
1. Go to: https://console.firebase.google.com/project/techflow-website-2026/functions
2. You should see two functions:
   - `createCheckoutSession`
   - `stripeWebhook`
3. Both should show "Active" status

---

## 🎯 What You'll Have After Deployment:

✅ Two Cloud Functions deployed:
- `createCheckoutSession` - Creates payment sessions
- `stripeWebhook` - Handles payment confirmations

✅ Secrets securely stored in Firebase Secret Manager

✅ Webhook configured in Stripe Dashboard

---

## 📝 Alternative: Set Secrets Manually (If Needed)

If the interactive prompt doesn't work, set secrets manually:

```bash
# Set Stripe secret key
firebase functions:secrets:set STRIPE_SECRET_KEY
# Paste: 

# Set webhook secret (use placeholder first)
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste: placeholder

# Deploy
firebase deploy --only functions

# After getting real webhook secret from Stripe, update it:
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste: whsec_YOUR_REAL_SECRET

# Redeploy
firebase deploy --only functions
```

---

## 🐛 Troubleshooting

### **"Secret not found" error**
Run:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

### **Deployment fails**
Check logs:
```bash
firebase functions:log
```

### **Webhook not receiving events**
- Verify webhook URL in Stripe Dashboard matches your deployed function URL
- Check that events are selected: `checkout.session.completed` and `checkout.session.expired`
- Test webhook in Stripe Dashboard → Send test webhook

---

## ✅ After Successful Deployment:

**Let me know when deployment is complete!** I'll then:

1. Update your frontend code (index.html and invoice.js)
2. Add the payment button to invoices
3. Show you how to test with Stripe test mode
4. Help you go live!

---

## 💡 Why This Approach is Better:

✅ **Modern & Future-proof** - Uses Firebase's current best practices
✅ **More Secure** - Secrets stored in Firebase Secret Manager
✅ **Easier Management** - Update secrets without redeploying code
✅ **No Deprecation Warnings** - Won't break in March 2026

---

**Current Status:** Ready to deploy! Run the commands above in your PowerShell terminal.

**Next Step:** After deployment, I'll update the frontend code to connect everything! 🚀