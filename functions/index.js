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
 * Generate Puppeteer header template for repeating headers
 */
function generateHeaderTemplate(invoiceNumber) {
  return `
    <div style="width:100%; box-sizing:border-box; padding: 16px 40px 0 40px;
                font-family: Arial, sans-serif; -webkit-print-color-adjust: exact;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:18px; font-weight:bold; color:#667eea; margin-bottom:3px;">
              TechFlow Solutions
            </div>
            <div style="font-size:11px; color:#718096;">Website Design &amp; IT Services</div>
            <div style="font-size:11px; color:#718096;">Greater Toronto Area</div>
          </td>
          <td style="vertical-align:top; text-align:right;">
            <img src="https://techflowsolutions.ca/assets/images/TechFlow%20Solutions%20Logo-%20Cropped.png"
                 style="height:50px; width:auto;" />
          </td>
        </tr>
      </table>
      <div style="border-bottom:3px solid #667eea; margin-top:10px;"></div>
    </div>
  `;
}

/**
 * Generate PDF using Cloud Run service
 */
async function generatePDFViaCloudRun(invoiceHTML, invoiceNumber, headerTemplate) {
  const CLOUD_RUN_URL = "https://pdf-service-904705508663.us-central1.run.app/pdf";
  
  try {
    console.log("📄 Calling Cloud Run PDF service...");
    
    const response = await fetch(CLOUD_RUN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: invoiceHTML,
        filename: `Invoice-${invoiceNumber}.pdf`,
        headerTemplate: headerTemplate,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloud Run returned ${response.status}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log("✅ PDF received from Cloud Run");
    
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Cloud Run PDF generation failed:", error);
    throw error;
  }
}

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
 * Generate PDF HTML (matches preview layout exactly)
 * This creates a standalone HTML document with inline styles for PDF generation
 */
function generatePDFHTML(items, customerName, invoiceNumber, invoiceDate, subtotal, tax, total) {
  // Format items for table
  let itemsHTML = "";
  if (items && items.length > 0) {
    itemsHTML = items.map((item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.rate}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.amount}</td>
      </tr>
    `).join("");
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      margin: 0;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea;">
      <div>
        <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">TechFlow Solutions</div>
        <div style="font-size: 14px; color: #718096;">Website Design & IT Services</div>
        <div style="font-size: 14px; color: #718096;">Greater Toronto Area</div>
        <div style="font-size: 14px; color: #718096;">Phone: (647) 572-8341</div>
        <div style="font-size: 14px; color: #718096;">Email: info@techflowsolutions.ca</div>
      </div>
      <div style="text-align: right;">
        <img src="https://techflowsolutions.ca/assets/images/TechFlow%20Solutions%20Logo-%20Cropped.png" alt="TechFlow Solutions" style="max-width: 150px; height: auto;">
      </div>
    </div>

    <!-- Invoice Details -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div style="flex: 1;">
        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">Bill To:</h3>
        <strong>${customerName}</strong>
      </div>
      <div style="flex: 1; text-align: right;">
        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">Invoice Details:</h3>
        <strong>Invoice #:</strong> ${invoiceNumber}<br>
        <strong>Date:</strong> ${invoiceDate}
      </div>
    </div>

    <!-- Services Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <th style="padding: 12px; text-align: left; font-weight: 600;">Description</th>
          <th style="padding: 12px; text-align: right; font-weight: 600;">Qty/Hours</th>
          <th style="padding: 12px; text-align: right; font-weight: 600;">Rate/Price</th>
          <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table style="width: 100%; max-width: 300px; margin-left: auto; margin-bottom: 30px;">
      <tr>
        <td style="padding: 8px 0; text-align: right;">Subtotal:</td>
        <td style="padding: 8px 0; text-align: right; padding-left: 20px;">$${subtotal}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; text-align: right;">HST (13%):</td>
        <td style="padding: 8px 0; text-align: right; padding-left: 20px;">$${tax}</td>
      </tr>
      <tr style="border-top: 2px solid #667eea;">
        <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
        <td style="padding: 12px 0; text-align: right; padding-left: 20px; font-weight: bold; font-size: 18px; color: #667eea;">$${total}</td>
      </tr>
    </table>

    <!-- Payment Information (Compact - matches preview) -->
    <div style="margin: 20px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
      <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 16px;">Payment Information</h3>
      
      <p style="margin: 8px 0; font-size: 13px; line-height: 1.5;">
        <strong>E-Transfer (Preferred):</strong> invoices@techflowsolutions.ca<br>
        <strong>Credit Card:</strong> See email for secure payment link<br>
        <strong>Cash/Cheque:</strong> Accepted in person
      </p>
      
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 8px;">
        <strong>Payment due within 15 days</strong> • Questions? (647) 572-8341
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

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
      <li><strong>📧 E-Transfer (Preferred):</strong> invoices@techflowsolutions.ca</li>
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
      📞 (647) 572-8341 | 📧 invoices@techflowsolutions.ca
    </p>
    <p style="margin: 15px 0 5px 0;">Thank you for your business!</p>
  </div>

</body>
</html>
        `;

        // Create PDF-optimized HTML (matches preview layout exactly)
        const pdfHTML = generatePDFHTML(items, customerName, invoiceNumber, invoiceDate, subtotal, tax, total);

        // Try to generate PDF using Cloud Run
        let pdfBuffer = null;
        try {
          console.log("📄 Attempting to generate PDF via Cloud Run...");
          pdfBuffer = await generatePDFViaCloudRun(pdfHTML, invoiceNumber, generateHeaderTemplate(invoiceNumber));
          console.log("✅ PDF generated successfully");
        } catch (pdfError) {
          console.error("⚠️ PDF generation failed, will send email without PDF:", pdfError);
          // Continue with email even if PDF fails
        }

        // Send email with or without PDF attachment
        const mailOptions = {
          from: "TechFlow Solutions Invoices <invoices@techflowsolutions.ca>",
          to: customerEmail,
          subject: `Invoice ${invoiceNumber} from TechFlow Solutions`,
          html: emailHTML,
        };

        // Add PDF attachment if generation succeeded
        if (pdfBuffer) {
          mailOptions.attachments = [
            {
              filename: `Invoice-${invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ];
        }

        const info = await transporter.sendMail(mailOptions);

        if (pdfBuffer) {
          console.log(`✅ Invoice email sent with PDF attachment: ${info.messageId}`);
        } else {
          console.log(`✅ Invoice email sent (without PDF): ${info.messageId}`);
        }

        return {
          success: true,
          messageId: info.messageId,
          pdfAttached: !!pdfBuffer,
        };
      } catch (error) {
        console.error("Error sending invoice email:", error);
        throw new Error(`Unable to send email: ${error.message}`);
      }
    },
);
