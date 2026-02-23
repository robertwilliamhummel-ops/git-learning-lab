const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Define secrets (modern approach)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const zohoEmailPassword = defineSecret("ZOHO_EMAIL_PASSWORD");

admin.initializeApp();

/**
 * Create Stripe Checkout Session
 * Called from frontend when customer clicks "Pay" button
 */
exports.createCheckoutSession = onCall(
    {secrets: [stripeSecretKey]},
    async (request) => {
      // Initialize Stripe with secret
      const stripe = require("stripe")(stripeSecretKey.value());

      try {
        const {amount, invoiceNumber, customerEmail} = request.data;

        // Validate input
        if (!amount || amount <= 0) {
          throw new Error("Invalid payment amount");
        }

        if (!invoiceNumber) {
          throw new Error("Invoice number is required");
        }

        // Convert to cents (Stripe uses cents)
        const amountInCents = Math.round(amount * 100);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "cad",
                product_data: {
                  name: `Invoice ${invoiceNumber}`,
                  description:
                    "TechFlow Solutions - Website Design & IT Services",
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url:
            `${request.data.returnUrl}?session_id={CHECKOUT_SESSION_ID}` +
            `&payment=success`,
          cancel_url: `${request.data.returnUrl}?payment=cancelled`,
          customer_email: customerEmail || undefined,
          metadata: {
            invoiceNumber: invoiceNumber,
            userId: request.auth.uid,
          },
        });

        // Log payment attempt to Firestore
        await admin.firestore().collection("payment_attempts").add({
          userId: request.auth.uid,
          invoiceNumber: invoiceNumber,
          amount: amount,
          sessionId: session.id,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error(`Unable to create payment session: ${error.message}`);
      }
    },
);

/**
 * Stripe Webhook Handler
 * Listens for payment confirmations from Stripe
 */
exports.stripeWebhook = onRequest(
    {secrets: [stripeSecretKey, stripeWebhookSecret]},
    async (req, res) => {
      // Initialize Stripe with secret
      const stripe = require("stripe")(stripeSecretKey.value());
      const sig = req.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            stripeWebhookSecret.value(),
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          // Update payment attempt status
          const paymentsSnapshot = await admin.firestore()
              .collection("payment_attempts")
              .where("sessionId", "==", session.id)
              .limit(1)
              .get();

          if (!paymentsSnapshot.empty) {
            const paymentDoc = paymentsSnapshot.docs[0];
            await paymentDoc.ref.update({
              status: "completed",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              paymentIntentId: session.payment_intent,
            });

            // Update invoice status in Firestore
            const invoiceNumber = session.metadata.invoiceNumber;
            const invoicesSnapshot = await admin.firestore()
                .collection("invoices")
                .where("invoiceNumber", "==", invoiceNumber)
                .limit(1)
                .get();

            if (!invoicesSnapshot.empty) {
              const invoiceDoc = invoicesSnapshot.docs[0];
              await invoiceDoc.ref.update({
                status: "paid",
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentMethod: "stripe",
                stripeSessionId: session.id,
              });
            }
          }

          console.log(`Payment completed for session ${session.id}`);
          break;
        }

        case "checkout.session.expired": {
          const expiredSession = event.data.object;

          // Update payment attempt status
          const expiredSnapshot = await admin.firestore()
              .collection("payment_attempts")
              .where("sessionId", "==", expiredSession.id)
              .limit(1)
              .get();

          if (!expiredSnapshot.empty) {
            const paymentDoc = expiredSnapshot.docs[0];
            await paymentDoc.ref.update({
              status: "expired",
              expiredAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          console.log(`Payment session expired: ${expiredSession.id}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({received: true});
    },
);

/**
 * Send Invoice Email
 * Called from frontend when user clicks "Send Invoice"
 * Sends professional email from invoices@techflowsolutions.ca
 * with invoice details
 */
exports.sendInvoiceEmail = onCall(
    {secrets: [zohoEmailPassword, stripeSecretKey]},
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
          amount,
        } = request.data;

        // Validate input
        if (!customerEmail || !invoiceNumber) {
          throw new Error(
              "Customer email and invoice number are required",
          );
        }

        // Initialize Stripe and create payment link
        const stripe = require("stripe")(stripeSecretKey.value());
        let stripePaymentUrl = "";
        
        try {
          const amountInCents = Math.round(amount * 100);
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "cad",
                  product_data: {
                    name: `Invoice ${invoiceNumber}`,
                    description: "TechFlow Solutions - Website Design & IT Services",
                  },
                  unit_amount: amountInCents,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: "https://techflowsolutions.ca/InvoiceSystem/?payment=success",
            cancel_url: "https://techflowsolutions.ca/InvoiceSystem/?payment=cancelled",
            customer_email: customerEmail,
            metadata: {
              invoiceNumber: invoiceNumber,
              userId: request.auth.uid,
            },
          });
          
          stripePaymentUrl = session.url;
          console.log("✅ Stripe payment link created:", stripePaymentUrl);
        } catch (stripeError) {
          console.error("⚠️ Stripe link creation failed:", stripeError);
          // Continue with email even if Stripe fails
        }

        // Create email transporter using Zoho Mail (Canadian servers)
        // Must authenticate with PRIMARY account (info@) to use alias
        const transporter = nodemailer.createTransport({
          host: "smtp.zohocloud.ca",
          port: 465,
          secure: true,
          auth: {
            user: "info@techflowsolutions.ca",
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
              <td style="padding: 10px; border-bottom: 1px solid #eee;
                text-align: right;">
                ${item.quantity} × $${item.rate}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;
                text-align: right;">
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
<body style="font-family: Arial, sans-serif; line-height: 1.6;
  color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;
    padding-bottom: 20px; border-bottom: 3px solid #667eea;">
    <h1 style="color: #667eea; margin: 0; font-size: 28px;">
      TechFlow Solutions
    </h1>
    <p style="color: #666; margin: 5px 0;">Website Design & IT Services</p>
  </div>

  <!-- Invoice Info -->
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;
    margin-bottom: 30px;">
    <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">
      Invoice ${invoiceNumber}
    </h2>
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
    <p style="margin: 10px 0; font-size: 16px;">
      <strong>Subtotal:</strong> $${subtotal}
    </p>
    <p style="margin: 10px 0; font-size: 16px;">
      <strong>HST (13%):</strong> $${tax}
    </p>
    <p style="margin: 10px 0; font-size: 20px; color: #667eea;">
      <strong>Total:</strong> $${total}
    </p>
  </div>

  <!-- Payment Info -->
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;
    border-left: 4px solid #667eea; margin-bottom: 30px;">
    <h3 style="margin: 0 0 10px 0; color: #333;">Payment Information</h3>
    <p style="margin: 5px 0;">This invoice can be paid via:</p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      ${stripePaymentUrl ? `
      <li><strong>💳 Credit Card:</strong>
        <a href="${stripePaymentUrl}"
           style="display: inline-block; margin-top: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Pay $${total} with Card →
        </a>
        <br><span style="font-size: 12px; color: #666;">Secure payment powered by Stripe</span>
      </li>
      ` : '<li>Credit Card (payment link unavailable)</li>'}
      <li><strong>📧 E-Transfer:</strong> invoices@techflowsolutions.ca</li>
      <li><strong>💵 Cash or Cheque:</strong> (in person)</li>
    </ul>
    <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
      <strong>Payment due within 15 days</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px;
    border-top: 1px solid #ddd; color: #666; font-size: 14px;">
    <p style="margin: 5px 0;"><strong>TechFlow Solutions</strong></p>
    <p style="margin: 5px 0;">Greater Toronto Area</p>
    <p style="margin: 5px 0;">
      📞 (647) 572-8321 | 📧 invoices@techflowsolutions.ca
    </p>
    <p style="margin: 15px 0 5px 0;">Thank you for your business!</p>
  </div>

</body>
</html>
        `;

        // Send email
        const info = await transporter.sendMail({
          from: "TechFlow Solutions Invoices <invoices@techflowsolutions.ca>",
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
