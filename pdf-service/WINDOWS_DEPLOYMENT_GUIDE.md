# Windows Deployment Guide for Cloud Run PDF Service

## 🪟 Windows-Specific Setup Instructions

### **STEP 1: Install Google Cloud SDK**

1. **Download the installer:**
   - Visit: https://cloud.google.com/sdk/docs/install#windows
   - Download the Google Cloud CLI installer for Windows

2. **Run the installer:**
   - Double-click `GoogleCloudSDKInstaller.exe`
   - Follow the installation wizard
   - Check "Run 'gcloud init'" at the end

3. **Initialize gcloud (if not done automatically):**
   ```powershell
   gcloud init
   ```

4. **Verify installation:**
   ```powershell
   gcloud --version
   ```

---

### **STEP 2: Authenticate with Google Cloud**

```powershell
gcloud auth login
```

This will open your browser for authentication.

---

### **STEP 3: Set Your Project**

```powershell
# List your projects
gcloud projects list

# Set the active project
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your Firebase project ID.

---

### **STEP 4: Enable Required APIs**

```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

---

### **STEP 5: Deploy to Cloud Run (PowerShell)**

Navigate to the pdf-service directory:

```powershell
cd C:\Users\Reggie\Documents\git-learning-lab\pdf-service
```

Deploy using this **single-line PowerShell command**:

```powershell
gcloud run deploy pdf-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --cpu 1 --timeout 60 --max-instances 10
```

**Or use the multi-line format with backticks (PowerShell line continuation):**

```powershell
gcloud run deploy pdf-service `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 60 `
  --max-instances 10
```

---

### **STEP 6: Deployment Process**

The deployment will:
1. ✅ Build a Docker container from your Dockerfile
2. ✅ Push it to Google Container Registry
3. ✅ Deploy to Cloud Run
4. ✅ Provide you with a service URL

**Example output:**
```
Building using Dockerfile and deploying container to Cloud Run service [pdf-service]...
✓ Creating Container Repository...
✓ Uploading sources...
✓ Building Container... Logs are available at [...]
✓ Deploying Container...
✓ Setting IAM Policy...
Done.
Service [pdf-service] revision [pdf-service-00001-abc] has been deployed.
Service URL: https://pdf-service-xxxxx-uc.a.run.app
```

**📝 SAVE THIS URL!** You'll need it for the Firebase function.

---

### **STEP 7: Test the Deployment**

#### Test with PowerShell (using Invoke-WebRequest):

```powershell
# Test health check
Invoke-WebRequest -Uri "https://pdf-service-xxxxx-uc.a.run.app/" -Method Get

# Test PDF generation
$body = @{
    html = "<h1>Test PDF</h1><p>This is a test invoice</p>"
    filename = "test.pdf"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://pdf-service-xxxxx-uc.a.run.app/pdf" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -OutFile "test.pdf"
```

#### Test with curl (if installed):

```powershell
curl -X POST https://pdf-service-xxxxx-uc.a.run.app/pdf `
  -H "Content-Type: application/json" `
  -d '{"html":"<h1>Test PDF</h1>","filename":"test.pdf"}' `
  --output test.pdf
```

---

### **STEP 8: Update Firebase Function**

Once deployed, update your `functions/index.js` with the Cloud Run URL:

```javascript
const CLOUD_RUN_URL = "https://pdf-service-xxxxx-uc.a.run.app/pdf";
```

Replace `xxxxx` with your actual Cloud Run service ID.

---

## 🔧 Common Windows Issues & Solutions

### Issue: "gcloud: command not found"

**Solution:**
- Close and reopen PowerShell after installation
- Or manually add to PATH:
  ```powershell
  $env:Path += ";C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
  ```

### Issue: PowerShell execution policy error

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Docker not found during deployment

**Solution:**
- Cloud Run builds in the cloud, you don't need Docker installed locally
- The `--source .` flag handles everything

### Issue: Permission denied errors

**Solution:**
```powershell
gcloud auth application-default login
```

---

## 📊 Monitor Your Deployment

### View logs in PowerShell:

```powershell
gcloud run services logs read pdf-service --region us-central1
```

### Open Cloud Run console:

```powershell
# Open in browser
Start-Process "https://console.cloud.google.com/run"
```

---

## 🔄 Update the Service

After making changes to your code:

```powershell
cd C:\Users\Reggie\Documents\git-learning-lab\pdf-service

gcloud run deploy pdf-service `
  --source . `
  --platform managed `
  --region us-central1
```

---

## 🗑️ Delete the Service (if needed)

```powershell
gcloud run services delete pdf-service --region us-central1
```

---

## 💰 Cost Monitoring

### Set up budget alerts:

1. Go to: https://console.cloud.google.com/billing/budgets
2. Create a budget alert at $5/month
3. Add your email for notifications

### Check current usage:

```powershell
gcloud billing projects describe YOUR_PROJECT_ID
```

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `gcloud auth login` | Authenticate with Google Cloud |
| `gcloud config set project PROJECT_ID` | Set active project |
| `gcloud run deploy pdf-service --source .` | Deploy/update service |
| `gcloud run services list` | List all services |
| `gcloud run services describe pdf-service` | Get service details |
| `gcloud run services logs read pdf-service` | View logs |
| `gcloud run services delete pdf-service` | Delete service |

---

## ✅ Checklist

- [ ] Google Cloud SDK installed
- [ ] Authenticated with `gcloud auth login`
- [ ] Project set with `gcloud config set project`
- [ ] APIs enabled (run, containerregistry, cloudbuild)
- [ ] Service deployed successfully
- [ ] Service URL saved
- [ ] Health check tested (GET /)
- [ ] PDF generation tested (POST /pdf)
- [ ] Firebase function updated with Cloud Run URL
- [ ] Budget alert configured

---

## 🆘 Need Help?

**View deployment errors:**
```powershell
gcloud run services logs read pdf-service --region us-central1 --limit 50
```

**Check service status:**
```powershell
gcloud run services describe pdf-service --region us-central1
```

**Re-authenticate:**
```powershell
gcloud auth login
gcloud auth application-default login