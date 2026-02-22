# 🎯 Stripe Payment Integration - Complete Guide

**TechFlow Solutions - Secure Stripe Checkout with Firebase Functions**

This guide shows you how to add **secure, automatic Stripe payments** to your invoice system using Firebase Cloud Functions.

---

## 📋 What You'll Build:

**User Experience:**
1. Customer views invoice
2. Clicks "Pay $452.00 →" button
3. Redirected to Stripe checkout page
4. Pays with credit card
5. Returns to invoice system with success message

**Behind the Scenes:**
- Firebase Function creates secure checkout session
- Stripe processes payment
- Webhook confirms payment
- Invoice marked as paid in Firestore

**Time to Complete:** 1-2 hours

---

## 🚀 Step-by-Step Implementation

### **Part 1: Install Firebase CLI & Initialize Functions**

#### **Step 1: Install Firebase Tools**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to your project
cd InvoiceSystem
```

#### **Step 2: Initialize Cloud Functions**

```bash
# Initialize Firebase Functions
firebase init functions

# Select:
# - Use existing project: techflow-website-2026
# - Language: JavaScript
# - ESLint: Yes
# - Install dependencies: Yes
```

This creates:
```
InvoiceSystem/
├── functions/
│   ├── index.js          # Your Cloud Functions
│   ├── package.json      # Dependencies
│   └── .gitignore
```

---

### **Part 2: Install Stripe in Cloud Functions**

```bash
# Navigate to functions folder
cd functions

# Install Stripe SDK
npm install stripe

# Go back to InvoiceSystem root
cd ..
```

---

### **Part 3: Create Cloud Function for Stripe Checkout**

Edit `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

