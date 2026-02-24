# Cloud Run PDF Service - Complete Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions to set up a Cloud Run microservice for PDF generation that works with your Firebase invoice system.

**Cost:** FREE for low usage (a couple PDFs per year)
**Complexity:** Medium (2-3 hours to set up)
**Reliability:** High (Google-managed infrastructure)

---

## 📊 Cost Analysis

### Cloud Run Free Tier (Monthly)
- ✅ 2 million requests FREE
- ✅ 360,000 vCPU-seconds FREE  
- ✅ 360,000 GiB-seconds FREE
- ✅ 1 GB outbound data FREE

### Your Usage (Few PDFs per year)
| Resource | Usage per PDF | Annual Cost |
|----------|---------------|-------------|
| CPU | 1-3 seconds | $0.00 |
| Memory | 300 MB × 3 sec | $0.00 |
| Requests | 1 request | $0.00 |
| Bandwidth | ~200 KB | $0.00 |
| **TOTAL** | — | **$0.00** |

**You would need thousands of PDFs per month before any charges occur.**

---

## 🏗️ Architecture

```
┌─────────────────┐
│  User Creates   │
│    Invoice      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Firebase Cloud  │
│   Function      │
│ (sendInvoice)   │
└────────┬────────┘
         │
         │ HTTP POST (HTML)
         ▼
┌─────────────────┐
│  Cloud Run      │
│  PDF Service    │
│  (Puppeteer)    │
└────────┬────────┘
         │
         │ Returns PDF Buffer
         ▼
┌─────────────────┐
│ Email with PDF  │
│   Attachment    │
└─────────────────┘
```

---

## 📁 File Structure

Create a new folder in your project:

```
git-learning-lab/
├── functions/
│   └── index.js
└── pdf-service/          # NEW FOLDER
    ├── Dockerfile
    ├── package.json
    ├── index.js
    └── .dockerignore
```

---

## 🔧 Step-by-Step Implementation

### **STEP 1: Create Project Structure**

Create the pdf-service directory:

```bash
mkdir pdf-service
cd pdf-service
```

---

### **STEP 2: Create package.json**

Create `pdf-service/package.json`:

```json
{
  "name": "pdf-service",
  "version": "1.0.0",
  "description": "Cloud Run PDF generation service for TechFlow invoices",
  "main": "index.js",
  "type": "module",
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "express": "^4.18.2",
    "puppeteer": "^22.0.0"
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

---

### **STEP 3: Create Express Server**

Create `pdf-service/index.js`:

```javascript
import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8080;

// Increase payload limit for large HTML
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "healthy",
    service: "TechFlow PDF Generator",
    version: "1.0.0"
  });
});

