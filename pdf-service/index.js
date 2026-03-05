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
    const { html, filename, headerTemplate } = req.body;

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

    // Generate PDF with optional header template
    // PDF generation options
    // Note: headerTemplate has strict Puppeteer rules:
    // - No <html>, <head>, or <body> tags
    // - CSS must be inline
    // - Special classes .pageNumber/.totalPages only work in header/footer context
    const pdfOptions = {
      format: "Letter",
      printBackground: true,
      margin: {
        top: headerTemplate ? "2in" : "0.5in",  // Must be >= header visual height (including padding + border)
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      displayHeaderFooter: !!headerTemplate,
      headerTemplate: headerTemplate || "<div></div>",
      footerTemplate: "<div></div>",  // Always empty to prevent default footer
    };

    const pdf = await page.pdf(pdfOptions);

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