/**
 * Create Stripe Checkout Session
 * Called from frontend when customer clicks "Pay" button
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to create payment session'
        );
    }

    try {
        const { amount, invoiceNumber, customerEmail, customerName } = data;

        // Validate input
        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid payment amount'
            );
        }

        if (!invoiceNumber) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invoice number is required'
            );
        }

        // Convert to cents (Stripe uses cents)
        const amountInCents = Math.round(amount * 100);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `Invoice ${invoiceNumber}`,
                            description: 'TechFlow Solutions - Website Design & IT Services',
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${data.returnUrl}?payment=cancelled`,
            customer_email: customerEmail || undefined,
            metadata: {
                invoiceNumber: invoiceNumber,
                userId: context.auth.uid,
            },
        });

        // Log payment attempt to Firestore
        await admin.firestore().collection('payment_attempts').add({
            userId: context.auth.uid,
            invoiceNumber: invoiceNumber,
            amount: amount,
            sessionId: session.id,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Unable to create payment session',
            error.message
        );
    }
});

/**
 * Stripe Webhook Handler
 * Listens for payment confirmations from Stripe
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            // Update payment attempt status
            const paymentsSnapshot = await admin.firestore()
                .collection('payment_attempts')
                .where('sessionId', '==', session.id)
                .limit(1)
                .get();

            if (!paymentsSnapshot.empty) {
                const paymentDoc = paymentsSnapshot.docs[0];
                await paymentDoc.ref.update({
                    status: 'completed',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    paymentIntentId: session.payment_intent,
                });

                // Update invoice status in Firestore
                const invoiceNumber = session.metadata.invoiceNumber;
                const invoicesSnapshot = await admin.firestore()
                    .collection('invoices')
                    .where('invoiceNumber', '==', invoiceNumber)
                    .limit(1)
                    .get();

                if (!invoicesSnapshot.empty) {
                    const invoiceDoc = invoicesSnapshot.docs[0];
                    await invoiceDoc.ref.update({
                        status: 'paid',
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        paymentMethod: 'stripe',
                        stripeSessionId: session.id,
                    });
                }
            }

            console.log(`Payment completed for session ${session.id}`);
            break;

        case 'checkout.session.expired':
            const expiredSession = event.data.object;
            
            // Update payment attempt status
            const expiredSnapshot = await admin.firestore()
                .collection('payment_attempts')
                .where('sessionId', '==', expiredSession.id)
                .limit(1)
                .get();

            if (!expiredSnapshot.empty) {
                const paymentDoc = expiredSnapshot.docs[0];
                await paymentDoc.ref.update({
                    status: 'expired',
                    expiredAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            console.log(`Payment session expired: ${expiredSession.id}`);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});
```

---

### **Part 4: Configure Stripe Secret Keys**

**IMPORTANT:** Store secret keys securely using Firebase config (NOT in code!)

```bash
# Set your Stripe secret key (the one you posted earlier)
firebase functions:config:set stripe.secret_key=""

# Set webhook secret (get this in next step)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
```

**To get webhook secret:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://us-central1-techflow-website-2026.cloudfunctions.net/stripeWebhook`
4. Events to send: Select `checkout.session.completed` and `checkout.session.expired`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Run the webhook_secret command above with your secret

---

### **Part 5: Deploy Cloud Functions**

```bash
# Deploy functions to Firebase
firebase deploy --only functions

# This will output URLs like:
# ✔ functions[createCheckoutSession]: Successful create operation.
# ✔ functions[stripeWebhook]: Successful create operation.
```

---

### **Part 6: Update Frontend Code**

#### **File 1: Update `index.html`**

Add Firebase Functions SDK before closing `</body>` tag:

```html
<!-- Firebase Functions SDK -->
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js"></script>

<!-- Stripe Payment Handler -->
<script>
    // Initialize Firebase Functions
    const functions = getFunctions(firebase.app());
    
    // Payment function
    window.payWithStripe = async function(amount, invoiceNumber, customerEmail, customerName) {
        try {
            // Show loading state
            const button = event.target;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Call Cloud Function to create checkout session
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
            const result = await createCheckoutSession({
                amount: amount,
                invoiceNumber: invoiceNumber,
                customerEmail: customerEmail,
                customerName: customerName,
                returnUrl: window.location.origin + window.location.pathname
            });
            
            // Redirect to Stripe Checkout
            window.location.href = result.data.url;
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Unable to process payment: ' + error.message);
            
            // Reset button
            button.disabled = false;
            button.innerHTML = 'Pay $' + amount.toFixed(2) + ' →';
        }
    };
    
    // Check for payment success/cancellation on page load
    window.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const payment = urlParams.get('payment');
        
        if (payment === 'success') {
            alert('✅ Payment successful! Thank you for your payment.');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (payment === 'cancelled') {
            alert('❌ Payment cancelled. Please try again or use E-Transfer.');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
</script>
```

#### **File 2: Update `js/invoice.js` (Lines 301-309)**

Replace the credit card section:

```javascript
<!-- Credit Card (Second) -->
<div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #667eea;">
    <div style="color: #667eea; font-weight: bold; font-size: 14px; margin-bottom: 8px;">💳 Credit Card</div>
    <button onclick="window.payWithStripe(${totals.finalTotal}, '${invoiceData.number}', '${customer.email || ''}', '${customer.name}')"
           style="display: block; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; text-align: center; border: none; border-radius: 4px; font-weight: bold; font-size: 14px; cursor: pointer;">
        Pay ${this.formatCurrency(totals.finalTotal)} →
    </button>
    <p style="font-size: 10px; color: #666; text-align: center; margin: 6px 0 0 0;">Secure payment powered by Stripe</p>
</div>
```

---

### **Part 7: Test the Integration**

#### **Test Mode First:**

1. Switch Stripe to test mode in Dashboard
2. Get test secret key (starts with `sk_test_`)
3. Update Firebase config:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_YOUR_TEST_KEY"
   firebase deploy --only functions
   ```
4. Use test card: `4242 4242 4242 4242`
5. Any future expiry date
6. Any 3-digit CVC

#### **Test Flow:**
1. Create an invoice in your system
2. Click "Preview Invoice"
3. Click "Pay $XXX →" button
4. Should redirect to Stripe checkout
5. Enter test card details
6. Complete payment
7. Should redirect back with success message

#### **Verify:**
- Check Stripe Dashboard → Payments (should see test payment)
- Check Firestore → payment_attempts (should see record)
- Check Firestore → invoices (status should be 'paid')

---

### **Part 8: Go Live**

Once testing is complete:

1. Switch Firebase config to live keys:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_51T3hYq..."
   firebase deploy --only functions
   ```

2. Update webhook endpoint in Stripe Dashboard to use production URL

3. Test with real card (small amount first!)

4. You're live! 🎉

---

## 📊 Cost Breakdown

### **Stripe Fees:**
- 2.9% + $0.30 per transaction
- Example: $500 invoice = $14.80 fee
- You keep: $485.20

### **Firebase Costs:**
- Cloud Functions: Free tier = 2M invocations/month
- Your usage: ~2 functions per payment
- Estimated cost: $0 (well within free tier)

### **Total Monthly Cost:**
- Firebase: $0
- Stripe: Only pay per transaction (2.9% + $0.30)

---

## 🔒 Security Features

### **What Makes This Secure:**
- ✅ Secret key stored in Firebase config (not in code)
- ✅ Payment processing on server-side (Cloud Functions)
- ✅ User authentication required
- ✅ Webhook signature verification
- ✅ PCI compliant (Stripe handles card data)
- ✅ No card numbers ever touch your server

### **What's Protected:**
- Customer credit card information
- Payment processing logic
- Stripe API keys
- Transaction verification

---

## 📝 Files Modified Summary

### **New Files:**
- `functions/index.js` - Cloud Functions code
- `functions/package.json` - Dependencies
- `STRIPE_INTEGRATION_GUIDE.md` - This file

### **Modified Files:**
- `index.html` - Added Firebase Functions SDK & payment handler
- `js/invoice.js` - Updated payment button (line 303)

### **Firebase Config:**
- Stripe secret key
- Stripe webhook secret

---

## 🎯 Testing Checklist

Before going live, test:

- [ ] Create invoice
- [ ] Click payment button
- [ ] Redirects to Stripe
- [ ] Complete payment with test card
- [ ] Redirects back with success message
- [ ] Payment recorded in Stripe Dashboard
- [ ] Payment attempt logged in Firestore
- [ ] Invoice status updated to 'paid'
- [ ] Webhook receives confirmation
- [ ] Error handling works (cancelled payment)

---

## 🐛 Troubleshooting

### **"Unable to create payment session"**
- Check Firebase Functions logs: `firebase functions:log`
- Verify secret key is set: `firebase functions:config:get`
- Ensure user is logged in

### **Webhook not receiving events**
- Verify webhook URL in Stripe Dashboard
- Check webhook secret is correct
- Test webhook: Stripe Dashboard → Webhooks → Send test webhook

### **Payment successful but invoice not updating**
- Check Firestore security rules
- Verify invoice number matches
- Check Firebase Functions logs

---

## 💡 Next Steps

### **Phase 1: Basic (Complete after this guide)**
- ✅ Accept credit card payments
- ✅ Automatic invoice status updates
- ✅ Secure payment processing

### **Phase 2: Enhanced (Optional)**
- Send email receipts after payment
- Add payment history page
- Support partial payments
- Add refund functionality

### **Phase 3: Advanced (Future)**
- Subscription billing for monthly clients
- Automated payment reminders
- Multi-currency support
- Payment analytics dashboard

---

## 📞 Support

If you get stuck:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check Stripe Dashboard → Developers → Logs
3. Test in test mode first
4. Review this guide step-by-step

---

**Ready to implement? Start with Part 1 and work through each step carefully!**

**Estimated time: 1-2 hours for complete setup**

**Result: Fully automated, secure credit card payments! 🚀**