// PDF generation endpoint
app.post("/pdf", async (req, res) => {
  try {
    const { html, filename } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    console.log("📄 Generating PDF...");
    const startTime = Date.now();

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in"
      }
    });

    await browser.close();

    const duration = Date.now() - startTime;
    console.log(`✅ PDF generated successfully in ${duration}ms`);

    // Send PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename || "invoice.pdf"}"`);
    res.send(pdf);

  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    res.status(500).json({ 
      error: "PDF generation failed",
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDF service running on port ${PORT}`);
});
```

---

### **STEP 4: Create Dockerfile**

Create `pdf-service/Dockerfile`:

```dockerfile
# Use Node.js 20 base image
FROM node:20-slim

# Install necessary packages for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Skip Chromium download, Puppeteer will use system Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install --production

# Install Chromium
RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Start the service
CMD ["node", "index.js"]
```

**Note:** This Dockerfile uses Node.js base image instead of the Puppeteer image to avoid permission issues during build.

---

### **STEP 5: Create .dockerignore**

Create `pdf-service/.dockerignore`:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
```

---

### **STEP 6: Deploy to Cloud Run**

From the `pdf-service` directory, run:

**For Windows PowerShell (single line - recommended):**
```powershell
gcloud run deploy pdf-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --cpu 1 --timeout 60 --max-instances 10
```

**For Linux/Mac (multi-line):**
```bash
gcloud run deploy pdf-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --max-instances 10
```

**Note:** Windows CMD doesn't support `\` for line continuation. Use the single-line PowerShell command above, or use the [`deploy.ps1`](../pdf-service/deploy.ps1) script.

**What this does:**
- Builds Docker image from Dockerfile
- Deploys to Cloud Run in us-central1
- Allocates 1GB memory and 1 CPU
- Allows public access (or add auth later)
- Sets 60-second timeout
- Limits to 10 concurrent instances

**After deployment, you'll get a URL like:**
```
https://pdf-service-xxxxx-uc.a.run.app
```

**Save this URL** - you'll need it in Step 7!

---

### **STEP 7: Update Firebase Function**

Modify `functions/index.js` to call the Cloud Run service.

Add this function at the top of the file:

```javascript
/**
 * Generate PDF using Cloud Run service
 */
async function generatePDFViaCloudRun(invoiceHTML, invoiceNumber) {
  const CLOUD_RUN_URL = "https://pdf-service-xxxxx-uc.a.run.app/pdf";
  
  try {
    console.log("📄 Calling Cloud Run PDF service...");
    
    const response = await fetch(CLOUD_RUN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: invoiceHTML,
        filename: `Invoice-${invoiceNumber}.pdf`
      })
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
```

Then update the email sending section (around line 517) to use this function:

```javascript
        // Try to generate PDF using Cloud Run
        let pdfBuffer = null;
        try {
          console.log("📄 Attempting to generate PDF via Cloud Run...");
          pdfBuffer = await generatePDFViaCloudRun(pdfHTML, invoiceNumber);
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
```

---

### **STEP 8: Deploy Updated Firebase Function**

```bash
cd functions
firebase deploy --only functions:sendInvoiceEmail
```

---

### **STEP 9: Test the System**

1. **Test Cloud Run directly:**
   ```bash
   curl -X POST https://pdf-service-xxxxx-uc.a.run.app/pdf \
     -H "Content-Type: application/json" \
     -d '{"html":"<h1>Test PDF</h1>","filename":"test.pdf"}' \
     --output test.pdf
   ```

2. **Test invoice system:**
   - Open your invoice system
   - Create a test invoice
   - Click "Send Invoice"
   - Check your email for PDF attachment

---

## 🔒 Security (Optional)

### Add Authentication

To restrict access to your Cloud Run service:

1. **Deploy with authentication required:**
   ```bash
   gcloud run deploy pdf-service \
     --source . \
     --no-allow-unauthenticated
   ```

2. **Update Firebase function to use service account:**
   ```javascript
   const {GoogleAuth} = require('google-auth-library');
   const auth = new GoogleAuth();
   
   const client = await auth.getIdTokenClient(CLOUD_RUN_URL);
   const response = await client.request({
     url: CLOUD_RUN_URL,
     method: 'POST',
     data: { html, filename }
   });
   ```

---

## 📊 Monitoring

### View Cloud Run Logs

```bash
gcloud run services logs read pdf-service --region us-central1
```

### View Metrics

Visit: https://console.cloud.google.com/run

- Request count
- Latency
- Error rate
- Memory usage
- CPU utilization

---

## 💰 Cost Monitoring

### Set Budget Alert

1. Go to: https://console.cloud.google.com/billing/budgets
2. Create budget alert at $5/month
3. Get email notifications if exceeded

### Check Current Usage

```bash
gcloud billing projects describe YOUR_PROJECT_ID
```

---

## 🐛 Troubleshooting

### Problem: Cloud Run deployment fails

**Solution:**
- Enable Cloud Run API: `gcloud services enable run.googleapis.com`
- Enable Container Registry: `gcloud services enable containerregistry.googleapis.com`
- Check Docker is running locally

### Problem: PDF generation timeout

**Solution:**
- Increase timeout: `--timeout 120`
- Increase memory: `--memory 2Gi`
- Simplify HTML (remove large images)

### Problem: "Permission denied" error

**Solution:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Problem: High latency on first request

**Solution:**
- This is "cold start" - normal for Cloud Run
- Set minimum instances: `--min-instances 1` (costs money)
- Or accept 2-3 second delay on first PDF

---

## 🎯 Performance Optimization

### Reduce Cold Starts

```bash
gcloud run deploy pdf-service \
  --min-instances 1  # Keeps 1 instance warm
```

**Cost:** ~$10/month for 1 always-on instance

### Increase Concurrency

```bash
gcloud run deploy pdf-service \
  --concurrency 10  # Handle 10 requests per instance
```

---

## 🔄 Updates and Maintenance

### Update the Service

1. Make changes to code
2. Redeploy:
   ```bash
   gcloud run deploy pdf-service --source .
   ```

### View Current Configuration

```bash
gcloud run services describe pdf-service --region us-central1
```

### Delete the Service

```bash
gcloud run services delete pdf-service --region us-central1
```

---

## ✅ Success Checklist

- [ ] Cloud Run service deployed
- [ ] Service URL obtained
- [ ] Firebase function updated with Cloud Run URL
- [ ] Firebase function redeployed
- [ ] Test invoice sent successfully
- [ ] PDF attachment received
- [ ] PDF opens and displays correctly
- [ ] Budget alert set up
- [ ] Documentation saved

---

## 📝 Summary

**What You Built:**
- Standalone PDF microservice on Cloud Run
- Uses Puppeteer with full Chrome
- Scales automatically (0 to many instances)
- Costs $0 for low usage
- Professional PDF invoices

**What Changed:**
- Firebase function calls Cloud Run instead of running Puppeteer locally
- PDFs generated reliably with full Chrome support
- No serverless limitations

**Next Steps:**
1. Deploy Cloud Run service
2. Update Firebase function
3. Test with real invoice
4. Monitor usage and costs

---

**Implementation Date:** February 24, 2026  
**Status:** Ready to implement  
**Estimated Setup Time:** 2-3 hours  
**Monthly Cost:** $0 (for low usage)

🎉 **This is the production-ready solution for PDF invoices!**