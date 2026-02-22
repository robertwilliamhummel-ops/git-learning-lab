const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

// Define secrets (modern approach)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

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

      // Verify user is authenticated
      if (!request.auth) {
        throw new Error("User must be authenticated to create payment session");
      }

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
